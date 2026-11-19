/* Testes funcionais em Chromium. Não avaliam a correção pedagógica das aulas. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.resolve(__dirname, '../test-results');
const course = JSON.parse(fs.readFileSync(path.join(root, 'course.json')));
const activities = JSON.parse(fs.readFileSync(path.join(root, 'activities.json')));
const visuals = JSON.parse(fs.readFileSync(path.join(root, 'visuals.json')));
fs.mkdirSync(output, { recursive: true });
const report = { lessons: 0, activities: 0, options: 0, visuals: 0, checks: [], externalImages: [] };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.md': 'text/plain' };
  res.setHeader('Content-Type', (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8');
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Bibliotecas com as mesmas versões do site; o teste não depende da CDN.
  const markedFile = path.join(path.dirname(require.resolve('marked')), 'marked.umd.js');
  const purifyFile = path.join(path.dirname(require.resolve('dompurify')), 'purify.min.js');
  await context.route('https://cdn.jsdelivr.net/**', route => {
    const file = route.request().url().includes('/marked@') ? markedFile : purifyFile;
    return route.fulfill({ path: file, contentType: 'text/javascript' });
  });
  // Falhas de imagem são deliberadas para testar o aviso e não confundir
  // indisponibilidade de terceiros com integridade do acervo.
  await context.route('**/*', async route => {
    const request = route.request();
    if (request.resourceType() === 'image' && !request.url().startsWith(base)) {
      report.externalImages.push(request.url());
      return route.abort();
    }
    return route.fallback();
  });
  try {
    await page.goto(base);
    await page.locator('.module-card').first().waitFor();
    assert.equal(await page.locator('.nav-lesson').count(), 52);
    await page.screenshot({ path: path.join(output, 'inicio-desktop.png') });
    await page.locator('#lesson-search').fill('semiotica');
    assert.ok(await page.locator('.nav-lesson').count() > 0);
    await page.locator('#lesson-search').fill('termo-inexistente-xyz');
    assert.equal(await page.locator('.nav-lesson').count(), 0);
    await page.locator('#lesson-search').fill('');
    await page.locator('#lesson-search').fill('sintaxe');
    assert.equal(await page.locator('.nav-lesson').count(), 1);
    assert.ok((await page.locator('.nav-lesson').innerText()).includes('Escrita para a fala'));
    await page.locator('#lesson-search').fill('');
    report.checks.push('Busca com e sem resultados, incluindo termo sem acento.');

    const openLesson = async lesson => {
      await page.goto(base + '/#/aula/' + encodeURIComponent(lesson.path));
      await page.locator('#lesson-content').waitFor();
      assert.equal(await page.locator('.lesson-title').innerText(), lesson.title);
      assert.ok((await page.locator('#lesson-content').innerText()).length > 200);
      assert.ok(!(await page.locator('#lesson-content').innerText()).includes('Não foi possível carregar o interpretador'));
    };
    for (const lesson of course.lessons) {
      await openLesson(lesson);
      const expected = activities.filter(a => a.path === lesson.path);
      assert.equal(await page.locator('.activity-card').count(), expected.length, lesson.path);
      const expectedVisuals = visuals.filter(v => v.path === lesson.path);
      assert.equal(await page.locator('.visual-card').count(), expectedVisuals.length, lesson.path);
      report.visuals += expectedVisuals.length;
      for (let i = 0; i < expected.length; i++) {
        const activity = expected[i];
        const card = page.locator('.activity-card').nth(i);
        if (!activity.type || activity.type === 'selection') {
          for (const option of activity.options) {
            const radio = card.locator('input[type=radio]');
            const index = activity.options.indexOf(option);
            await radio.nth(index).check();
            assert.ok((await card.locator('.activity-analysis').innerText()).includes(option.analysis.trim()), lesson.path + ': análise da alternativa');
            report.options++;
          }
        } else {
          if (activity.type === 'checklist') {
            await card.locator('input[type=checkbox]').first().check();
            assert.match(await card.locator('.check-count').innerText(), /^1 de /);
          }
          await card.locator('textarea').first().fill('Observação de teste: preservar a ideia.');
          // Exercita explicitamente o caminho de cópia manual.
          await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('teste')) } }); });
          await card.locator('.activity-copy').click();
          await card.locator('.activity-feedback textarea').waitFor();
          assert.ok((await card.locator('.activity-feedback textarea').inputValue()).includes('Observação de teste'));
          await card.locator('.activity-reset').click();
          assert.equal(await card.locator('textarea').first().inputValue(), '');
          if (activity.type === 'checklist') assert.match(await card.locator('.check-count').innerText(), /^0 de /);
        }
        report.activities++;
      }
      const links = page.locator('#toc [data-scroll]');
      for (const id of await links.evaluateAll(nodes => nodes.map(n => n.dataset.scroll))) {
        assert.equal(await page.locator('[id=' + JSON.stringify(id) + ']').count(), 1, 'Âncora única: ' + id);
      }
      if (lesson.code === '5.3') await page.locator('.activity-card').screenshot({ path: path.join(output, 'atividade-desktop.png') });
      // A edição pública retirou imagens externas da conversa; o teste de falha dessas imagens é obsoleto.
      assert.equal(await page.locator('.lesson-content img[src^="https://images.openai.com"]').count(), 0, lesson.path);
      report.lessons++;
    }
    report.checks.push('52 aulas abertas; todas as alternativas, fichas, checklists e visuais conferidos.');
    await openLesson(course.lessons[0]);
    const lessonURL = page.url();
    await page.locator('.skip-link').focus();
    await page.locator('.skip-link').press('Enter');
    assert.equal(page.url(), lessonURL);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'view');
    await page.locator('#completion-button').click();
    await page.reload();
    await page.locator('#completion-button.completed').waitFor();
    await page.locator('#completion-button').click();
    assert.match(await page.locator('#progress-detail').innerText(), /^0 de 52/);
    await page.locator('.brand').click();
    await page.locator('.module-card').first().waitFor();
    await page.locator('#theme-button').click();
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.screenshot({ path: path.join(output, 'inicio-escuro.png') });
    report.checks.push('Atalho de conteúdo mantém a aula; início acessível; leitura e tema persistem após recarga.');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#menu-button').click();
    assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'menu-button');
    assert.equal(await page.locator('#sidebar').evaluate(el => el.inert), true);
    await page.locator('#menu-button').click();
    await page.locator('#sidebar .side-bottom a').last().focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'brand');
    await page.locator('#menu-close').click();
    await page.locator('#theme-button').click();
    await page.screenshot({ path: path.join(output, 'inicio-celular.png') });
    for (const lesson of course.lessons) {
      await openLesson(lesson);
      const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      assert.ok(dimensions.scroll <= dimensions.width + 1, 'Página ultrapassa a tela: ' + lesson.path + ' ' + JSON.stringify(dimensions));
    }
    await openLesson(course.lessons.find(l => l.code === '5.3'));
    await page.locator('.activity-card').screenshot({ path: path.join(output, 'atividade-celular.png') });
    report.checks.push('Menu móvel, Escape, ciclo de foco e 52 aulas sem transbordamento da página em 390 px.');

    // Uma falha antiga de carregamento não pode substituir a página atual.
    const delayed = course.lessons[1];
    let release;
    const blocked = new Promise(resolve => { release = resolve; });
    let received;
    const requestReceived = new Promise(resolve => { received = resolve; });
    await page.route('**/' + delayed.path, async route => { received(); await blocked; await route.fulfill({ status: 503, body: 'teste' }); });
    await page.goto(base + '/#/aula/' + encodeURIComponent(delayed.path));
    await requestReceived;
    await page.locator('#menu-button').click();
    await page.locator('.brand').click();
    await page.locator('.module-card').first().waitFor();
    const failedResponse = page.waitForResponse(response => response.url().endsWith(delayed.path));
    release();await failedResponse;
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.module-card').count(), 5);
    report.checks.push('Resposta de erro atrasada não sobrescreve o início.');
    // Bookmarks and progress saved under the old filenames still work.
    const legacyLessons = [course.lessons[0], ...course.lessons.filter(l => ['4.1a','4.1b'].includes(l.code))];
    await page.evaluate(lessons => {
      localStorage.setItem('manual.finished', JSON.stringify(Object.fromEntries(lessons.map(l => [l.aliases[0],true]))));
    }, legacyLessons);
    await page.goto(base + '/#/aula/' + encodeURIComponent(legacyLessons[0].aliases[0]));
    await page.reload();
    await page.locator('#completion-button.completed').waitFor();
    assert.match(await page.locator('#progress-detail').innerText(), /^3 de 52/);
    for (const lesson of legacyLessons) {
      await page.goto(base + '/#/aula/' + encodeURIComponent(lesson.aliases[0]));
      await page.waitForURL(base + '/#/aula/' + encodeURIComponent(lesson.path));
      await page.getByRole('heading', {name:lesson.title,exact:true}).waitFor();
      assert.ok(await page.locator('#completion-button.completed').count());
    }
    await page.locator('#completion-button').click();
    await page.reload();
    await page.locator('#lesson-content').waitFor();
    assert.match(await page.locator('#progress-detail').innerText(), /^2 de 52/);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('manual.finished')));
    for (const lesson of legacyLessons) assert.ok(!(lesson.aliases[0] in saved));
    report.checks.push('Links antigos redirecionados; progresso migrado, inclusive das duas antigas aulas 4.1; desmarcação preservada.');
    assert.deepEqual(errors, []);
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed';report.error = error.stack;
    await page.screenshot({ path: path.join(output, 'falha.png'), fullPage: false }).catch(() => {});
    throw error;
  } finally {
    report.externalImages = [...new Set(report.externalImages)];
    fs.writeFileSync(path.join(output, 'resultado.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ ...report, externalImages: report.externalImages.length }, null, 2));
    await browser.close();server.close();
  }
})().catch(error => { console.error(error);server.close();process.exitCode = 1; });

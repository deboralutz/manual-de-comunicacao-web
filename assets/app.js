(function(){
"use strict";
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const state={parts:[],lessons:[],activities:[],visuals:[],active:null,finished:{},theme:"light"};
try{state.finished=JSON.parse(localStorage.getItem("manual.finished")||"{}")||{};state.theme=localStorage.getItem("manual.theme")||"light"}catch(e){}
if(state.theme==="dark")document.documentElement.dataset.theme="dark";
const slug=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g,"").trim().replace(/\s+/g,"-").slice(0,85);
function mark(text){if(!window.marked||!window.DOMPurify)return "<p class='notice'>Não foi possível carregar o interpretador de Markdown. Consulte o arquivo da aula diretamente no repositório.</p>";return DOMPurify.sanitize(marked.parse(text,{gfm:true,breaks:false}),{ADD_TAGS:["details","summary"],ADD_ATTR:["open"]});}
function clean(text){
 return text
 .replace(/^<!--[^]*?-->\s*/,"")
 .replace(/^Oi, Mein Licht!\s*🩵?\s*$/gmi,"")
 .replace(/^Obrigada, Mein Licht![^\n]*\n/gmi,"")
 .replace(/^# Manual de Comunicação(?: Autoral)?\s*$/gmi,"")
 .replace(/^#{1,2}\s+Aula\s+\d+\.\d+[^\n]*$/gmi,"")
 .replace(/^MANUAL DE COMUNICAÇÃO(?: AUTORAL)?\s*[·—]\s*PARTE\s+[IVX]+\s*$/gmi,"")
 .replace(/^PARTE\s+[IVX]+\s*[·—]\s*[^\n]+$/gmi,"")
 .replace(/^!\[\]\(https:\/\/www\.google\.com\/s2\/favicons\?[^)]+\)\s*$/gmi,"")
 .replace(/\n{4,}/g,"\n\n\n").trim();
}
function doneCount(){return state.lessons.filter(l=>state.finished[l.path]).length;}
function updateProgress(){const total=state.lessons.length,n=doneCount(),pc=total?Math.round(n*100/total):0;$("progress-percent").textContent=pc+"%";$("progress-fill").style.width=pc+"%";$("progress-detail").textContent=n+" de "+total+" aulas marcadas";}
const mobileLayout=window.matchMedia("(max-width:810px)");
function syncMenu(){
 const open=mobileLayout.matches&&$("sidebar").classList.contains("open");
 $("sidebar").inert=mobileLayout.matches&&!open;
 $("main").inert=open;$("toc-panel").inert=open;
 $("mobile-overlay").hidden=!open;
 $("menu-button").setAttribute("aria-expanded",String(open));
}
function closeMenu(restoreFocus=false){$("sidebar").classList.remove("open");syncMenu();if(restoreFocus)$("menu-button").focus();}
function openMenu(){$("sidebar").classList.add("open");syncMenu();$("menu-close").focus();}
function renderNav(query=""){
 const searchKey=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
 const q=searchKey(query).trim();
 const html=state.parts.map(p=>{
 const items=state.lessons.filter(l=>l.part===p.number&&(!q||searchKey(l.code+" "+l.title+" "+(l.originalTitle||"")+" "+p.name).includes(q)));
 if(!items.length)return "";
 return "<section class='nav-part'><div class='part-heading'><span>Parte "+p.number+" · "+escapeHTML(p.name)+"</span><span class='part-count'>"+items.length+"</span></div>"+items.map(l=>"<a class='nav-lesson"+(state.active===l.path?" active":"")+"' href='#/aula/"+encodeURIComponent(l.path)+"'><span class='nav-num'>"+escapeHTML(l.code)+"</span><span>"+escapeHTML(l.title)+"</span>"+(state.finished[l.path]?"<span class='nav-done' aria-label='Aula marcada'>✓</span>":"")+"</a>").join("")+"</section>";
 }).join("");
 $("nav").innerHTML=html||"<p class='empty-state'>Nenhuma aula encontrada.</p>";
}
function resetView(label){$("breadcrumbs").textContent=label;document.title=label.replace("Manual / ","")+" — Manual de Comunicação";$("toc").innerHTML="";$("reading-progress-fill").style.width="0";window.scrollTo(0,0);}
function home(){
 state.active=null;renderNav($("lesson-search").value);resetView("Manual / Início");
 const cards=state.parts.map(p=>{const arr=state.lessons.filter(l=>l.part===p.number),n=arr.filter(l=>state.finished[l.path]).length;return "<a class='module-card' href='#/aula/"+encodeURIComponent(arr[0].path)+"'><span class='module-kicker'>PARTE "+String(p.number).padStart(2,"0")+"</span><h3>"+escapeHTML(p.name)+"</h3><p>"+escapeHTML(p.subtitle)+"</p><div class='module-footer'><span>"+arr.length+" aulas · "+n+" concluídas</span><span>Explorar →</span></div></a>";}).join("");
 $("view").innerHTML="<section class='home-hero'><p class='eyebrow'>UM AMBIENTE PARA ESTUDAR E CRIAR</p><h1>Comunicar começa com o cuidado de compreender.</h1><p>Um percurso de estudo sobre linguagem, argumentação, oralidade, semiótica e autoria. Aulas completas, exemplos, atividades interativas e referências para aprofundamento.</p><div class='home-stats'><span class='stat-chip'><strong>"+state.lessons.length+"</strong> aulas</span><span class='stat-chip'><strong>5</strong> partes</span><span class='stat-chip'><strong>"+doneCount()+"</strong> marcadas neste navegador</span></div></section><div class='section-top'><h2>Trilhas de estudo</h2><a href='#/sobre'>Sobre o projeto ↗</a></div><div class='module-grid'>"+cards+"</div>";
}
function about(){
 state.active=null;renderNav($("lesson-search").value);resetView("Manual / Sobre o projeto");
 $("view").innerHTML="<div class='about'><p class='eyebrow'>SOBRE ESTE PROJETO</p><h1>Manual de Comunicação</h1><p class='lead'>Um ambiente educacional independente, desenvolvido para organizar um percurso de estudo em comunicação e apoiar a criação de conteúdos autorais.</p><h2>Proposta educacional</h2><p>O material está distribuído em cinco partes e 52 aulas. Cada parte aproxima conceitos teóricos de situações de comunicação, com exemplos, comparações, perguntas orientadoras e atividades de aplicação. A leitura pode acontecer gradualmente, sem exigir uma sequência rígida de produção de conteúdos.</p><h2>Decisões de experiência</h2><p>A navegação permite consultar aulas por número e tema. As atividades recuperadas oferecem escolhas e análises, fichas de comparação e checklists editoriais. O progresso de leitura fica registrado no navegador e não depende de uma conta. O objetivo do registro é apoiar a continuidade do estudo; não há pontuação de aprendizagem.</p><h2>Desenvolvimento e autoria</h2><p>O projeto foi desenvolvido em colaboração humano–IA. A organização do currículo, a análise editorial e a seleção das questões participam de um processo de investigação e revisão. A transposição para o site preserva os textos das aulas e reconstrói recursos visuais e interativos a partir de materiais originais, com limitações documentadas no repositório.</p><h2>Limites reconhecidos</h2><p>O Manual é um material em desenvolvimento. Não constitui curso certificado, experimento educacional ou produto testado com estudantes. Referências científicas e atribuições bibliográficas precisam ser conferidas nas fontes primárias antes da publicação de afirmações como resultados verificados. Os exercícios são didáticos, não instrumentos psicológicos validados.</p><div class='notice'>Este site é uma demonstração de organização de conteúdo e experiência de aprendizagem, preparada para portfólio. A qualidade percebida na interface e na redação não deve ser confundida com evidência de eficácia pedagógica.</div></div>";
}
function activityHTML(a,uid){
 const intro="<div class='activity-overline'>ATIVIDADE INTERATIVA</div><h3 class='activity-title'>"+escapeHTML(a.prompt||"Examine as alternativas")+"</h3>";
 if(a.type==="worksheet"){
  const fields=a.fields.map(f=>{
   if(f.type==="textarea")return "<label class='activity-field activity-text-field' for='field-"+uid+"-"+f.key+"'><span>"+escapeHTML(f.label)+"</span><textarea id='field-"+uid+"-"+f.key+"' data-key='"+escapeHTML(f.key)+"' rows='3' placeholder='"+escapeHTML(f.placeholder||"")+"'></textarea></label>";
   const choices=f.options.map(o=>"<label class='activity-choice'><input type='radio' name='field-"+uid+"-"+escapeHTML(f.key)+"' data-key='"+escapeHTML(f.key)+"' value='"+escapeHTML(o.id)+"' "+(o.id===f.defaultId?"checked":"")+"><span>"+escapeHTML(o.label)+"</span></label>").join("");
   return "<fieldset class='activity-field'><legend>"+escapeHTML(f.label)+"</legend>"+choices+"</fieldset>";
  }).join("");
  return "<section class='activity-card' data-activity='"+uid+"'>"+intro+"<div class='activity-fields'>"+fields+"</div><div class='activity-actions'><button type='button' class='soft-button activity-reset'>Limpar</button><button type='button' class='primary-button activity-copy'>Copiar observações</button></div><p class='exercise-note'>"+escapeHTML(a.caption||"Registro para reflexão e revisão.")+" Os dados preenchidos não são enviados a um servidor.</p><div class='activity-feedback' aria-live='polite'></div></section>";
 }
 if(a.type==="checklist"){
  const choices=a.items.map(o=>"<label class='activity-choice checklist-choice'><input type='checkbox' data-key='"+escapeHTML(o.id)+"'><span><b>"+escapeHTML(o.label)+"</b>"+(o.description?"<small>"+escapeHTML(o.description)+"</small>":"")+"</span></label>").join("");
  return "<section class='activity-card' data-activity='"+uid+"'>"+intro+"<div class='check-status'><span class='check-count'>0 de "+a.items.length+" itens</span><div class='check-track'><div class='check-fill' style='width:0%'></div></div></div><div class='activity-fields'>"+choices+"</div><label class='activity-field activity-text-field' for='notes-"+uid+"'><span>Pendência ou observação</span><textarea id='notes-"+uid+"' data-key='notes' rows='3' placeholder='Registre o que ainda precisa ser conferido, se houver.'></textarea></label><div class='activity-actions'><button type='button' class='soft-button activity-reset'>Limpar</button><button type='button' class='primary-button activity-copy'>Copiar conferência</button></div><p class='exercise-note'>"+escapeHTML(a.caption||"A marcação é um apoio editorial, não uma certificação.")+"</p><div class='activity-feedback' aria-live='polite'></div></section>";
 }
 const options=a.options||[],selected=options.find(o=>o.id===a.defaultId)||options[0];
 const choices=options.map((o,k)=>"<label class='activity-choice'><input type='radio' name='exercise-"+uid+"' value='"+escapeHTML(o.id)+"' "+(o.id===(selected&&selected.id)?"checked":"")+"><span>"+escapeHTML(o.label||("Alternativa "+(k+1)))+"</span></label>").join("");
 const analysis=selected?.analysis||"",statement=selected?.frase||"";
 return "<section class='activity-card' data-activity='"+uid+"'>"+intro+"<fieldset>"+choices+"</fieldset><div class='activity-analysis' aria-live='polite'><strong>ANÁLISE</strong>"+(statement?"<p><b>"+escapeHTML(statement)+"</b></p>":"")+"<p>"+escapeHTML(analysis).replace(/\n/g,"<br>")+"</p></div><p class='exercise-note'>Selecione uma alternativa para comparar interpretações. O exercício não atribui pontuação.</p></section>";
}
function bindActivity(node,a){
 if(!a.type||a.type==="selection"){
  node.addEventListener("change",ev=>{
   if(!ev.target.matches("input[type=radio]"))return;
   const opt=a.options.find(o=>o.id===ev.target.value);if(!opt)return;
   node.querySelector(".activity-analysis").innerHTML="<strong>ANÁLISE</strong>"+(opt.frase?"<p><b>"+escapeHTML(opt.frase)+"</b></p>":"")+"<p>"+escapeHTML(opt.analysis||"").replace(/\n/g,"<br>")+"</p>";
  });
  return;
 }
 function recalc(){
  if(a.type!=="checklist")return;
  const n=node.querySelectorAll("input[type=checkbox]:checked").length,t=a.items.length;
  node.querySelector(".check-count").textContent=n+" de "+t+" itens";
  node.querySelector(".check-fill").style.width=Math.round(100*n/t)+"%";
 }
 node.addEventListener("change",recalc);
 node.querySelector(".activity-reset").addEventListener("click",()=>{
  node.querySelectorAll("input[type=radio]").forEach(input=>{const f=a.fields?.find(x=>x.key===input.dataset.key);input.checked=!!f&&input.value===f.defaultId;});
  node.querySelectorAll("input[type=checkbox]").forEach(input=>input.checked=false);
  node.querySelectorAll("textarea").forEach(input=>input.value="");
  node.querySelector(".activity-feedback").textContent="Campos limpos.";recalc();
 });
 node.querySelector(".activity-copy").addEventListener("click",async()=>{
  const lines=[a.prompt||"Registro da atividade"];
  if(a.type==="checklist"){
   a.items.forEach(item=>{const checked=Array.from(node.querySelectorAll("input[type=checkbox]")).find(x=>x.dataset.key===item.id)?.checked;lines.push((checked?"[x] ":"[ ] ")+item.label+(item.description?" — "+item.description:""));});
   lines.push("Observações: "+(node.querySelector("textarea")?.value.trim()||"Nenhuma registrada."));
  }else{
   a.fields.forEach(f=>{
    let val="";
    if(f.type==="textarea")val=node.querySelector("textarea[data-key='"+f.key+"']")?.value.trim()||"Nenhuma registrada";
    else{const input=node.querySelector("input[type=radio][data-key='"+f.key+"']:checked");val=f.options.find(o=>o.id===input?.value)?.label||"Não selecionado";}
    lines.push(f.label+" "+val);
   });
  }
  const txt=lines.join("\n"),feedback=node.querySelector(".activity-feedback");
  try{await navigator.clipboard.writeText(txt);feedback.textContent="Registro copiado.";}catch(e){
   feedback.replaceChildren();
   const label=document.createElement("label"),field=document.createElement("textarea");
   label.className="activity-field activity-text-field";
   label.textContent="Selecione e copie o registro abaixo (Ctrl+C ou ⌘C).";
   field.readOnly=true;field.rows=6;field.value=txt;
   label.appendChild(field);feedback.appendChild(label);field.focus();field.select();
  }
 });
}
function injectActivities(content,lesson){
 const acts=state.activities.filter(a=>a.path===lesson.path);
 acts.forEach((a,k)=>{
  const uid=lesson.code.replace(".","-")+"-"+k,wrap=document.createElement("div");wrap.innerHTML=activityHTML(a,uid);
  const node=wrap.firstElementChild;
  let heading=null;
  if(a.anchor)heading=Array.from(content.querySelectorAll("h2,h3,h4")).find(x=>slug(x.textContent)===slug(a.anchor)||slug(x.textContent).includes(slug(a.anchor)));
  if(heading){let next=heading.nextElementSibling;while(next&&!/H[123]/.test(next.tagName))next=next.nextElementSibling;content.insertBefore(node,next||null);}else content.appendChild(node);
  bindActivity(node,a);
 });
}
function injectVisuals(content,lesson){
 const visuals=state.visuals.filter(v=>v.path===lesson.path);
 visuals.forEach(v=>{
  const figure=document.createElement("figure");
  figure.className="visual-card";
  const safe=window.DOMPurify?DOMPurify.sanitize(v.html||"",{USE_PROFILES:{html:true,svg:true,svgFilters:true}}):"";
  figure.innerHTML="<h4>"+escapeHTML(v.title||"Ilustração didática")+"</h4><div class='visual-body'>"+safe+"</div><figcaption>"+escapeHTML(v.caption||"")+"</figcaption>";
  const paragraph=v.afterText?Array.from(content.querySelectorAll("p")).find(x=>x.textContent.includes(v.afterText)):null;
  if(paragraph){paragraph.after(figure);return;}
  const heading=v.anchor?Array.from(content.querySelectorAll("h2,h3,h4")).find(x=>slug(x.textContent)===slug(v.anchor)||slug(x.textContent).includes(slug(v.anchor))):null;
  if(heading)heading.after(figure);else content.appendChild(figure);
 });
}
function bindImages(content){
 content.querySelectorAll("img").forEach(img=>{
  if(img.src.includes("/favicons"))return;
  const unavailable=()=>{
   if(!img.isConnected||img.hidden)return;
   const note=document.createElement("span");note.className="image-unavailable";
   note.textContent="Imagem indisponível"+(img.alt?": "+img.alt:".");
   img.hidden=true;img.after(note);
  };
  img.addEventListener("error",unavailable,{once:true});
  if(img.complete&&img.naturalWidth===0)unavailable();
 });
}
function makeToc(content){
 const headings=Array.from(content.querySelectorAll("h2,h3")).filter(h=>!h.closest(".activity-card"));
 const ids=new Map();
 $("toc").innerHTML=headings.map(h=>{
  let id=slug(h.textContent)||"secao";const k=(ids.get(id)||0)+1;ids.set(id,k);if(k>1)id=id+"-"+k;
  h.id=id;return "<a href='#' data-scroll='"+escapeHTML(id)+"' class='"+(h.tagName==="H3"?"toc-sub":"")+"'>"+escapeHTML(h.textContent)+"</a>";
 }).join("");
 $("toc").querySelectorAll("[data-scroll]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();const h=document.getElementById(a.dataset.scroll);if(h)h.scrollIntoView({behavior:"smooth",block:"start"});}));
}
async function lessonView(path){
 const lesson=state.lessons.find(l=>l.path===path);if(!lesson){home();return;}
 state.active=path;renderNav($("lesson-search").value);resetView("Manual / Parte "+lesson.part+" / "+lesson.code);
 $("view").innerHTML="<p class='notice'>Abrindo a aula…</p>";
 try{
  const res=await fetch(lesson.path);if(!res.ok)throw Error("HTTP "+res.status);
  let md=clean(await res.text());
  // A abertura recebe título e metadados próprios; evita repetir um título de aula no corpo.
  const html=mark(md);
  const prev=state.lessons[state.lessons.indexOf(lesson)-1],next=state.lessons[state.lessons.indexOf(lesson)+1];
  const page="<article><header><p class='lesson-label'>PARTE "+String(lesson.part).padStart(2,"0")+" · AULA "+escapeHTML(lesson.code)+"</p><h1 class='lesson-title'>"+escapeHTML(lesson.title)+"</h1><p class='lesson-subtitle'>"+escapeHTML(state.parts.find(p=>p.number===lesson.part).name)+"</p></header><div class='lesson-toolbar'><span class='tag'>Leitura integral</span><span class='tag'>Estudo independente</span><span class='toolbar-spacer'></span><button id='completion-button' class='primary-button"+(state.finished[lesson.path]?" completed":"")+"'>"+(state.finished[lesson.path]?"✓ Marcada como lida":"Marcar como lida")+"</button></div><div class='lesson-content' id='lesson-content'>"+html+"</div><nav class='lesson-pagination'>"+(prev?"<a href='#/aula/"+encodeURIComponent(prev.path)+"'><small>← AULA ANTERIOR</small><strong>"+escapeHTML(prev.code+" — "+prev.title)+"</strong></a>":"<span></span>")+(next?"<a href='#/aula/"+encodeURIComponent(next.path)+"'><small>PRÓXIMA AULA →</small><strong>"+escapeHTML(next.code+" — "+next.title)+"</strong></a>":"<span></span>")+"</nav></article>";
  // Avoid applying results if the user navigated elsewhere during the request.
  if(location.hash!=="#/aula/"+encodeURIComponent(path))return;
  $("view").innerHTML=page;
  injectActivities($("lesson-content"),lesson);
  injectVisuals($("lesson-content"),lesson);
  bindImages($("lesson-content"));
  makeToc($("lesson-content"));
  document.title=lesson.code+" — "+lesson.title+" | Manual de Comunicação";
  $("completion-button").addEventListener("click",()=>{
   if(state.finished[path])delete state.finished[path];else state.finished[path]=true;
   try{localStorage.setItem("manual.finished",JSON.stringify(state.finished));}catch(e){}
   $("completion-button").textContent=state.finished[path]?"✓ Marcada como lida":"Marcar como lida";
   $("completion-button").classList.toggle("completed",!!state.finished[path]);updateProgress();renderNav($("lesson-search").value);
  });
 }catch(err){if(location.hash!=="#/aula/"+encodeURIComponent(path))return;$("view").innerHTML="<div class='notice'><strong>Não foi possível abrir esta aula.</strong><p>O site requer acesso aos arquivos de texto. Caso esteja usando um arquivo local, abra a pasta com um servidor estático.</p><p><a href='"+escapeHTML(lesson.path)+"' target='_blank' rel='noopener'>Abrir o arquivo Markdown ↗</a></p></div>";}
}
function onRoute(){
 closeMenu();
 const hash=location.hash||"#/";
 if(hash.startsWith("#/aula/")){
  let p="";try{p=decodeURIComponent(hash.slice(7));}catch(e){}
  const lesson=state.lessons.find(l=>l.path===p||(l.aliases||[]).includes(p));
  if(lesson&&lesson.path!==p){p=lesson.path;history.replaceState(null,"",location.pathname+location.search+"#/aula/"+encodeURIComponent(p));}
  lessonView(p);
 }
 else if(hash==="#/sobre")about();
 else home();
}
function onScroll(){
 if(!state.active)return;
 const top=window.scrollY, available=document.documentElement.scrollHeight-window.innerHeight;
 $("reading-progress-fill").style.width=(available>0?Math.max(0,Math.min(100,top/available*100)):0)+"%";
}
async function init(){
 $("menu-button").addEventListener("click",openMenu);
 $("menu-close").addEventListener("click",()=>closeMenu(true));
 $("mobile-overlay").addEventListener("click",()=>closeMenu(true));
 mobileLayout.addEventListener("change",()=>closeMenu());syncMenu();
 document.querySelector(".skip-link").addEventListener("click",e=>{e.preventDefault();$("view").focus();$("view").scrollIntoView({block:"start"});});
 document.addEventListener("keydown",e=>{
  if(!mobileLayout.matches||!$("sidebar").classList.contains("open"))return;
  if(e.key==="Escape"){e.preventDefault();closeMenu(true);return;}
  if(e.key!=="Tab")return;
  const controls=Array.from($("sidebar").querySelectorAll("a[href],button,input")).filter(el=>el.getClientRects().length);
  const first=controls[0],last=controls[controls.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
 $("lesson-search").addEventListener("input",e=>renderNav(e.target.value));
 $("theme-button").addEventListener("click",()=>{state.theme=state.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=state.theme;try{localStorage.setItem("manual.theme",state.theme)}catch(e){}});
 window.addEventListener("hashchange",onRoute);window.addEventListener("scroll",onScroll,{passive:true});
 try{
  const [manifest,activities,visuals]=await Promise.all([fetch("course.json").then(r=>{if(!r.ok)throw Error("Falha no índice");return r.json()}),fetch("activities.json").then(r=>r.ok?r.json():[]).catch(()=>[]),fetch("visuals.json").then(r=>r.ok?r.json():[]).catch(()=>[])]);
  state.parts=manifest.parts;state.lessons=manifest.lessons;state.activities=activities;state.visuals=visuals;
  // Keep reading progress when lesson files are renamed.
  if(!state.finished||typeof state.finished!=="object"||Array.isArray(state.finished))state.finished={};
  let migrated=false;
  state.lessons.forEach(lesson=>(lesson.aliases||[]).forEach(alias=>{
   if(!Object.prototype.hasOwnProperty.call(state.finished,alias))return;
   if(state.finished[alias]&&!Object.prototype.hasOwnProperty.call(state.finished,lesson.path))state.finished[lesson.path]=true;
   delete state.finished[alias];migrated=true;
  }));
  if(migrated)try{localStorage.setItem("manual.finished",JSON.stringify(state.finished));}catch(e){}
  updateProgress();onRoute();
 }catch(e){$("view").innerHTML="<div class='notice'><h2>Não foi possível carregar o índice</h2><p>Abra este site a partir de um servidor web. Consulte também o <a href='INDICE.md'>índice em Markdown</a>.</p></div>";}
}
init();
})();

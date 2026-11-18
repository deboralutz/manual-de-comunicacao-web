# Executar e publicar a edição web

Esta é a edição pública independente do Manual de Comunicação. O site está preparado para publicação na **raiz** deste repositório; o repositório original de desenvolvimento não é necessário para executar a interface.

## Visualizar localmente

Com Git e Python instalados:

```bash
git clone https://github.com/deboralutz/manual-de-comunicacao-web.git
cd manual-de-comunicacao-web
python3 -m http.server 8080
```

Abra `http://localhost:8080/`. O navegador precisa carregar os arquivos Markdown e JSON por HTTP e obter as bibliotecas de Markdown/sanitização e fontes hospedadas externamente.

## Publicar pelo GitHub Pages

A configuração proposta é: **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**.

Não há necessidade de compilar o site. Depois da ativação, o GitHub informa o endereço de publicação na própria página de Pages. Verifique esse endereço antes de anunciá-lo como público e funcional.

## Conferência antes da divulgação

- Conferir as 52 páginas e as 19 atividades, inclusive seus comentários e os recursos gráficos.
- Testar busca, navegação, teclado, modo escuro, progresso local, retomada e leitura em dispositivos móveis.
- Revisar conteúdo bibliográfico e direitos de trechos de terceiros.
- Confirmar a acessibilidade em leitores de tela e dispositivos reais.
- Verificar funcionamento das bibliotecas externas, links e referências.

Esta edição exclui a pasta `fontes-originais/` e não importa o histórico do repositório de desenvolvimento. Isso não altera retroativamente a exposição pública ou as cópias já realizadas do repositório anterior.

## Direitos de uso

Consulte [LICENSE.md](LICENSE.md). A publicação do código e dos materiais no GitHub não significa, por si só, licença aberta.

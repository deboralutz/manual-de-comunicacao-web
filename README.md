# Manual de Comunicação

> Como transformar aquilo que pensamos em algo que outra pessoa possa compreender?

Edição web independente de um projeto de estudo sobre linguagem, comunicação, argumentação, oralidade, semiótica e autoria. O site reúne textos, exemplos e atividades para leitura e experimentação em um ambiente navegável.

**52 aulas · 5 partes temáticas · 19 atividades interativas recuperadas · 4 recursos visuais de apoio**

## Explorar o conteúdo

- [Índice das 52 aulas](INDICE.md)
- [Apresentação do projeto e decisões de design](PORTFOLIO.md)
- [Como executar e publicar o site](PUBLICACAO.md)

O site apresenta busca por aula ou assunto, navegação por partes, modo claro/escuro, índice interno das aulas e marcação de leituras. O progresso fica salvo **somente no navegador**, sem login ou envio de respostas.

As atividades são exercícios didáticos, com comentários e possibilidades de revisão; não são instrumentos de avaliação validados, nem geram nota ou certificado.

## Abrir localmente

O projeto é um site estático em **HTML, CSS e JavaScript**. Com Python instalado, na raiz do repositório:

```bash
python3 -m http.server 8080
```

Acesse `http://localhost:8080/`. Não abra o arquivo `index.html` diretamente pelo protocolo `file://`, pois o navegador pode impedir a leitura dos arquivos Markdown e JSON. Para o funcionamento completo, é necessária conexão com a internet para as bibliotecas e fontes de interface carregadas externamente.

## Estrutura

```text
index.html             Entrada do site
assets/                Interface (CSS e JavaScript)
course.json            Estrutura das partes e das aulas
activities.json        Atividades recuperadas
visuals.json           Diagramas e recursos visuais
parte-01-fundamentos/  Aulas da Parte I
parte-02-argumentacao/ Aulas da Parte II
parte-03-oralidade/    Aulas da Parte III
parte-04-semiotica/    Aulas da Parte IV
parte-05-autoria/      Aulas da Parte V
INDICE.md              Índice legível no GitHub
PORTFOLIO.md           Contexto e decisões do projeto
PUBLICACAO.md          Uso local e publicação
LICENSE.md             Direitos autorais e condições de uso
```

## Origem e limites

O conteúdo nasceu de um processo independente de estudo e elaboração com apoio de IA. Esta edição foi preparada a partir dos materiais revisados para a interface web, **sem importar o histórico Git ou os arquivos brutos das conversas** do acervo original.

A edição é um **protótipo educacional e de portfólio em desenvolvimento**. As referências bibliográficas, atribuições e eventuais resultados científicos ainda precisam ser conferidos em fontes primárias. Não há validação da eficácia pedagógica, pesquisa formal com estudantes, auditoria completa de acessibilidade nem certificação institucional. As imagens externas incorporadas às aulas foram retiradas nesta edição; links textuais para fontes podem permanecer.

A existência de um conceito, hipótese ou estudo em uma aula não implica comprovação independente nem endosso automático.

## Direitos de uso

[Direitos autorais e condições de uso](LICENSE.md). A publicação deste repositório não concede, por si só, uma licença aberta para reutilização do código ou dos materiais. Materiais de terceiros permanecem sujeitos aos direitos de seus titulares.

**Desenvolvimento:** Débora Lutz · 2026.

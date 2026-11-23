# Matriz de Design Instrucional — Aula 1.3: Mal-entendidos

**Projeto:** Manual de Comunicação · edição web independente  
**Estado:** piloto formativo publicado em novembro de 2026  
**Fonte de conteúdo:** [Aula 1.3](../parte-01-fundamentos/1.03-mal-entendidos.md)  
**Experiência:** [Uma frase, duas interpretações](../experiencias/aula-1-3-mal-entendidos.html)

## Delimitação

A experiência reaproveita dois casos do texto original: a conversa entre duas amigas, iniciada por “Tu estás muito quieta hoje”, e a declaração “Eu só estava tentando ajudar”. O primeiro caso é apresentado parcialmente para permitir uma leitura inicial e, em seguida, complementado com a intenção de preocupação **explicitamente descrita pela narradora**. Trata-se de uma situação ilustrativa, não de um experimento sobre pessoas reais.

A oportunidade pedagógica identificada foi transformar a discussão teórica da Parte I em prática de interpretação, revisão de hipótese e escrita livre. Não há evidências de que os estudantes atuais tenham dificuldade nesse assunto; o piloto é uma hipótese de design a avaliar.

## Objetivo integrador

Diante de uma interação cotidiana, distinguir informações disponíveis de interpretações sobre intenção e significado; reconsiderar a análise com novo contexto e formular uma pergunta que permita esclarecimento sem pressupor causas não estabelecidas.

| ID | Ação observável | Evidência | Critério | Limite |
|---|---|---|---|---|
| OA1 — Distinguir | Avaliar o recorte inicial | Escolha entre interpretações | Identificar reação que sugere recepção da fala como cobrança, sem presumir a intenção da primeira amiga | Reconhecimento em uma cena, não domínio geral |
| OA2 — Reavaliar | Analisar a cena ampliada | Nova escolha comentada | Conservar simultaneamente intenção narrada de cuidado e interpretação da outra amiga; não confundir intenção e efeito | Contexto de uma narrativa ilustrativa |
| OA3 — Formular | Produzir pergunta própria | Campo de escrita revisável | A pergunta esclarece o sentido da fala, evita pressupor hostilidade e permite outras informações | Sem correção automática nem certificação |
| OA4 — Transferir | Aplicar a distinção a uma segunda frase | Escolha comentada | Identificar uma declaração de intenção que não prova adequação do comportamento | Transferência próxima, não resultado em situações reais |

## Percurso

1. **Observar:** ler duas falas sem o contexto completo, selecionar uma interpretação e conferir uma justificativa específica.
2. **Reconsiderar:** conhecer as demais falas e a intenção narrada; avaliar o que se altera no julgamento.
3. **Formular:** escrever uma pergunta esclarecedora, conferir três critérios, comparar com exemplo opcional e revisar o texto.
4. **Transferir:** examinar “Eu só estava tentando ajudar” e distinguir o alcance da declaração de intenção.

O feedback é exibido **depois** da escolha; a pessoa pode mudar de resposta e conferir novamente. A pergunta livre é editável mesmo após a comparação. O exercício não gera pontos, notas, diagnósticos ou certificados.

## Decisões de implementação

Para esta primeira publicação, a atividade funciona em **página HTML independente vinculada à aula 1.3**, com link de volta ao Manual. A decisão evita alterar o renderizador geral de `activities.json` e preserva as 19 atividades já existentes. O protótipo utiliza HTML/CSS/JavaScript sem bibliotecas externas; o texto preenchido não é enviado a um servidor e deixa de existir ao fechar ou atualizar a página, salvo se o próprio participante copiá-lo.

A estimativa inicial de duração é 5–8 minutos e não foi validada com estudantes. As quatro decisões pedagógicas devem ser avaliadas por revisão editorial, testes com leitores e observação da experiência real de aprendizagem.

## Limites e próximos passos

A página demonstra uma solução de Design Instrucional, mas ainda não comprova eficácia pedagógica nem acessibilidade integral. Antes de expandir para outras aulas, revisar leitura com tecnologias assistivas, contraste, compreensão das instruções, qualidade dos feedbacks e relevância da escrita livre. Uma integração futura ao renderizador do curso pode ser estudada depois dessa avaliação.

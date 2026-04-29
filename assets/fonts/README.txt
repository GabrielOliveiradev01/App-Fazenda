TIPOGRAFIA — Knapp (principal)
================================

Por que a Knapp não aparece no site automaticamente?
- A família Knapp é comercial, vendida pela Bloom Type:
  https://bloomtype.com/fonts/knapp/
- Não existe download gratuito legal nem pacote no Google Fonts.
- O CSS do projeto usa primeiro "Knapp" instalada no seu computador (local)
  e, se não houver, cai em Georgia (similaridade editorial).

Como usar a Knapp de verdade no app (após comprar a licença web):
1. Na Bloom Type, adquira a licença que permita @font-face / hospedagem própria.
2. Exporte ou receba os arquivos .woff2 (recomendado para web).
3. Coloque os arquivos nesta pasta: assets/fonts/
4. Em css/styles.css, nos blocos @font-face de 'Knapp', adicione por exemplo:
   src: url('../assets/fonts/Knapp-Light.woff2') format('woff2');
   (um @font-face por peso/estilo, conforme os nomes dos ficheiros que receber.)

Inter e Arial
- Inter: carregada pelo Google Fonts no index.html (gratuita).
- Arial: fallback de sistema no CSS (newsletters, plataformas sem webfonts).

Referência: Manual da marca Vista Verde — tipografia.

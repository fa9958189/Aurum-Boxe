# Mídia da experiência Aurum

Esta pasta concentra os assets usados pela narrativa visual da home. A sequência ativa fica em `media/aurum/hero/`:

- `scene-01-guard.jpg`: os dois atletas em guarda, antes da ação.
- `scene-02-punch.jpg`: o atacante inicia o direto e projeta o corpo.
- `scene-03-dodge.jpg`: o defensor sai da linha do golpe; também é o poster desktop do hero.
- `scene-04-impact.jpg`: aproximação final da luva, sem perder a esquiva e o ringue.
- `hero-mobile.jpg`: composição vertical específica do hero, mantendo os dois atletas visíveis.
- `hero-scene.mp4` (futuro): caminho reservado para um vídeo curto opcional do hero.

Para trocar uma fase da narrativa, mantenha o mesmo nome e proporção 16:9 do arquivo correspondente. Os quatro quadros são declarados no bloco `.story-stage` de `index.html` e animados por `ScrollTrigger` em `js/script.js`; assim, a arte pode ser atualizada sem refazer a timeline.

Para ativar o vídeo futuro, substitua apenas o `<picture class="hero-scene">` em `index.html` por um `<video>` com `media/aurum/hero/hero-scene.mp4` como `src` e preserve `scene-03-dodge.jpg` como `poster`. A narrativa pinada deve continuar usando os quatro JPGs, pois eles garantem controle preciso e um fallback leve no scroll.

Os antigos `hero-boxers.jpg` e `hero-boxers-mobile.jpg` permanecem na raiz desta pasta somente como versões anteriores e não são mais carregados pela home.

- `arena-cinematica.png`: cenário alternativo da arena, mantido para outras composições.
- `luva-impacto.png`: recorte alternativo de luva, mantido para outras composições.
- `atleta-acao.jpg` (futuro): foto horizontal de atleta/guarda para a seção “Treine como um campeão”. Até a troca, a seção usa as fotos reais existentes em `Fotos/`.

Mantenha nomes simples, arquivos otimizados para web e um fallback estático para cada vídeo.

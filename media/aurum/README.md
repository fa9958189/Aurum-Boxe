# Mídia da experiência Aurum

Esta pasta concentra os assets visuais da home. A imagem ativa do hero e as alternativas arquivadas ficam em `media/aurum/hero/`:

- `scene-01-guard.jpg`: imagem desktop ativa do hero, com os dois atletas em guarda.
- `scene-02-punch.jpg`: quadro alternativo arquivado do início do golpe.
- `scene-03-dodge.jpg`: quadro alternativo arquivado da esquiva.
- `scene-04-impact.jpg`: quadro alternativo arquivado da aproximação da luva.
- `hero-mobile.jpg`: composição vertical específica do hero, mantendo os dois atletas visíveis.
- `hero-scene.mp4` (futuro): caminho reservado para um vídeo curto opcional do hero.

Para trocar a imagem principal no desktop, substitua `scene-01-guard.jpg` mantendo o nome e a proporção 16:9. No mobile, substitua `hero-mobile.jpg` mantendo a composição vertical.

Para ativar o vídeo futuro, substitua apenas o `<picture class="hero-scene">` em `index.html` por um `<video>` com `media/aurum/hero/hero-scene.mp4` como `src` e preserve `scene-01-guard.jpg` como poster. Após o hero, a página segue diretamente para o ringue interativo da seção `#experiencia`.

Os antigos `hero-boxers.jpg` e `hero-boxers-mobile.jpg` permanecem na raiz desta pasta somente como versões anteriores e não são mais carregados pela home.

- `arena-cinematica.png`: cenário alternativo da arena, mantido para outras composições.
- `luva-impacto.png`: recorte alternativo de luva, mantido para outras composições.
- `atleta-acao.jpg` (futuro): foto horizontal de atleta/guarda para a seção “Treine como um campeão”. Até a troca, a seção usa as fotos reais existentes em `Fotos/`.

Mantenha nomes simples, arquivos otimizados para web e um fallback estático para cada vídeo.

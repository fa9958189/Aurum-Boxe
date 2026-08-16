# Mídia da experiência Aurum

Esta pasta concentra os assets usados pela narrativa visual da home.

- `hero-boxers.jpg`: cena horizontal usada no hero e na narrativa imersiva em desktop/tablet (ideal: 16:9, mínimo 1920 px).
- `hero-boxers-mobile.jpg`: composição vertical própria para mobile, mantendo os dois atletas visíveis.
- `hero-boxers.mp4` (futuro): caminho reservado para um vídeo curto da mesma ação. Para ativá-lo, substitua o `<picture class="hero-scene">` em `index.html` por um vídeo com este arquivo como `src` e mantenha `hero-boxers.jpg` como `poster`.
- `arena-cinematica.png`: cenário alternativo da arena, mantido para outras composições.
- `luva-impacto.png`: recorte alternativo de luva, mantido para outras composições.
- `atleta-acao.jpg` (futuro): foto horizontal de atleta/guarda para a seção “Treine como um campeão”. Até a troca, a seção usa as fotos reais existentes em `Fotos/`.

A cena principal agora é um asset único com os dois atletas. Isso evita a sensação de braço ou luva solta. Mantenha nomes simples, arquivos otimizados para web e um fallback estático para cada vídeo.

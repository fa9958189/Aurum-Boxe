(() => {
  'use strict';

  const body = document.body;
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

  body.classList.add('js-ready');

  // Header e navegação mobile
  const siteHeader = document.getElementById('siteHeader');
  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');

  const setMenuState = (open) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.classList.toggle('open', open);
    body.classList.toggle('menu-open', open);
  };

  menuButton?.addEventListener('click', () => {
    setMenuState(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      setMenuState(false);
      menuButton.focus();
    }
  });

  // Animações de entrada progressivas
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  // Estado ativo da navegação
  const navigationLinks = [...document.querySelectorAll('.desktop-nav a')];
  const navigationTargets = navigationLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && navigationTargets.length) {
    const navigationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigationLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-36% 0px -52% 0px', threshold: 0.01 });

    navigationTargets.forEach((section) => navigationObserver.observe(section));
  }

  const hero = document.getElementById('inicio');

  // Partículas leves da arena
  const particleCanvas = document.getElementById('particleCanvas');
  let particleFrame = 0;

  if (particleCanvas && !reducedMotion) {
    const context = particleCanvas.getContext('2d');
    let particles = [];
    let canvasWidth = 0;
    let canvasHeight = 0;
    let heroVisible = true;

    const makeParticles = () => {
      const count = Math.max(18, Math.min(42, Math.floor(canvasWidth / 38)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: Math.random() * 1.3 + 0.35,
        speed: Math.random() * 0.18 + 0.05,
        drift: (Math.random() - 0.5) * 0.09,
        alpha: Math.random() * 0.34 + 0.08
      }));
    };

    const resizeParticles = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvasWidth = particleCanvas.clientWidth;
      canvasHeight = particleCanvas.clientHeight;
      particleCanvas.width = Math.floor(canvasWidth * ratio);
      particleCanvas.height = Math.floor(canvasHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      makeParticles();
    };

    const renderParticles = () => {
      if (!heroVisible) {
        particleFrame = 0;
        return;
      }

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      particles.forEach((particle) => {
        context.beginPath();
        context.fillStyle = `rgba(238, 201, 118, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();

        particle.y -= particle.speed;
        particle.x += particle.drift;
        if (particle.y < -4) {
          particle.y = canvasHeight + 4;
          particle.x = Math.random() * canvasWidth;
        }
      });

      particleFrame = window.requestAnimationFrame(renderParticles);
    };

    resizeParticles();
    particleFrame = window.requestAnimationFrame(renderParticles);
    window.addEventListener('resize', resizeParticles, { passive: true });

    if ('IntersectionObserver' in window && hero) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible && !particleFrame) particleFrame = window.requestAnimationFrame(renderParticles);
      }, { threshold: 0.02 });
      heroObserver.observe(hero);
    }
  }

  // Narrativa cinematográfica controlada pelo scroll
  const story = document.querySelector('.scroll-story');
  const storySticky = story?.querySelector('.story-sticky');
  const storyFrames = [...document.querySelectorAll('[data-story-frame]')];
  const storyScenes = [...document.querySelectorAll('[data-story-scene]')];
  const storySteps = [...document.querySelectorAll('.story-progress li')];
  const impactRings = story?.querySelector('.story-impact-rings');
  const storyVignetteGlow = story?.querySelector('.story-vignette');
  let currentScene = -1;
  let scrollTicking = false;

  const setActiveScene = (index) => {
    if (index === currentScene) return;
    currentScene = index;
    storyScenes.forEach((scene, sceneIndex) => scene.classList.toggle('active', sceneIndex === index));
    storySteps.forEach((step, stepIndex) => step.classList.toggle('active', stepIndex === index));
  };

  const setFallbackFrame = (index) => {
    storyFrames.forEach((frame, frameIndex) => frame.classList.toggle('active', frameIndex === index));
  };

  const updateHeaderAndHero = () => {
    const scrollY = window.scrollY;
    siteHeader?.classList.toggle('is-scrolled', scrollY > 24);

    if (hero && !reducedMotion) {
      hero.style.setProperty('--hero-scene-y', `${Math.min(scrollY * 0.035, 30)}px`);
    }

    if (story?.classList.contains('story-fallback') && !reducedMotion) {
      const rect = story.getBoundingClientRect();
      const scrollable = Math.max(story.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-rect.top / scrollable);
      const sceneIndex = Math.min(storyScenes.length - 1, Math.floor(progress * storyScenes.length));
      setActiveScene(Math.max(0, sceneIndex));
      setFallbackFrame(Math.max(0, sceneIndex));

      if (impactRings) {
        const impactProgress = clamp((progress - 0.78) / 0.22);
        impactRings.style.opacity = String(impactProgress * 0.72);
        impactRings.style.transform = `scale(${0.35 + impactProgress * 0.9})`;
      }
    }

    scrollTicking = false;
  };

  const requestScrollUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateHeaderAndHero);
  };

  setActiveScene(0);
  setFallbackFrame(reducedMotion ? 2 : 0);

  if (story && storySticky && storyFrames.length === 4 && !reducedMotion && window.gsap && window.ScrollTrigger) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    root.classList.add('gsap-story');

    gsap.set(storyFrames, { autoAlpha: 0, scale: 1.015 });
    gsap.set(storyFrames[0], { autoAlpha: 1 });
    gsap.set(impactRings, { autoAlpha: 0, scale: 0.35, transformOrigin: '50% 50%' });

    const storyTimeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: story,
        start: 'top top',
        end: () => `+=${window.innerHeight * (window.innerWidth <= 600 ? 3.2 : 4.2)}`,
        pin: storySticky,
        scrub: window.innerWidth <= 600 ? 0.35 : 0.75,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          const sceneIndex = Math.min(3, Math.floor(progress * 4));
          setActiveScene(sceneIndex);
        }
      }
    });

    storyTimeline
      .addLabel('guard', 0)
      .to(storyFrames[0], { scale: 1.025, duration: 0.7 }, 0)
      .addLabel('punch', 0.72)
      .to(storyFrames[0], { autoAlpha: 0, duration: 0.28 }, 0.72)
      .fromTo(storyFrames[1], { autoAlpha: 0, scale: 1.015 }, { autoAlpha: 1, scale: 1.028, duration: 0.42 }, 0.72)
      .to(storyFrames[1], { xPercent: -0.35, duration: 0.58 }, 0.95)
      .addLabel('dodge', 1.55)
      .to(storyFrames[1], { autoAlpha: 0, duration: 0.3 }, 1.55)
      .fromTo(storyFrames[2], { autoAlpha: 0, scale: 1.02 }, { autoAlpha: 1, scale: 1.035, duration: 0.44 }, 1.55)
      .to(storyFrames[2], { xPercent: -0.45, duration: 0.58 }, 1.82)
      .addLabel('impact', 2.45)
      .to(storyFrames[2], { autoAlpha: 0, duration: 0.32 }, 2.45)
      .fromTo(storyFrames[3], { autoAlpha: 0, scale: 1.025 }, { autoAlpha: 1, scale: window.innerWidth <= 600 ? 1.045 : 1.075, duration: 0.72 }, 2.45)
      .to(impactRings, { autoAlpha: 0.62, scale: 1.18, duration: 0.6 }, 2.56)
      .to(storyVignetteGlow, { '--impact-glow': 0.42, duration: 0.55 }, 2.6)
      .to({}, { duration: 0.3 });
  } else if (story && !reducedMotion) {
    story.classList.add('story-fallback');
  }

  updateHeaderAndHero();
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });

  // Ringue interativo da experiência Aurum
  const experiencePoints = [
    {
      id: 1,
      title: 'Metodologia Olímpica',
      description: 'Fundamentos consistentes, progressão técnica e leitura estratégica do boxe.',
      tag: 'Base · Técnica · Tática',
      symbol: '✦'
    },
    {
      id: 2,
      title: 'Treino técnico',
      description: 'Movimentos treinados com intenção, correção e qualidade em cada repetição.',
      tag: '',
      symbol: '◎'
    },
    {
      id: 3,
      title: 'Estratégia e disciplina',
      description: 'Foco para tomar decisões melhores dentro e fora do ringue.',
      tag: '',
      symbol: '◇'
    },
    {
      id: 4,
      title: 'Alto condicionamento',
      description: 'Resistência, coordenação e potência construídas com progressão segura.',
      tag: '',
      symbol: '↗'
    },
    {
      id: 5,
      title: 'Ambiente premium',
      description: 'Uma atmosfera que eleva o foco e transforma o treino em ritual.',
      tag: '',
      symbol: 'A'
    },
    {
      id: 6,
      title: 'Acompanhamento próximo',
      description: 'Orientação atenta para evoluir no seu ritmo e com segurança.',
      tag: '',
      symbol: '＋'
    }
  ];

  const experienceRing = document.querySelector('[data-experience-ring]');
  const interactiveRing = experienceRing?.querySelector('[data-interactive-ring]');
  const ringScene = experienceRing?.querySelector('[data-ring-scene]');
  const experiencePanel = experienceRing?.querySelector('.experience-panel');
  const experienceHotspots = [...(experienceRing?.querySelectorAll('[data-experience-point]') || [])];
  const experienceIndexButtons = [...(experienceRing?.querySelectorAll('[data-experience-index]') || [])];

  if (experienceRing && interactiveRing && ringScene && experiencePanel && experienceHotspots.length === experiencePoints.length) {
    const panelNumber = experiencePanel.querySelector('[data-panel-number]');
    const panelSymbol = experiencePanel.querySelector('[data-panel-symbol]');
    const panelTitle = experiencePanel.querySelector('[data-panel-title]');
    const panelDescription = experiencePanel.querySelector('[data-panel-description]');
    const panelTag = experiencePanel.querySelector('[data-panel-tag]');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let pinnedExperienceIndex = 0;
    let displayedExperienceIndex = -1;
    let panelTransitionTimer = 0;
    let ringPointerFrame = 0;

    const updateExperiencePanel = (index, animate = true) => {
      const point = experiencePoints[index];
      if (!point) return;

      experienceHotspots.forEach((hotspot, hotspotIndex) => {
        const selected = hotspotIndex === index;
        hotspot.classList.toggle('is-active', selected);
        hotspot.setAttribute('aria-selected', String(selected));
        hotspot.setAttribute('tabindex', selected ? '0' : '-1');
      });

      experienceIndexButtons.forEach((button, buttonIndex) => {
        const selected = buttonIndex === index;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-selected', String(selected));
        button.setAttribute('tabindex', selected ? '0' : '-1');
      });

      if (index === displayedExperienceIndex) return;
      displayedExperienceIndex = index;
      window.clearTimeout(panelTransitionTimer);
      if (animate && !reducedMotion) experiencePanel.classList.add('is-changing');

      panelTransitionTimer = window.setTimeout(() => {
        if (panelNumber) panelNumber.textContent = String(point.id).padStart(2, '0');
        if (panelSymbol) panelSymbol.textContent = point.symbol;
        if (panelTitle) panelTitle.textContent = point.title;
        if (panelDescription) panelDescription.textContent = point.description;
        if (panelTag) panelTag.textContent = point.tag;
        experiencePanel.style.setProperty('--panel-progress', `${((index + 1) / experiencePoints.length) * 100}%`);
        experiencePanel.setAttribute('aria-label', `${String(point.id).padStart(2, '0')} — ${point.title}`);
        experiencePanel.classList.remove('is-changing');
      }, animate && !reducedMotion ? 120 : 0);
    };

    const pinExperiencePoint = (index, focusTarget = false) => {
      pinnedExperienceIndex = index;
      updateExperiencePanel(index);
      if (focusTarget) experienceHotspots[index]?.focus();
    };

    const handleExperienceKeys = (event, index) => {
      const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % experiencePoints.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + experiencePoints.length) % experiencePoints.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = experiencePoints.length - 1;
      pinExperiencePoint(nextIndex, true);
    };

    experienceHotspots.forEach((hotspot, index) => {
      const point = experiencePoints[index];
      hotspot.setAttribute('aria-label', `${String(point.id).padStart(2, '0')} — ${point.title}`);
      hotspot.addEventListener('mouseenter', () => updateExperiencePanel(index));
      hotspot.addEventListener('mouseleave', () => updateExperiencePanel(pinnedExperienceIndex));
      hotspot.addEventListener('focus', () => updateExperiencePanel(index));
      hotspot.addEventListener('blur', () => updateExperiencePanel(pinnedExperienceIndex));
      hotspot.addEventListener('click', () => pinExperiencePoint(index));
      hotspot.addEventListener('keydown', (event) => handleExperienceKeys(event, index));
    });

    experienceIndexButtons.forEach((button, index) => {
      const point = experiencePoints[index];
      button.setAttribute('aria-label', `${String(point.id).padStart(2, '0')} — ${point.title}`);
      button.setAttribute('aria-controls', 'experiencePanel');
      button.addEventListener('click', () => pinExperiencePoint(index));
      button.addEventListener('keydown', (event) => handleExperienceKeys(event, index));
    });

    updateExperiencePanel(0, false);

    const gsap = window.gsap;
    const rotateRingX = gsap ? gsap.quickTo(ringScene, 'rotationX', { duration: 0.75, ease: 'power3.out' }) : null;
    const rotateRingY = gsap ? gsap.quickTo(ringScene, 'rotationY', { duration: 0.75, ease: 'power3.out' }) : null;
    const moveRingX = gsap ? gsap.quickTo(ringScene, 'x', { duration: 0.8, ease: 'power3.out' }) : null;
    const moveRingY = gsap ? gsap.quickTo(ringScene, 'y', { duration: 0.8, ease: 'power3.out' }) : null;

    if (gsap) gsap.set(ringScene, { transformPerspective: 1100, transformOrigin: '50% 55%' });

    interactiveRing.addEventListener('pointermove', (event) => {
      if (reducedMotion || !finePointer.matches) return;
      if (ringPointerFrame) window.cancelAnimationFrame(ringPointerFrame);
      ringPointerFrame = window.requestAnimationFrame(() => {
        const rect = interactiveRing.getBoundingClientRect();
        const pointerX = clamp((event.clientX - rect.left) / rect.width);
        const pointerY = clamp((event.clientY - rect.top) / rect.height);
        const normalizedX = (pointerX - 0.5) * 2;
        const normalizedY = (pointerY - 0.5) * 2;

        interactiveRing.style.setProperty('--spotlight-x', `${(pointerX * 100).toFixed(2)}%`);
        interactiveRing.style.setProperty('--spotlight-y', `${(pointerY * 100).toFixed(2)}%`);

        if (rotateRingX && rotateRingY && moveRingX && moveRingY) {
          rotateRingX(normalizedY * -1.4);
          rotateRingY(normalizedX * 1.8);
          moveRingX(normalizedX * 4);
          moveRingY(normalizedY * 3);
        } else {
          ringScene.style.transform = `rotateX(${normalizedY * -1.4}deg) rotateY(${normalizedX * 1.8}deg) translate3d(${normalizedX * 4}px, ${normalizedY * 3}px, 0)`;
        }
      });
    });

    interactiveRing.addEventListener('pointerleave', () => {
      interactiveRing.style.setProperty('--spotlight-x', '50%');
      interactiveRing.style.setProperty('--spotlight-y', '42%');
      updateExperiencePanel(pinnedExperienceIndex);
      if (rotateRingX && rotateRingY && moveRingX && moveRingY) {
        rotateRingX(0);
        rotateRingY(0);
        moveRingX(0);
        moveRingY(0);
      } else {
        ringScene.style.transform = '';
      }
    });

    if (!reducedMotion && gsap && window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
      const experienceIntro = document.querySelector('[data-experience-intro]');
      const ringRopes = experienceRing.querySelectorAll('.ring-rope');
      const entranceTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: experienceRing,
          start: 'top 78%',
          once: true
        }
      });

      entranceTimeline
        .from(experienceIntro, { autoAlpha: 0, y: 32, duration: 0.55, ease: 'power3.out' })
        .from(interactiveRing, { autoAlpha: 0, y: 42, scale: 0.965, duration: 0.68, ease: 'power3.out' }, '-=0.2')
        .fromTo(ringRopes, { strokeDasharray: 900, strokeDashoffset: 900, autoAlpha: 0.12 }, { strokeDashoffset: 0, autoAlpha: 0.74, duration: 0.72, stagger: 0.08, ease: 'power2.out' }, '-=0.34')
        .from(experienceHotspots, { autoAlpha: 0, scale: 0.25, duration: 0.42, stagger: 0.07, ease: 'back.out(1.5)' }, '-=0.38')
        .from(experiencePanel, { autoAlpha: 0, x: 24, duration: 0.48, ease: 'power3.out' }, '-=0.25');
    }
  }

  // Os quatro rounds da transformação
  const transformationRounds = [
    {
      id: 1,
      slug: 'tecnica',
      title: 'Técnica',
      phrase: 'Precisão antes da força.',
      description: 'Cada movimento é construído para ser mais limpo, eficiente e consciente.',
      imageQuote: 'Antes do golpe, existe a decisão.'
    },
    {
      id: 2,
      slug: 'foco',
      title: 'Foco',
      phrase: 'Presença em cada decisão.',
      description: 'Aprender a ler, reagir e manter a mente presente mesmo quando a intensidade aumenta.',
      imageQuote: 'A luta começa antes do primeiro golpe.'
    },
    {
      id: 3,
      slug: 'constancia',
      title: 'Constância',
      phrase: 'Evolução construída no tempo.',
      description: 'A repetição certa transforma técnica em instinto e esforço em progresso real.',
      imageQuote: 'Campeões são construídos round após round.'
    },
    {
      id: 4,
      slug: 'performance',
      title: 'Performance',
      phrase: 'O resultado do processo.',
      description: 'Potência, resistência, velocidade e decisão aparecem quando toda a preparação trabalha em conjunto.',
      imageQuote: 'O resultado aparece quando o processo é respeitado.'
    }
  ];

  const transformationSection = document.querySelector('[data-transformation]');
  const transformationVisual = transformationSection?.querySelector('[data-transformation-visual]');
  const transformationImage = transformationSection?.querySelector('[data-transformation-image]');
  const transformationTabs = [...(transformationSection?.querySelectorAll('[data-transformation-round]') || [])];
  const transformationPanel = transformationSection?.querySelector('.transformation-panel');

  if (transformationSection && transformationVisual && transformationImage && transformationPanel && transformationTabs.length === transformationRounds.length) {
    const roundProgress = transformationPanel.querySelector('[data-round-progress]');
    const roundTitle = transformationPanel.querySelector('[data-round-title]');
    const roundPhrase = transformationPanel.querySelector('[data-round-phrase]');
    const roundDescription = transformationPanel.querySelector('[data-round-description]');
    const photoRound = transformationVisual.querySelector('[data-photo-round]');
    const photoLabel = transformationVisual.querySelector('[data-photo-label]');
    const photoQuote = transformationVisual.querySelector('[data-photo-quote]');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let pinnedRoundIndex = 0;
    let displayedRoundIndex = -1;
    let roundTransitionTimer = 0;
    let photoPointerFrame = 0;

    const updateTransformationRound = (index, animate = true) => {
      const round = transformationRounds[index];
      if (!round) return;

      transformationSection.dataset.activeRound = round.slug;
      transformationTabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.setAttribute('tabindex', selected ? '0' : '-1');
      });

      if (index === displayedRoundIndex) return;
      displayedRoundIndex = index;
      window.clearTimeout(roundTransitionTimer);
      if (animate && !reducedMotion) transformationPanel.classList.add('is-changing');

      roundTransitionTimer = window.setTimeout(() => {
        const number = String(round.id).padStart(2, '0');
        if (roundProgress) roundProgress.textContent = `${number} / 04`;
        if (roundTitle) roundTitle.textContent = round.title;
        if (roundPhrase) roundPhrase.textContent = round.phrase;
        if (roundDescription) roundDescription.textContent = round.description;
        if (photoRound) photoRound.textContent = `Round ${number}`;
        if (photoLabel) photoLabel.textContent = `${number} · ${round.title}`;
        if (photoQuote) photoQuote.textContent = round.imageQuote;
        transformationPanel.setAttribute('aria-labelledby', transformationTabs[index].id);
        transformationPanel.setAttribute('aria-label', `${number} de 04 — ${round.title}`);
        transformationPanel.classList.remove('is-changing');
      }, animate && !reducedMotion ? 120 : 0);
    };

    const pinTransformationRound = (index, focusTarget = false) => {
      pinnedRoundIndex = index;
      updateTransformationRound(index);
      if (focusTarget) transformationTabs[index]?.focus();
    };

    const handleTransformationKeys = (event, index) => {
      const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % transformationRounds.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + transformationRounds.length) % transformationRounds.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = transformationRounds.length - 1;
      pinTransformationRound(nextIndex, true);
    };

    transformationTabs.forEach((tab, index) => {
      const round = transformationRounds[index];
      tab.setAttribute('aria-label', `Round ${String(round.id).padStart(2, '0')} — ${round.title}`);
      tab.addEventListener('mouseenter', () => updateTransformationRound(index));
      tab.addEventListener('mouseleave', () => updateTransformationRound(pinnedRoundIndex));
      tab.addEventListener('focus', () => updateTransformationRound(index));
      tab.addEventListener('blur', () => updateTransformationRound(pinnedRoundIndex));
      tab.addEventListener('click', () => pinTransformationRound(index));
      tab.addEventListener('keydown', (event) => handleTransformationKeys(event, index));
    });

    updateTransformationRound(0, false);

    transformationVisual.addEventListener('pointermove', (event) => {
      if (reducedMotion || !finePointer.matches) return;
      if (photoPointerFrame) window.cancelAnimationFrame(photoPointerFrame);
      photoPointerFrame = window.requestAnimationFrame(() => {
        const rect = transformationVisual.getBoundingClientRect();
        const pointerX = clamp((event.clientX - rect.left) / rect.width);
        const pointerY = clamp((event.clientY - rect.top) / rect.height);
        const normalizedX = (pointerX - 0.5) * 2;
        const normalizedY = (pointerY - 0.5) * 2;

        transformationVisual.style.setProperty('--photo-x', `${(pointerX * 100).toFixed(2)}%`);
        transformationVisual.style.setProperty('--photo-y', `${(pointerY * 100).toFixed(2)}%`);
        transformationVisual.style.setProperty('--photo-shift-x', `${(normalizedX * -4).toFixed(2)}px`);
        transformationVisual.style.setProperty('--photo-shift-y', `${(normalizedY * -3).toFixed(2)}px`);
        transformationVisual.classList.add('is-pointer-active');
      });
    });

    transformationVisual.addEventListener('pointerleave', () => {
      transformationVisual.style.setProperty('--photo-x', '50%');
      transformationVisual.style.setProperty('--photo-y', '50%');
      transformationVisual.style.setProperty('--photo-shift-x', '0px');
      transformationVisual.style.setProperty('--photo-shift-y', '0px');
      transformationVisual.classList.remove('is-pointer-active');
    });

    if (!reducedMotion && window.gsap && window.ScrollTrigger) {
      const gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);
      const transformationHeader = transformationSection.querySelector('.transformation-header');
      const transformationEntryTabs = transformationSection.querySelectorAll('.transformation-tabs button');

      gsap.timeline({
        scrollTrigger: {
          trigger: transformationSection,
          start: 'top 78%',
          once: true
        }
      })
        .from(transformationVisual, { autoAlpha: 0, x: -28, duration: 0.62, ease: 'power3.out' })
        .from(transformationHeader.children, { autoAlpha: 0, y: 22, duration: 0.46, stagger: 0.08, ease: 'power3.out' }, '-=0.32')
        .from(transformationEntryTabs, { autoAlpha: 0, y: 12, duration: 0.34, stagger: 0.06, ease: 'power2.out' }, '-=0.18')
        .from(transformationPanel, { autoAlpha: 0, x: 18, duration: 0.44, ease: 'power3.out' }, '-=0.2');
    }
  }

  // FAQ acessível
  const faqItems = [...document.querySelectorAll('.faq-item')];
  faqItems.forEach((item) => {
    const button = item.querySelector('button');
    if (!button) return;

    button.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove('open');
        otherItem.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });

      if (willOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Vídeo da estrutura em modal nativo
  const videoDialog = document.getElementById('videoDialog');
  const arenaVideo = document.getElementById('arenaVideo');
  const videoOpenButton = document.querySelector('[data-video-open]');
  const videoCloseButton = document.querySelector('[data-video-close]');

  const stopArenaVideo = () => {
    if (!arenaVideo) return;
    arenaVideo.pause();
    arenaVideo.currentTime = 0;
  };

  videoOpenButton?.addEventListener('click', () => {
    if (!videoDialog || !arenaVideo) return;
    const source = arenaVideo.querySelector('source[data-src]');
    if (source && !source.src) {
      source.src = source.dataset.src;
      arenaVideo.load();
    }
    videoDialog.showModal();
    arenaVideo.play().catch(() => {});
  });

  videoCloseButton?.addEventListener('click', () => videoDialog?.close());
  videoDialog?.addEventListener('close', stopArenaVideo);
  videoDialog?.addEventListener('click', (event) => {
    if (event.target === videoDialog) videoDialog.close();
  });

  const currentYear = document.getElementById('currentYear');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  window.addEventListener('beforeunload', () => {
    if (particleFrame) window.cancelAnimationFrame(particleFrame);
  });
})();

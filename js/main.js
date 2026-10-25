/* =========================================================
   RICK & MORTY — ARQUIVO MULTIVERSAL C-137
   Interactions, canvas starfield, synthetic SFX and data.
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  const body = document.body;
  const header = $("#siteHeader");
  const nav = $("#primaryNav");
  const menuToggle = $("#menuToggle");
  const scrollProgress = $("#scrollProgress");
  const portalTransition = $("#portalTransition");

  /* =======================================================
     STARFIELD
     ======================================================= */

  const canvas = $("#starfield");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let stars = [];
  let shootingStar = null;
  let starfieldWidth = 0;
  let starfieldHeight = 0;
  let starfieldDpr = 1;
  let nextShootingStar = performance.now() + 6000;
  let starfieldFrame = 0;

  function createStars() {
    const count = clamp(Math.floor((starfieldWidth * starfieldHeight) / 8200), 70, 250);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * starfieldWidth,
      y: Math.random() * starfieldHeight,
      radius: Math.random() * 1.25 + 0.2,
      alpha: Math.random() * 0.6 + 0.15,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.035 + 0.01,
      depth: Math.random() * 0.75 + 0.25,
      green: Math.random() > 0.72
    }));
  }

  function resizeStarfield() {
    if (!canvas || !ctx) return;
    starfieldDpr = Math.min(window.devicePixelRatio || 1, 2);
    starfieldWidth = window.innerWidth;
    starfieldHeight = window.innerHeight;
    canvas.width = Math.floor(starfieldWidth * starfieldDpr);
    canvas.height = Math.floor(starfieldHeight * starfieldDpr);
    canvas.style.width = `${starfieldWidth}px`;
    canvas.style.height = `${starfieldHeight}px`;
    ctx.setTransform(starfieldDpr, 0, 0, starfieldDpr, 0, 0);
    createStars();
    if (prefersReducedMotion.matches) drawStarfield(0, true);
  }

  function drawStarfield(time, staticFrame = false) {
    if (!ctx) return;
    ctx.clearRect(0, 0, starfieldWidth, starfieldHeight);

    for (const star of stars) {
      const twinkle = 0.72 + Math.sin(time * 0.0011 + star.twinkle) * 0.28;
      const alpha = clamp(star.alpha * twinkle, 0.04, 0.92);
      ctx.beginPath();
      ctx.fillStyle = star.green
        ? `rgba(200, 255, 177, ${alpha})`
        : `rgba(237, 244, 255, ${alpha * 0.85})`;
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      if (!staticFrame) {
        star.y += star.speed * star.depth;
        star.x += star.speed * 0.24;
        if (star.y > starfieldHeight + 4) star.y = -4;
        if (star.x > starfieldWidth + 4) star.x = -4;
      }
    }

    if (!staticFrame && time > nextShootingStar) {
      shootingStar = {
        x: Math.random() * starfieldWidth * 0.72,
        y: Math.random() * starfieldHeight * 0.34,
        length: Math.random() * 95 + 85,
        speed: Math.random() * 7 + 9,
        life: 1
      };
      nextShootingStar = time + Math.random() * 10000 + 8000;
    }

    if (shootingStar) {
      const gradient = ctx.createLinearGradient(
        shootingStar.x,
        shootingStar.y,
        shootingStar.x - shootingStar.length,
        shootingStar.y - shootingStar.length * 0.42
      );
      gradient.addColorStop(0, `rgba(226, 255, 202, ${shootingStar.life * 0.8})`);
      gradient.addColorStop(1, "rgba(226, 255, 202, 0)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(shootingStar.x, shootingStar.y);
      ctx.lineTo(
        shootingStar.x - shootingStar.length,
        shootingStar.y - shootingStar.length * 0.42
      );
      ctx.stroke();

      shootingStar.x += shootingStar.speed;
      shootingStar.y += shootingStar.speed * 0.42;
      shootingStar.life -= 0.018;
      if (shootingStar.life <= 0 || shootingStar.x > starfieldWidth + 150) {
        shootingStar = null;
      }
    }
  }

  function starfieldLoop(time) {
    drawStarfield(time);
    starfieldFrame = window.requestAnimationFrame(starfieldLoop);
  }

  function startStarfield() {
    if (!canvas || !ctx) return;
    resizeStarfield();
    if (prefersReducedMotion.matches) {
      drawStarfield(0, true);
      return;
    }
    if (!starfieldFrame) starfieldFrame = window.requestAnimationFrame(starfieldLoop);
  }

  startStarfield();
  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resizeStarfield();
      if (prefersReducedMotion.matches) drawStarfield(0, true);
    }, 160);
  });

  prefersReducedMotion.addEventListener?.("change", () => {
    if (prefersReducedMotion.matches) {
      if (starfieldFrame) {
        window.cancelAnimationFrame(starfieldFrame);
        starfieldFrame = 0;
      }
      drawStarfield(0, true);
    } else if (!starfieldFrame) {
      starfieldFrame = window.requestAnimationFrame(starfieldLoop);
    }
  });

  /* =======================================================
     PORTAL SPARKS
     ======================================================= */

  const sparkHost = $("#portalSparks");
  if (sparkHost) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 18; i += 1) {
      const spark = document.createElement("span");
      const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.3;
      const radius = 30 + Math.random() * 24;
      spark.style.left = `${50 + Math.cos(angle) * radius}%`;
      spark.style.top = `${50 + Math.sin(angle) * radius}%`;
      spark.style.setProperty("--delay", `${(Math.random() * 3.6).toFixed(2)}s`);
      spark.style.width = `${(Math.random() * 2.2 + 1.6).toFixed(1)}px`;
      spark.style.height = spark.style.width;
      fragment.appendChild(spark);
    }
    sparkHost.appendChild(fragment);
  }

  /* =======================================================
     HEADER, SCROLL PROGRESS & ACTIVE NAV
     ======================================================= */

  let scrollTicking = false;

  function updateScrollUI() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? clamp((scrollTop / docHeight) * 100, 0, 100) : 0;

    if (scrollProgress) scrollProgress.style.width = `${progress}%`;
    if (header) header.classList.toggle("is-scrolled", scrollTop > 18);
    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(updateScrollUI);
      }
    },
    { passive: true }
  );
  updateScrollUI();

  const navLinks = $$(".nav-link", nav);
  const observedSections = $$("main section[id]");

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveNav(visible[0].target.id);
      },
      { rootMargin: "-34% 0px -54% 0px", threshold: [0, 0.15, 0.5] }
    );
    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  /* =======================================================
     MOBILE MENU
     ======================================================= */

  let menuOpen = false;
  const mainContent = $("#conteudo");
  const siteFooter = $(".site-footer");

  function setMenu(open) {
    if (!nav || !menuToggle) return;
    menuOpen = open;
    nav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    $(".sr-only", menuToggle).textContent = open ? "Fechar menu" : "Abrir menu";
    body.classList.toggle("is-locked", open);
    if (mainContent) mainContent.inert = open;
    if (siteFooter) siteFooter.inert = open;
    if (open) {
      const firstLink = $(".nav-link", nav);
      window.setTimeout(() => firstLink?.focus(), 220);
    }
  }

  menuToggle?.addEventListener("click", () => setMenu(!menuOpen));

  $(".site-header .brand")?.addEventListener("click", () => {
    if (menuOpen) setMenu(false);
  });

  $$(".nav-link, .nav-cta", nav).forEach((item) => {
    item.addEventListener("click", () => {
      if (menuOpen) setMenu(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      setMenu(false);
      menuToggle?.focus();
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 1025px)");
  desktopQuery.addEventListener?.("change", (event) => {
    if (event.matches && menuOpen) setMenu(false);
  });

  /* =======================================================
     SCROLL REVEALS
     ======================================================= */

  const revealElements = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -9% 0px", threshold: 0.08 }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  /* =======================================================
     CHARACTER FILTERS & TILT
     ======================================================= */

  const filterButtons = $$(".filter__btn");
  const characterCards = $$(".character");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";

      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      characterCards.forEach((card, index) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.hidden = !show;
        card.classList.remove("is-entering");
        if (show) {
          card.classList.add("is-visible");
          window.setTimeout(() => {
            card.classList.add("is-entering");
            window.setTimeout(() => card.classList.remove("is-entering"), 450);
          }, index * 35);
        }
      });
    });
  });

  if (finePointer.matches && !prefersReducedMotion.matches) {
    characterCards.forEach((card) => {
      let raf = 0;
      let targetRx = 0;
      let targetRy = 0;

      const renderTilt = () => {
        card.style.setProperty("--rx", `${targetRx.toFixed(2)}deg`);
        card.style.setProperty("--ry", `${targetRy.toFixed(2)}deg`);
        raf = 0;
      };

      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        targetRx = -y * 4.5;
        targetRy = x * 5.5;
        if (!raf) raf = window.requestAnimationFrame(renderTilt);
      });

      card.addEventListener("pointerleave", () => {
        targetRx = 0;
        targetRy = 0;
        if (!raf) raf = window.requestAnimationFrame(renderTilt);
      });
    });
  }

  /* =======================================================
     DIMENSION SCANNER
     ======================================================= */

  const dimensions = {
    c137: {
      code: "C-137",
      sub: "TERRA",
      name: "Terra C-137",
      status: "LINHA ESTÁVEL",
      desc: "A linha principal. Onde Rick construiu a portal gun, a família Smith tenta manter a rotina e o jantar de domingo sobrevive entre uma invasão alienígena e outra.",
      chaos: 72,
      tech: 98,
      survival: 41,
      threat: "MÉDIO",
      coords: "C-137 · 35.41 / 139.41",
      accent: "#b8ff3f"
    },
    cronenberg: {
      code: "CRON.",
      sub: "ZONA 09",
      name: "Mundo Cronenberg",
      status: "QUARENTENA",
      desc: "Um erro de cálculo, um soro do amor e uma cidade inteira de monstros. A antiga C-137 virou um lembrete pegajoso de que nem todo experimento tem volta.",
      chaos: 96,
      tech: 31,
      survival: 12,
      threat: "CRÍTICO",
      coords: "C-137-B · 00.00 / 00.00",
      accent: "#ffb13b"
    },
    citadel: {
      code: "CIT.",
      sub: "POCKET",
      name: "Cidadela dos Ricks",
      status: "ACESSO RESTRITO",
      desc: "Milhares de Ricks, uma burocracia intergaláctica e uma hierarquia construída sobre ego. O lugar perfeito para descobrir que o maior inimigo de um Rick é outro Rick.",
      chaos: 88,
      tech: 96,
      survival: 27,
      threat: "ALTO",
      coords: "CITADELA · 77.02 / 12.19",
      accent: "#7fe8ff"
    },
    froopyland: {
      code: "FROOPY",
      sub: "PARQUE",
      name: "Froopyland",
      status: "NÃO RECOMENDADO",
      desc: "O paraíso que Beth criou quando criança. Arco-íris, doces e criaturas que sorriem demais. Não deixe a fofura enganar você.",
      chaos: 61,
      tech: 77,
      survival: 18,
      threat: "FOFURA LETAL",
      coords: "FROOPYLAND · 02.13 / 88.44",
      accent: "#ff7ab8"
    }
  };

  const dimensionTabs = $$(".dimension-tab");
  const scanner = $("#dimensionPanel");
  const scannerStatus = $("#scannerStatus");
  const radarCode = $("#radarCode");
  const radarSub = $("#radarSub");
  const dimensionName = $("#dimensionName");
  const dimensionDesc = $("#dimensionDesc");
  const dimensionThreat = $("#dimensionThreat");
  const dimensionCoords = $("#dimensionCoords");
  const metricNodes = $$("[data-metric-bar]");

  let activeDimension = "c137";

  function setDimension(key, focusTab = false) {
    const data = dimensions[key];
    if (!data || !scanner) return;

    activeDimension = key;
    scanner.style.setProperty("--dim", data.accent);
    scanner.style.borderColor = `${data.accent}33`;

    dimensionTabs.forEach((tab) => {
      const active = tab.dataset.dim === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });

    if (scannerStatus) scannerStatus.textContent = data.status;
    if (radarCode) radarCode.textContent = data.code;
    if (radarSub) radarSub.textContent = data.sub;
    if (dimensionName) dimensionName.textContent = data.name;
    if (dimensionDesc) dimensionDesc.textContent = data.desc;
    if (dimensionThreat) {
      dimensionThreat.textContent = data.threat;
      dimensionThreat.style.color = data.accent;
    }
    if (dimensionCoords) dimensionCoords.textContent = data.coords;

    metricNodes.forEach((bar) => {
      const metric = bar.dataset.metricBar;
      const value = data[metric];
      bar.style.width = `${value}%`;
      const valueNode = $(`[data-metric-value="${metric}"]`);
      if (valueNode) valueNode.textContent = `${value}%`;
    });

    const activeTab = dimensionTabs.find((tab) => tab.dataset.dim === key);
    if (scanner && activeTab) scanner.setAttribute("aria-labelledby", activeTab.id);
  }

  dimensionTabs.forEach((tab) => {
    tab.addEventListener("click", () => setDimension(tab.dataset.dim));
    tab.addEventListener("keydown", (event) => {
      const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      const currentIndex = dimensionTabs.indexOf(tab);
      let nextIndex = currentIndex;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % dimensionTabs.length;
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + dimensionTabs.length) % dimensionTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = dimensionTabs.length - 1;
      }

      const nextTab = dimensionTabs[nextIndex];
      setDimension(nextTab.dataset.dim, true);
    });
  });

  if (dimensionTabs.length) setDimension("c137");

  /* =======================================================
     EPISODE DATA & MODAL
     ======================================================= */

  const episodes = {
    "rick-potion": {
      code: "S01E06",
      badge: "ESSENCIAL",
      title: "Rick Potion #9",
      synopsis:
        "Rick cria um soro do amor para Morty impressionar Jessica. O experimento dá terrivelmente errado, transforma boa parte da C-137 em monstros e obriga os dois a tomar uma decisão que muda a série para sempre.",
      why:
        "É a virada de chave de Rick and Morty: pela primeira vez, as consequências são permanentes. O episódio estabelece que este não é um desenho sobre resetar tudo no final.",
      quote: "O amor é uma reação química. Infelizmente, ninguém leu o rótulo.",
      tags: ["Cronenberg", "C-137", "Consequência", "Temporada 1"]
    },
    "total-rickall": {
      code: "S02E04",
      badge: "FAMÍLIA?",
      title: "Total Rickall",
      synopsis:
        "A casa dos Smiths é invadida por parentes e amigos que ninguém se lembra de ter conhecido. Quanto mais a família tenta separar memórias reais de parasitas, mais difícil fica confiar uns nos outros.",
      why:
        "Uma aula de comédia e paranoia. O episódio cria personagens memoráveis, brinca com a própria estrutura da sitcom e ainda encontra espaço para um dos momentos mais emotivos da série.",
      quote: "Família é quem está na mesa. Mesmo que ninguém lembre de ter convidado.",
      tags: ["Parasitas", "Memória", "Humor", "Temporada 2"]
    },
    ricklantis: {
      code: "S03E07",
      badge: "VIRADA",
      title: "The Ricklantis Mixup",
      synopsis:
        "Enquanto Rick e Morty investigam o desaparecimento de um Rick, a Cidadela se prepara para sua primeira eleição. A política intergaláctica nunca foi tão parecida com a nossa.",
      why:
        "Muda a escala da série e apresenta uma das histórias mais ambiciosas do desenho. É o episódio que transforma a Cidadela em personagem — e reconfigura o futuro da série.",
      quote: "Toda sociedade tem seus segredos. A Cidadela tem andares inteiros deles.",
      tags: ["Cidadela", "Política", "Evil Morty", "Temporada 3"]
    },
    "vat-of-acid": {
      code: "S04E08",
      badge: "ENGENHOSO",
      title: "The Vat of Acid Episode",
      synopsis:
        "Depois de uma discussão sobre planos de fuga, Rick constrói um tanque de ácido como solução universal. O que começa como piada vira uma das narrativas mais elaboradas da série.",
      why:
        "Estrutura impecável, humor e uma surpresa que só funciona no formato de TV. É Rick and Morty no auge da engenhosidade — e da crueldade narrativa.",
      quote: "O plano mais elaborado do multiverso começou com um tanque de ácido.",
      tags: ["Tanque de ácido", "Estrutura", "Caos", "Temporada 4"]
    },
    "pickle-rick": {
      code: "S03E03",
      badge: "ICÔNICO",
      title: "Pickle Rick",
      synopsis:
        "Rick se transforma em um pepino para evitar a terapia familiar. Preso no jardim, ele precisa sobreviver a ratos, agências secretas e à própria teimosia para chegar à sessão.",
      why:
        "Um dos episódios mais citados da série. Equilibra ação absurda com uma crítica afiada à dificuldade de Rick de encarar seus sentimentos — e virou fenômeno cultural.",
      quote: "Eu sou o Pickle Rick!",
      tags: ["Pickle Rick", "Terapia", "Absurdo", "Temporada 3"]
    }
  };

  const episodeModal = $("#episodeModal");
  const modalArt = $("#modalArt");
  const modalCode = $("#modalCode");
  const modalBadge = $("#modalBadge");
  const modalTitle = $("#modalTitle");
  const modalSynopsis = $("#modalSynopsis");
  const modalWhy = $("#modalWhy");
  const modalQuote = $("#modalQuote");
  const modalTags = $("#modalTags");
  const modalClose = $("#modalClose");
  const modalRandom = $("#modalRandom");
  let lastEpisodeTrigger = null;

  function getEpisodeCard(key) {
    return $(`[data-episode="${key}"]`);
  }

  function openEpisode(key, trigger = null) {
    const data = episodes[key];
    if (!data || !episodeModal) return;

    lastEpisodeTrigger = trigger || document.activeElement;

    const sourceCard = getEpisodeCard(key);
    const sourceArt = sourceCard ? $(".episode__art", sourceCard) : null;
    if (modalArt && sourceArt) {
      const artClass = Array.from(sourceArt.classList).find((name) => name.startsWith("art--"));
      modalArt.className = `episode-modal__art${artClass ? ` ${artClass}` : ""}`;
      modalArt.innerHTML = sourceArt.innerHTML;
      // The artwork is already in the page; remove duplicate IDs from the clone.
      modalArt.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    }

    if (modalCode) modalCode.textContent = data.code;
    if (modalBadge) modalBadge.textContent = data.badge;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalSynopsis) modalSynopsis.textContent = data.synopsis;
    if (modalWhy) modalWhy.textContent = data.why;
    if (modalQuote) modalQuote.textContent = data.quote;
    if (modalTags) {
      modalTags.innerHTML = "";
      data.tags.forEach((tag) => {
        const span = document.createElement("span");
        span.textContent = tag;
        modalTags.appendChild(span);
      });
    }

    if (typeof episodeModal.showModal === "function") {
      if (!episodeModal.open) episodeModal.showModal();
      body.classList.add("is-locked");
    }
    playZap();
  }

  function closeEpisode() {
    if (!episodeModal?.open) return;
    episodeModal.close();
  }

  $$("[data-episode]").forEach((card) => {
    card.addEventListener("click", () => openEpisode(card.dataset.episode, card));
  });

  modalClose?.addEventListener("click", closeEpisode);

  episodeModal?.addEventListener("close", () => {
    body.classList.remove("is-locked");
    lastEpisodeTrigger?.focus?.();
  });

  episodeModal?.addEventListener("click", (event) => {
    if (event.target === episodeModal) closeEpisode();
  });

  function openRandomEpisode() {
    const keys = Object.keys(episodes);
    let key = keys[Math.floor(Math.random() * keys.length)];
    if (episodeModal?.open && keys.length > 1) {
      const currentTitle = modalTitle?.textContent;
      while (episodes[key].title === currentTitle) {
        key = keys[Math.floor(Math.random() * keys.length)];
      }
    }
    openEpisode(key, lastEpisodeTrigger);
  }

  modalRandom?.addEventListener("click", openRandomEpisode);
  $("#randomEpisodeTop")?.addEventListener("click", openRandomEpisode);
  $$("[data-random-episode]").forEach((button) => {
    button.addEventListener("click", openRandomEpisode);
  });

  /* =======================================================
     QUOTE CAROUSEL
     ======================================================= */

  const quoteCarousel = $("#quoteCarousel");
  const quoteSlides = $$(".quote-slide");
  const quoteDots = $$(".quote-dot");
  const quoteCounter = $("#quoteCounter");
  const quoteProgress = $("#quoteProgress");
  const quotePrev = $("#quotePrev");
  const quoteNext = $("#quoteNext");
  const quotePause = $("#quotePause");
  const quotePauseLabel = quotePause ? $(".quote-pause__label", quotePause) : null;
  const QUOTE_INTERVAL = 9000;
  let quoteIndex = 0;
  let quoteTimer = null;
  let quotesPaused = false;
  let quoteHoverPaused = false;

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function setQuoteProgress(active) {
    if (!quoteProgress) return;
    if (!active || prefersReducedMotion.matches) {
      quoteProgress.style.transition = "none";
      quoteProgress.style.width = "0%";
      return;
    }
    quoteProgress.style.transition = "none";
    quoteProgress.style.width = "0%";
    // Force style flush so the next transition starts from zero.
    void quoteProgress.offsetWidth;
    quoteProgress.style.transition = `width ${QUOTE_INTERVAL}ms linear`;
    quoteProgress.style.width = "100%";
  }

  function freezeQuoteProgress() {
    if (!quoteProgress) return;
    const current = getComputedStyle(quoteProgress).width;
    quoteProgress.style.transition = "none";
    quoteProgress.style.width = current;
  }

  function scheduleQuote() {
    window.clearTimeout(quoteTimer);
    if (quotesPaused || quoteHoverPaused || prefersReducedMotion.matches || document.hidden) return;
    quoteTimer = window.setTimeout(() => {
      showQuote((quoteIndex + 1) % quoteSlides.length);
    }, QUOTE_INTERVAL);
  }

  function syncQuotePauseUI() {
    if (!quotePause) return;
    quotePause.setAttribute("aria-pressed", String(quotesPaused));
    quotePause.setAttribute(
      "aria-label",
      quotesPaused ? "Retomar rotação automática das citações" : "Pausar rotação automática das citações"
    );
    if (quotePauseLabel) quotePauseLabel.textContent = quotesPaused ? "Retomar" : "Pausar";
  }

  function showQuote(index) {
    if (!quoteSlides.length) return;
    quoteIndex = (index + quoteSlides.length) % quoteSlides.length;

    quoteSlides.forEach((slide, i) => {
      const active = i === quoteIndex;
      slide.hidden = !active;
      slide.classList.toggle("is-active", active);
    });

    quoteDots.forEach((dot, i) => {
      const active = i === quoteIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", String(active));
    });

    if (quoteCounter) quoteCounter.textContent = `${pad(quoteIndex + 1)} / ${pad(quoteSlides.length)}`;
    if (!quotesPaused && !quoteHoverPaused) setQuoteProgress(true);
    else setQuoteProgress(false);
    scheduleQuote();
  }

  function pauseQuotes() {
    quoteHoverPaused = true;
    window.clearTimeout(quoteTimer);
    freezeQuoteProgress();
  }

  function resumeQuotes() {
    quoteHoverPaused = false;
    if (quotesPaused) return;
    setQuoteProgress(true);
    scheduleQuote();
  }

  quotePrev?.addEventListener("click", () => showQuote(quoteIndex - 1));
  quoteNext?.addEventListener("click", () => showQuote(quoteIndex + 1));
  quoteDots.forEach((dot, index) => {
    dot.addEventListener("click", () => showQuote(index));
  });

  quotePause?.addEventListener("click", () => {
    quotesPaused = !quotesPaused;
    if (quotesPaused) {
      window.clearTimeout(quoteTimer);
      freezeQuoteProgress();
    } else {
      quoteHoverPaused = false;
      setQuoteProgress(true);
      scheduleQuote();
    }
    syncQuotePauseUI();
  });

  if (prefersReducedMotion.matches && quotePause) {
    quotePause.hidden = true;
  }

  quoteCarousel?.addEventListener("pointerenter", pauseQuotes);
  quoteCarousel?.addEventListener("pointerleave", resumeQuotes);
  quoteCarousel?.addEventListener("focusin", () => {
    if (!quotesPaused) pauseQuotes();
  });
  quoteCarousel?.addEventListener("focusout", (event) => {
    if (!quoteCarousel.contains(event.relatedTarget)) resumeQuotes();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearTimeout(quoteTimer);
    } else if (!quotesPaused && !quoteHoverPaused) {
      setQuoteProgress(true);
      scheduleQuote();
    }
  });

  syncQuotePauseUI();
  showQuote(0);

  /* =======================================================
     PORTAL TRANSITION
     ======================================================= */

  let portalTimers = [];

  function clearPortalTimers() {
    portalTimers.forEach((timer) => window.clearTimeout(timer));
    portalTimers = [];
  }

  function goThroughPortal(targetSelector) {
    const target = targetSelector ? $(targetSelector) : null;
    if (!target) return;

    playWhoosh();

    if (prefersReducedMotion.matches || !portalTransition) {
      target.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "start" });
      return;
    }

    clearPortalTimers();
    portalTransition.classList.remove("is-active");
    void portalTransition.offsetWidth;
    portalTransition.classList.add("is-active");
    body.classList.add("is-transitioning");

    portalTimers.push(
      window.setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 340)
    );

    portalTimers.push(
      window.setTimeout(() => {
        portalTransition.classList.remove("is-active");
        body.classList.remove("is-transitioning");
      }, 1040)
    );
  }

  $$("[data-portal]").forEach((button) => {
    button.addEventListener("click", () => goThroughPortal(button.dataset.portal));
  });

  /* =======================================================
     SYNTHETIC SOUND
     ======================================================= */

  let audioContext = null;
  let soundEnabled = false;
  const soundToggle = $("#soundToggle");
  const soundLabel = $("#soundLabel");

  function ensureAudio() {
    if (!soundEnabled) return null;
    try {
      if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        audioContext = new AudioCtx();
      }
      if (audioContext.state === "suspended") audioContext.resume();
      return audioContext;
    } catch {
      return null;
    }
  }

  function playTone({ frequency = 440, endFrequency = frequency, duration = 0.12, type = "sine", volume = 0.035 }) {
    const audio = ensureAudio();
    if (!audio) return;
    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  function playWhoosh() {
    const audio = ensureAudio();
    if (!audio) return;
    const now = audio.currentTime;
    const duration = 1.05;
    const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * duration), audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const source = audio.createBufferSource();
    source.buffer = buffer;

    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(160, now);
    filter.frequency.exponentialRampToValueAtTime(1550, now + 0.34);
    filter.frequency.exponentialRampToValueAtTime(110, now + 0.9);

    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    source.start(now);

    playTone({ frequency: 620, endFrequency: 1480, duration: 0.34, type: "triangle", volume: 0.018 });
  }

  function playChirp() {
    playTone({ frequency: 420, endFrequency: 780, duration: 0.09, type: "sine", volume: 0.03 });
    window.setTimeout(() => {
      playTone({ frequency: 780, endFrequency: 1120, duration: 0.1, type: "sine", volume: 0.022 });
    }, 75);
  }

  function playZap() {
    playTone({ frequency: 280, endFrequency: 860, duration: 0.16, type: "sawtooth", volume: 0.018 });
  }

  soundToggle?.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.setAttribute("aria-label", soundEnabled ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros");
    if (soundLabel) soundLabel.textContent = soundEnabled ? "SOM ON" : "SOM OFF";
    if (soundEnabled) {
      ensureAudio();
      playChirp();
    } else if (audioContext?.state === "running") {
      audioContext.suspend();
    }
  });

  /* =======================================================
     KEYBOARD / MISC
     ======================================================= */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && episodeModal?.open) {
      closeEpisode();
    }
  });

  // Close the mobile menu when the viewport is resized while it is open.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024 && menuOpen) setMenu(false);
  });

  // Subtle mouse parallax for the hero portal on precise pointers.
  const portalStage = $("#portalStage");
  const hero = $(".hero");
  if (portalStage && hero && finePointer.matches && !prefersReducedMotion.matches) {
    let parallaxRaf = 0;
    let pointerX = 0;
    let pointerY = 0;

    const applyParallax = () => {
      portalStage.style.setProperty("--parallax-x", `${pointerX.toFixed(2)}px`);
      portalStage.style.setProperty("--parallax-y", `${pointerY.toFixed(2)}px`);
      parallaxRaf = 0;
    };

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      pointerX = x * 16;
      pointerY = y * 12;
      if (!parallaxRaf) parallaxRaf = window.requestAnimationFrame(applyParallax);
    });

    hero.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
      if (!parallaxRaf) parallaxRaf = window.requestAnimationFrame(applyParallax);
    });
  }

  // Ensure any hidden interactive content becomes visible if the print dialog opens.
  window.addEventListener("beforeprint", () => {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  });
})();

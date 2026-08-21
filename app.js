/* ==========================================================================
   PORTAFOLIO DE IA & DESARROLLO - LÓGICA DE APLICACIÓN Y MANTENEDORES (APP.JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // Helper for safe execution
  const runSafe = async (name, fn) => {
    try {
      await fn();
    } catch (e) {
      console.error(`[Init Error] Failed to run ${name}:`, e);
    }
  };

  // 1. Initialize DB first
  try {
    if (window.portfolioDB) {
      await window.portfolioDB.init();
    }
  } catch (err) {
    console.error('Error initializing portfolioDB:', err);
  }

  // 2. Load static & UI components safely
  runSafe('initSnakeBackground', () => initSnakeBackground());
  runSafe('initScrollHeader', () => initScrollHeader());
  runSafe('initMobileMenuNav', () => initMobileMenuNav());
  runSafe('initNeonSign', () => initNeonSign());
  runSafe('initIndustrySolutions', () => initIndustrySolutions());
  runSafe('initDemoTabs', () => initDemoTabs());
  runSafe('initChatbotDemo', () => initChatbotDemo());
  runSafe('initWorkflowDemo', () => initWorkflowDemo());
  runSafe('initSignaturePadDemo', () => initSignaturePadDemo());
  runSafe('initContactAndDB', () => initContactAndDB());
  runSafe('initModals', () => initModals());
  runSafe('initMaintainerTabs', () => initMaintainerTabs());
  runSafe('initMaintainerServicesCRUD', () => initMaintainerServicesCRUD());
  runSafe('initMaintainerSkillsCRUD', () => initMaintainerSkillsCRUD());
  runSafe('initMaintainerBlockedCRUD', () => initMaintainerBlockedCRUD());
  runSafe('initCopyButtons', () => initCopyButtons());
  runSafe('initVCardLogic', () => initVCardLogic());
  runSafe('initFormatPreviews', () => initFormatPreviews());

  // 3. Load dynamic database-driven components safely
  await runSafe('loadDynamicStatusPill', async () => await loadDynamicStatusPill());
  await runSafe('loadSkillsMatrix', async () => await loadSkillsMatrix());
  await runSafe('loadServicesCalculator', async () => await loadServicesCalculator());
  await runSafe('loadClientsSection', async () => await loadClientsSection());
});

/* --------------------------------------------------------------------------
   0. MENÚ MÓVIL RESPONSIVE (MOBILE DRAWER)
   -------------------------------------------------------------------------- */
function initMobileMenuNav() {
  const btnToggle = document.getElementById('btn-mobile-toggle');
  const btnClose = document.getElementById('btn-mobile-close');
  const drawer = document.getElementById('mobile-nav-drawer');
  const navItems = document.querySelectorAll('.mobile-nav-item');

  if (!btnToggle || !drawer) return;

  // Asegurar que el drawer esté oculto al cargar
  drawer.style.display = 'none';

  function openDrawer() {
    drawer.style.display = 'flex';
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
    const snakeBg = document.getElementById('snake-bg');
    if (snakeBg) {
      snakeBg.style.zIndex = '9999998';
      snakeBg.style.opacity = '0.5';
    }
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    drawer.style.display = 'none';
    document.body.style.overflow = '';
    const snakeBg = document.getElementById('snake-bg');
    if (snakeBg) {
      snakeBg.style.zIndex = '-1';
      snakeBg.style.opacity = '0.15';
    }
  }

  btnToggle.onclick = (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('active')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  if (btnClose) btnClose.onclick = () => closeDrawer();

  navItems.forEach(item => {
    item.onclick = () => {
      closeDrawer();
    };
  });

  // Cerrar al hacer clic fuera del menú
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('active') && !drawer.contains(e.target) && e.target !== btnToggle && !btnToggle.contains(e.target)) {
      closeDrawer();
    }
  });

  // Cerrar al presionar la tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });

  // Cerrar automáticamente al cambiar de tamaño a PC (> 992px)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}
/* --------------------------------------------------------------------------
   0.3. LETRERO NEÓN ANIMADO (CADA LETRA SE ILUMINA SECUENCIALMENTE)
   -------------------------------------------------------------------------- */
function initNeonSign() {
  const container = document.getElementById('neon-sign-text');
  if (!container) return;

  const text = 'Disponible para proyectos';
  const neonColors = [
    { color: '#00f3ff', shadow: '0 0 7px #00f3ff, 0 0 14px #00f3ff, 0 0 28px #00f3ff, 0 0 42px #00829e' },
    { color: '#00ff88', shadow: '0 0 7px #00ff88, 0 0 14px #00ff88, 0 0 28px #00ff88, 0 0 42px #00664c' },
    { color: '#ff007f', shadow: '0 0 7px #ff007f, 0 0 14px #ff007f, 0 0 28px #ff007f, 0 0 42px #99004d' },
    { color: '#7000ff', shadow: '0 0 7px #7000ff, 0 0 14px #7000ff, 0 0 28px #7000ff, 0 0 42px #3d0080' },
    { color: '#ffcc00', shadow: '0 0 7px #ffcc00, 0 0 14px #ffcc00, 0 0 28px #ffcc00, 0 0 42px #997a00' }
  ];

  container.innerHTML = '';
  const letters = [];
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
    span.style.cssText = 'color: rgba(255,255,255,0.15); transition: all 0.15s ease; display: inline-block;';
    if (text[i] === ' ') span.style.width = '0.35em';
    container.appendChild(span);
    letters.push(span);
  }

  let currentIndex = 0;
  let colorIndex = 0;

  function lightUpLetter() {
    const prevIdx = (currentIndex - 1 + letters.length) % letters.length;
    letters[prevIdx].style.color = 'rgba(255,255,255,0.2)';
    letters[prevIdx].style.textShadow = 'none';
    letters[prevIdx].style.transform = 'scale(1)';

    const letter = letters[currentIndex];
    const neon = neonColors[colorIndex % neonColors.length];
    letter.style.color = neon.color;
    letter.style.textShadow = neon.shadow;
    letter.style.transform = 'scale(1.1)';

    currentIndex++;
    if (currentIndex >= letters.length) {
      currentIndex = 0;
      colorIndex++;
      setTimeout(() => {
        const fullNeon = neonColors[colorIndex % neonColors.length];
        letters.forEach(l => {
          if (l.textContent !== '\u00A0') {
            l.style.color = fullNeon.color;
            l.style.textShadow = fullNeon.shadow;
            l.style.transform = 'scale(1)';
          }
        });
        setTimeout(() => {
          letters.forEach(l => {
            l.style.color = 'rgba(255,255,255,0.15)';
            l.style.textShadow = 'none';
            l.style.transform = 'scale(1)';
          });
          setTimeout(lightUpLetter, 400);
        }, 1500);
      }, 100);
      return;
    }
    setTimeout(lightUpLetter, 80);
  }

  setTimeout(lightUpLetter, 600);
}

/* ==========================================================================
   AUTONOMOUS SNAKE BACKGROUND
   ========================================================================== */
function initSnakeBackground() {
  const canvas = document.getElementById('snake-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  const gridSize = 40;
  
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener('resize', resize);
  resize();

  let snake = [
    {x: 4, y: 4},
    {x: 3, y: 4},
    {x: 2, y: 4}
  ];
  let dx = 1;
  let dy = 0;
  let apple = {x: 10, y: 10};

  function spawnApple() {
    const maxCols = Math.floor(width / gridSize);
    const maxRows = Math.floor(height / gridSize);
    apple.x = Math.floor(Math.random() * maxCols);
    apple.y = Math.floor(Math.random() * maxRows);
  }
  spawnApple();

  let lastTime = 0;
  const speed = 120; 
  
  let gameOver = false;
  let gameOverTime = 0;

  function resetGame() {
    snake = [
      {x: 4, y: 4},
      {x: 3, y: 4},
      {x: 2, y: 4}
    ];
    dx = 1;
    dy = 0;
    spawnApple();
    gameOver = false;
  }
  
  const snakeColor = 'rgba(0, 243, 255, 0.4)';
  const appleColor = 'rgba(255, 0, 127, 0.6)';

  let eatEffect = 0;

  function loop(time) {
    requestAnimationFrame(loop);
    
    if (gameOver) {
      if (time - gameOverTime > 2000) {
        resetGame();
      }
      return;
    }

    if (time - lastTime < speed) return;
    lastTime = time;

    const head = snake[0];
    
    // AI Logic (Simple)
    let possibleDirs = [];
    if (head.x < apple.x && dx !== -1) possibleDirs.push({dx: 1, dy: 0});
    else if (head.x > apple.x && dx !== 1) possibleDirs.push({dx: -1, dy: 0});
    
    if (head.y < apple.y && dy !== -1) possibleDirs.push({dx: 0, dy: 1});
    else if (head.y > apple.y && dy !== 1) possibleDirs.push({dx: 0, dy: -1});

    if (possibleDirs.length > 0) {
      const dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
      dx = dir.dx;
      dy = dir.dy;
    }

    let newHead = { x: head.x + dx, y: head.y + dy };
    
    const maxCols = Math.floor(width / gridSize);
    const maxRows = Math.floor(height / gridSize);
    
    if (newHead.x >= maxCols) newHead.x = 0;
    if (newHead.x < 0) newHead.x = maxCols - 1;
    if (newHead.y >= maxRows) newHead.y = 0;
    if (newHead.y < 0) newHead.y = maxRows - 1;

    let collision = false;
    for (let i = 0; i < snake.length; i++) {
      if (newHead.x === snake[i].x && newHead.y === snake[i].y) {
        collision = true;
        break;
      }
    }

    if (collision) {
      gameOver = true;
      gameOverTime = performance.now();
      draw();
      return;
    }

    snake.unshift(newHead);

    if (newHead.x === apple.x && newHead.y === apple.y) {
      spawnApple();
      eatEffect = 1.0;
    } else {
      snake.pop();
      if (eatEffect > 0) eatEffect -= 0.1;
    }

    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = appleColor;
    ctx.shadowBlur = 10;
    ctx.shadowColor = appleColor;
    
    if (eatEffect > 0) {
      ctx.beginPath();
      ctx.arc(apple.x * gridSize + gridSize/2, apple.y * gridSize + gridSize/2, (gridSize/2) * (1 + eatEffect), 0, Math.PI*2);
      ctx.fill();
    }

    ctx.fillRect(apple.x * gridSize + 12, apple.y * gridSize + 12, gridSize - 24, gridSize - 24);

    ctx.fillStyle = snakeColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = snakeColor;
    snake.forEach((segment, idx) => {
      const padding = idx === 0 ? 6 : 10;
      ctx.fillRect(segment.x * gridSize + padding, segment.y * gridSize + padding, gridSize - padding*2, gridSize - padding*2);
    });
    ctx.shadowBlur = 0;
    ctx.shadowBlur = 0;

    if (gameOver) {
      ctx.fillStyle = 'rgba(255, 0, 50, 0.9)';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(255, 0, 50, 1)';
      ctx.fillText('GAME OVER', width/2, height/2);
      ctx.shadowBlur = 0;
    }
  }

  requestAnimationFrame(loop);
}

function initScrollHeader() {
  const header = document.getElementById('main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* --------------------------------------------------------------------------
   0.5. Cargar Estado Dinámico de la Insignia (Status Pill)
   -------------------------------------------------------------------------- */
async function loadDynamicStatusPill() {
  const pillEls = document.querySelectorAll('.status-pill');
  const statusCtaEl = document.getElementById('mobile-status-cta');
  if (!window.portfolioDB) return;

  const cfg = await window.portfolioDB.getConfig('status_pill');
  if (!cfg) return;

  if (statusCtaEl) {
    if (cfg.visible === false) {
      statusCtaEl.style.display = 'none';
    } else {
      statusCtaEl.style.display = 'flex';
    }
  }

  if (pillEls && pillEls.length > 0) {
    pillEls.forEach(pillEl => {
      if (cfg.visible === false) {
        pillEl.style.display = 'none';
      } else {
        pillEl.style.display = 'inline-flex';
        pillEl.classList.remove('theme-amber', 'theme-pink', 'theme-cyan');
        if (cfg.theme && cfg.theme !== 'emerald') {
          pillEl.classList.add(`theme-${cfg.theme}`);
        }

        const textSpan = pillEl.querySelector('span:not(.pulse-dot)');
        if (textSpan) {
          textSpan.textContent = cfg.text || 'Disponible para Proyectos';
        }
      }
    });
  }
}

/* --------------------------------------------------------------------------
   1. MATRIZ DE HABILIDADES TÉCNICAS (DESDE INDEXEDDB)
   -------------------------------------------------------------------------- */
let activeSkillFilter = 'all';

async function loadSkillsMatrix() {
  const container = document.getElementById('skills-grid-container');
  if (!container || !window.portfolioDB) return;

  const skillsData = await window.portfolioDB.getAll('skills');

  function renderSkills(filter = 'all') {
    activeSkillFilter = filter;
    container.innerHTML = '';
    const filtered = filter === 'all' ? skillsData : skillsData.filter(s => s.category === filter);

    if (filtered.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">No hay habilidades registradas en esta categoría.</p>';
      return;
    }

    filtered.forEach(skill => {
      const card = document.createElement('div');
      card.className = 'skill-card';
      card.innerHTML = `
        <div class="skill-header">
          <span class="skill-name">${escapeHtml(skill.name)}</span>
          <span class="skill-level">${escapeHtml(skill.levelText || skill.level)}</span>
        </div>
        <div class="skill-bar">
          <div class="skill-progress" style="width: ${escapeHtml(skill.level)}"></div>
        </div>
        <p class="skill-desc">${escapeHtml(skill.desc)}</p>
      `;
      container.appendChild(card);
    });
  }

  renderSkills(activeSkillFilter);

  // Filtros
  const filterBtns = document.querySelectorAll('.skills-filter .filter-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSkills(btn.dataset.filter);
    };
  });
}

/* --------------------------------------------------------------------------
   2. CALCULADORA DE PRESUPUESTO & SERVICIOS (DESDE INDEXEDDB)
   -------------------------------------------------------------------------- */
async function loadServicesCalculator() {
  const optionsContainer = document.querySelector('.calc-options');
  const priceDisplay = document.getElementById('calc-total-usd');
  const timeDisplay = document.getElementById('calc-total-time');

  if (!optionsContainer || !priceDisplay || !timeDisplay || !window.portfolioDB) return;

  // Obtener valor actual de la UF desde la API backend o fallback
  let currentUfRate = 40845.0;
  try {
    const ufRes = await fetch('/tg-uf-rate');
    const ufData = await ufRes.json();
    if (ufData.ok && ufData.data && ufData.data.uf_value) {
      currentUfRate = parseFloat(ufData.data.uf_value);
    }
  } catch(e) {
    console.warn('[CALC] Usando valor de UF fallback:', e);
  }

  // Actualizar indicadores de UF y precios en CLP en la sección de Ciberseguridad
  const clpLvl1 = Math.round(5.0 * currentUfRate);
  const clpLvl2 = Math.round(11.0 * currentUfRate);
  const clpLvl1Str = `$${clpLvl1.toLocaleString('es-CL')} CLP + IVA`;
  const clpLvl2Str = `$${clpLvl2.toLocaleString('es-CL')} CLP + IVA`;

  const lvl1El = document.querySelector('.price-level-1-display');
  const lvl2El = document.querySelector('.price-level-2-display');
  const btnLvl1 = document.querySelector('button[data-tier="200"]');
  const btnLvl2 = document.querySelector('button[data-tier="450"]');
  const ufRateBadge = document.querySelector('.uf-rate-display');

  if (lvl1El) lvl1El.innerHTML = `${clpLvl1Str} <small style="font-size: 0.85rem; opacity: 0.8;">(5,0 UF)</small>`;
  if (lvl2El) lvl2El.innerHTML = `${clpLvl2Str} <small style="font-size: 0.85rem; opacity: 0.8;">(11,0 UF)</small>`;
  if (btnLvl1) btnLvl1.innerHTML = `<i class="fa-solid fa-file-pdf"></i> Solicitar Solo Diagnóstico (${clpLvl1Str} ~ 5,0 UF)`;
  if (btnLvl2) btnLvl2.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Solicitar Auditoría + Solución (${clpLvl2Str} ~ 11,0 UF)`;
  if (ufRateBadge) {
    const ufFmt = `$${Math.round(currentUfRate).toLocaleString('es-CL')}`;
    ufRateBadge.innerHTML = `<i class="fa-solid fa-chart-line"></i> 1 UF = ${ufFmt} CLP (Oficial Banco Central)`;
  }

  const servicesData = await window.portfolioDB.getAll('services');
  optionsContainer.innerHTML = '';

  if (servicesData.length === 0) {
    optionsContainer.innerHTML = '<p style="color: var(--text-muted);">No hay servicios registrados en el mantenedor.</p>';
    priceDisplay.textContent = '$0 CLP + IVA (0,0 UF)';
    timeDisplay.textContent = '0 días';
    return;
  }

  servicesData.forEach((service, index) => {
    const isSelected = index === 0; // Seleccionar el primero por defecto
    const priceUFVal = service.priceUF !== undefined ? parseFloat(service.priceUF) : (parseFloat(service.priceUSD || 0) / 40.0);
    const card = document.createElement('div');
    card.className = `option-card ${isSelected ? 'selected' : ''}`;
    card.dataset.priceUf = priceUFVal;
    card.dataset.time = parseInt(service.timeDays, 10) || 1;
    card.dataset.id = service.id;

    card.innerHTML = `
      <div>
        <strong style="display: block; font-size: 1rem;">${escapeHtml(service.title)}</strong>
        <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(service.desc)}</span>
      </div>
      <i class="fa-solid fa-circle-check text-cyan" style="font-size: 1.2rem; opacity: ${isSelected ? '1' : '0.3'};"></i>
    `;

    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      const checkIcon = card.querySelector('i');
      if (checkIcon) {
        checkIcon.style.opacity = card.classList.contains('selected') ? '1' : '0.3';
      }
      updateTotal();
    });

    optionsContainer.appendChild(card);
  });

  updateTotal();

  function updateTotal() {
    let totalPriceUF = 0;
    let totalDays = 0;

    const selectedCards = optionsContainer.querySelectorAll('.option-card.selected');
    selectedCards.forEach(c => {
      totalPriceUF += parseFloat(c.dataset.priceUf || '0');
      totalDays += parseInt(c.dataset.time || '1', 10);
    });

    const totalCLP = Math.round(totalPriceUF * currentUfRate);
    const clpFmt = `$${totalCLP.toLocaleString('es-CL')} CLP + IVA`;
    const ufFmt = totalPriceUF.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    priceDisplay.textContent = `${clpFmt} (${ufFmt} UF)`;
    timeDisplay.textContent = `${totalDays} días`;
  }
}

/* --------------------------------------------------------------------------
   2.5. DIAGNÓSTICO DE SOLUCIONES POR RUBRO ECONÓMICO (CON FILTRO DE SEGURIDAD)
   -------------------------------------------------------------------------- */

// Lista de palabras no permitidas (actividades ilícitas, ofensivas o sin sentido)
const BLOCKED_WORDS = [
  'delincuente', 'delincuencia', 'robo', 'ladron', 'ladrón', 'narcotrafico', 'narcotráfico',
  'droga', 'drogas', 'arma', 'armas', 'sicario', 'estafador', 'estafa', 'hack', 'hacker',
  'ilegal', 'ilícito', 'ilicito', 'matar', 'asesinato', 'prostitución', 'prostitucion',
  'puta', 'mierda', 'basura', 'asdf', 'qwerty', '1234', 'test', 'xxx', 'porno', 'sexo'
];

// Diccionario inteligente de rubros frecuentes
const SMART_INDUSTRY_DICTIONARY = {
  taller: {
    tag: 'Rubro: Taller Mecánico & Automotriz',
    title: 'Sistema de Gestión de Vehículos, Ordenes de Trabajo & Avisos por WhatsApp',
    time: '3 a 5 días',
    impact: 'Mejora el seguimiento de reparaciones y envía recordatorios automáticos de mantención.',
    features: [
      { icon: 'fa-wrench', title: 'Orden de Trabajo Digital', desc: 'Ficha de ingreso del vehículo con fotos de estado inicial y presupuesto.' },
      { icon: 'fa-car-side', title: 'Consulta de Estado Online', desc: 'El cliente revisa desde su celular si su auto está listo o en reparación.' },
      { icon: 'fa-comment-dots', title: 'Aviso WhatsApp de Retiro', desc: 'Notificación automática cuando el vehículo finaliza la mantención.' },
      { icon: 'fa-file-invoice', title: 'Historial de Repuestos & Costos', desc: 'Control de repuestos utilizados y liquidación de mano de obra.' }
    ]
  },
  gimnasio: {
    tag: 'Rubro: Gimnasio & Centro Deportivo',
    title: 'Plataforma de Control de Membresías, Reservas de Clases & Rutinas Automatizadas',
    time: '3 a 5 días',
    impact: 'Reduce la morosidad de cuotas y automatiza el control de acceso de alumnos.',
    features: [
      { icon: 'fa-dumbbell', title: 'Control de Membresías & Cuotas', desc: 'Alertas automáticas por WhatsApp cuando la cuota mensual va a vencer.' },
      { icon: 'fa-calendar-days', title: 'Reserva de Clases Dirigidas', desc: 'Inscripción de cupos online para spin, yoga o crossfit.' },
      { icon: 'fa-qrcode', title: 'Acceso por Código QR', desc: 'Validación en recepción mediante escaneo de celular.' },
      { icon: 'fa-heart-pulse', title: 'Generador de Rutinas Automatizadas', desc: 'Planes de entrenamiento personalizados según metas del alumno.' }
    ]
  },
  panaderia: {
    tag: 'Rubro: Panadería & Pastelería',
    title: 'Sistema de Control de Producción Diario, Ventas en Mostrador & Pedidos Especiales',
    time: '3 a 4 días',
    impact: 'Evita pérdidas por merma de ingredientes y agiliza la atención en hora punta.',
    features: [
      { icon: 'fa-bread-slice', title: 'Control de Producción Diaria', desc: 'Recetario ficha técnica para calcular sacos de harina e insumos requeridos.' },
      { icon: 'fa-cash-register', title: 'Punto de Venta (POS) Rápido', desc: 'Facturación y boleta electrónica en mostrador de alta velocidad.' },
      { icon: 'fa-cake-candles', title: 'Reservas de Tortas & Pedidos', desc: 'Agenda de encargos especiales con abono previo y fecha de entrega.' },
      { icon: 'fa-truck-ramp-box', title: 'Gestión de Despachos a Locales', desc: 'Control de despacho si cuentas con múltiples sucursales.' }
    ]
  },
  peluqueria: {
    tag: 'Rubro: Peluquería & Barbería',
    title: 'Sistema de Reserva de Horas por Profesional & Confirmaciones Automáticas',
    time: '2 a 4 días',
    impact: 'Elimina los huecos en la agenda de tus estilistas y aumenta la fidelidad del cliente.',
    features: [
      { icon: 'fa-scissors', title: 'Reserva de Horas por Estilista', desc: 'El cliente elige el profesional de su preferencia y horario disponible.' },
      { icon: 'fa-whatsapp', title: 'WhatsApp Bot de Recordatorio', desc: 'Disminuye la inasistencia enviando un mensaje 2 horas antes de la cita.' },
      { icon: 'fa-gift', title: 'Programa de Puntos & Fidelización', desc: 'Acumulación de puntos por corte para canjear por productos.' },
      { icon: 'fa-percent', title: 'Cálculo de Comisiones', desc: 'Liquidación automática de comisión ganada por cada barbero/estilista.' }
    ]
  },
  inmobiliaria: {
    tag: 'Rubro: Inmobiliaria & Bienes Raíces',
    title: 'Portal de Catálogo de Propiedades, Tour Virtual & Filtro de Clientes Automatizado',
    time: '4 a 6 días',
    impact: 'Filtra compradores/arrendatarios calificados automáticamente y acelera el cierre de negocios.',
    features: [
      { icon: 'fa-house-chimney', title: 'Catálogo Interactivo con Filtros', desc: 'Búsqueda por zona, número de dormitorios, precio y tipo de operación.' },
      { icon: 'fa-gears', title: 'Calificador de Prospectos Automatizado', desc: 'Bot que consulta presupuesto e ingresos del interesado antes de agendar visita.' },
      { icon: 'fa-file-contract', title: 'Gestor de Contratos de Arriendo', desc: 'Control de vencimientos de contratos e incremento anual de IPC.' },
      { icon: 'fa-vr-cardboard', title: 'Visitas Virtuales & Fichas PDF', desc: 'Generación automática de dossiers PDF ejecutivos por propiedad.' }
    ]
  }
};

const INDUSTRY_SOLUTIONS = {
  dentista: {
    tag: 'Clínica Dental / Odontología',
    title: 'Sistema de Gestión Clínica & Recordatorios Automáticos por WhatsApp',
    time: '3 a 5 días',
    impact: 'Reduce inasistencias en un 45% y digitaliza fichas clínicas y planes de tratamiento.',
    features: [
      { icon: 'fa-calendar-check', title: 'Agenda Médica Inteligente', desc: 'Reserva de horas online 24/7 sincronizada con tu calendario.' },
      { icon: 'fa-comment-dots', title: 'WhatsApp Bots Recordatorios', desc: 'Confirmación y cancelación automática de citas por WhatsApp.' },
      { icon: 'fa-tooth', title: 'Odontograma Digital', desc: 'Ficha clínica del paciente con historial de presupuestos y tratamientos.' },
      { icon: 'fa-credit-card', title: 'Control de Pagos & Abonos', desc: 'Seguimiento de saldos pendientes y cuotas por tratamiento.' }
    ]
  },
  comidarapida: {
    tag: 'Comida Rápida / Fast Food',
    title: 'Sistema de Pedidos QR, Pantalla de Cocina (KDS) & Avisos por WhatsApp',
    time: '3 a 5 días',
    impact: 'Aumenta un 35% la velocidad de despacho en mostrador/delivery y elimina errores en comandas.',
    features: [
      { icon: 'fa-qrcode', title: 'Menú QR & Autopedido', desc: 'Permite a clientes pedir directo desde su celular o totems de mostrador.' },
      { icon: 'fa-fire-burner', title: 'Pantalla de Cocina (KDS)', desc: 'Visualizador en vivo de comandas por tiempo de preparación.' },
      { icon: 'fa-bell', title: 'Avisos por WhatsApp', desc: 'Notificación automática al cliente cuando su pedido esté listo para retirar.' },
      { icon: 'fa-motorcycle', title: 'Integración Delivery & Takeaway', desc: 'Gestión centralizada de pedidos locales, retiro y despachos a domicilio.' }
    ]
  },
  restaurante: {
    tag: 'Restaurante & Gastronomía',
    title: 'Software de Comandero para Garzones, Reservas & Control de Stock de Ingredientes',
    time: '4 a 6 días',
    impact: 'Maximiza la rotación de mesas, automatiza el inventario de insumos y agiliza la facturación.',
    features: [
      { icon: 'fa-utensils', title: 'Comandero Digital de Garzones', desc: 'Envío instantáneo de órdenes desde tablets a la barra o cocina.' },
      { icon: 'fa-chair', title: 'Gestor de Mesas & Reservas', desc: 'Mapa de mesas interactivo con estado en tiempo real (Disponible, Ocupada, Reservada).' },
      { icon: 'fa-boxes-stacked', title: 'Inventario & Recetas Ficha Técnica', desc: 'Descuento automático de ingredientes por cada plato vendido.' },
      { icon: 'fa-file-invoice-dollar', title: 'Cierre de Caja & Boleta Electrónica', desc: 'Cobro rápido dividiendo la cuenta por comensal e integración de pagos.' }
    ]
  },
  criador: {
    tag: 'Criador Canino / Felino',
    title: 'Software de Registro de Pedigríes & Cálculo de Consanguinidad (COI)',
    time: '4 a 6 días',
    impact: 'Garantiza la pureza de líneas de sangre, elimina errores de consanguinidad y emite certificados.',
    features: [
      { icon: 'fa-sitemap', title: 'Árbol Genealógico Interactivo', desc: 'Visualizador de ancestros con fotos, títulos y registros oficiales.' },
      { icon: 'fa-calculator', title: 'Calculadora COI (Consanguinidad)', desc: 'Cálculo genético automático entre posibles cruces de ejemplares.' },
      { icon: 'fa-paw', title: 'Gestor de Camadas & Cachorros', desc: 'Registro de nacimientos, vacunas, microchips y reserva de cachorros.' },
      { icon: 'fa-file-pdf', title: 'Exportador de Certificados PDF', desc: 'Emisión de fichas de pedigree profesionales para los nuevos dueños.' }
    ]
  },
  veterinaria: {
    tag: 'Clínica Veterinaria',
    title: 'Plataforma de Historial Médico Mascotas & Triaje Automatizado',
    time: '4 a 5 días',
    impact: 'Automatiza el seguimiento vacunal, fichas médicas por microchip y respuestas a urgencias.',
    features: [
      { icon: 'fa-notes-medical', title: 'Ficha Clínica por Mascota', desc: 'Historial de consultas, exámene, vacunas y prescripciones médicas.' },
      { icon: 'fa-bell', title: 'Alertas de Desparasitación', desc: 'Recordatorios automáticos por SMS/WhatsApp para los dueños.' },
      { icon: 'fa-gears', title: 'Asistente de Triaje 24/7', desc: 'Bot de consulta para orientar a clientes en emergencias fuera de horario.' },
      { icon: 'fa-prescription-bottle-medical', title: 'Control de Farmacia', desc: 'Inventario de medicamentos veterinarios y fechas de vencimiento.' }
    ]
  },
  ecommerce: {
    tag: 'Ecommerce & Retail',
    title: 'Suite de Carrito de Compras & Recomendador de Productos Automatizado',
    time: '3 a 5 días',
    impact: 'Aumenta las ventas online un 30% con recomendaciones inteligentes y checkout fluido.',
    features: [
      { icon: 'fa-cart-shopping', title: 'Carrito de Compras Ultra-Rápido', desc: 'Checkout optimizado para móviles con múltiples métodos de pago.' },
      { icon: 'fa-wand-magic-sparkles', title: 'Recomendador Automatizado', desc: 'Sugerencias personalizadas según comportamiento del comprador.' },
      { icon: 'fa-boxes-stacked', title: 'Sincronización de Stock', desc: 'Inventario en tiempo real conectado a tu punto de venta.' },
      { icon: 'fa-paper-plane', title: 'Recuperación de Carritos', desc: 'Flujos automáticos de email y WhatsApp para carritos abandonados.' }
    ]
  },
  abogado: {
    tag: 'Estudio Jurídico / Abogados',
    title: 'Portal de Gestión de Causas & Análisis Documental Automatizado',
    time: '4 a 6 días',
    impact: 'Ahorra 15 horas semanales analizando expedientes largos y controlando plazos judiciales.',
    features: [
      { icon: 'fa-scale-balanced', title: 'Gestor de Causas & Plazos', desc: 'Control de alertas y fechas límite de escritos legales.' },
      { icon: 'fa-file-contract', title: 'Lector de Documentos Automatizado', desc: 'Consultas sobre contratos extensos y jurisprudencia.' },
      { icon: 'fa-user-shield', title: 'Portal Privado de Clientes', desc: 'Espacio seguro para que los clientes revisen el avance de su caso.' },
      { icon: 'fa-file-signature', title: 'Generador de Borradores', desc: 'Automatización de contratos tipo y poderes de representación.' }
    ]
  },
  seguridad: {
    tag: 'Ciberseguridad & Auditoría Web',
    title: 'Servicio de Auditoría de Seguridad Web, Hardening & Ciberprotección',
    time: '2 a 4 días',
    impact: 'Identifica vulnerabilidades críticas en tu sitio web, blinda servidores y previene filtraciones de datos.',
    features: [
      { icon: 'fa-shield-halved', title: 'Auditoría de Vulnerabilidades', desc: 'Análisis de credenciales expuestas, tokens, CORS y headers de seguridad.' },
      { icon: 'fa-user-shield', title: 'Hardening & Parcheo de Código', desc: 'Protección de rutas de administración, proxies seguros para APIs y hashes SHA-256.' },
      { icon: 'fa-lock', title: 'Configuración HTTP Security Headers', desc: 'Implementación de CSP, HSTS, X-Frame-Options y protección anti-clickjacking.' },
      { icon: 'fa-file-shield', title: 'Reporte Ejecutivo & Certificado', desc: 'Informe detallado de hallazgos, mitigación y soporte continuo.' }
    ]
  }
};

function initIndustrySolutions() {
  const chips = document.querySelectorAll('.industry-chip');
  const searchForm = document.getElementById('form-industry-search');
  const customInput = document.getElementById('input-custom-industry');
  const btnRequest = document.getElementById('btn-request-industry-solution');

  if (!chips.length) return;

  // Cargar por defecto 'dentista'
  renderIndustrySolution('dentista');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderIndustrySolution(chip.dataset.industry);
    });
  });

  if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = customInput.value.trim();
      if (!val) return;

      const lowerVal = val.toLowerCase();
      
      // Consultar palabras bloqueadas dinámicamente desde IndexedDB
      let blockedList = [];
      if (window.portfolioDB) {
        const records = await window.portfolioDB.getAll('blocked');
        blockedList = records.map(r => r.word.toLowerCase());
      }
      if (!blockedList.length) {
        blockedList = ['delincuente', 'delincuencia', 'robo', 'ladron', 'ladrón', 'narcotrafico', 'narcotráfico', 'droga', 'drogas', 'arma', 'armas', 'sicario', 'estafador', 'estafa', 'hack', 'hacker', 'ilegal', 'ilícito', 'ilicito', 'matar', 'asesinato', 'prostitución', 'prostitucion', 'puta', 'mierda', 'basura', 'asdf', 'qwerty', '1234', 'test', 'xxx', 'porno', 'sexo'];
      }

      const isBlocked = blockedList.some(w => lowerVal.includes(w)) || val.length < 3;

      if (isBlocked) {
        showToast('⚠️ Por favor ingresa un rubro o actividad económica válida de negocio.', true);
        renderInvalidIndustryMessage();
        return;
      }

      chips.forEach(c => c.classList.remove('active'));

      // Buscar si coincide con el diccionario inteligente
      let matchedKey = null;
      for (const key in SMART_INDUSTRY_DICTIONARY) {
        if (lowerVal.includes(key)) {
          matchedKey = key;
          break;
        }
      }

      if (matchedKey) {
        const data = SMART_INDUSTRY_DICTIONARY[matchedKey];
        updateSolutionDOM(data.tag, data.title, data.time, data.impact, data.features);
      } else {
        renderCustomIndustrySolution(val);
      }
    });
  }

  function renderIndustrySolution(key) {
    const data = INDUSTRY_SOLUTIONS[key] || INDUSTRY_SOLUTIONS.dentista;
    updateSolutionDOM(data.tag, data.title, data.time, data.impact, data.features);
  }

  function renderInvalidIndustryMessage() {
    document.getElementById('res-industry-tag').textContent = 'Rubro no válido';
    document.getElementById('res-industry-title').textContent = 'Por favor ingresa un rubro o actividad comercial de negocio';
    document.getElementById('res-industry-time').innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--neon-pink);"></i> Consulta no permitida`;
    document.getElementById('res-industry-impact').textContent = 'Ingresa una actividad comercial como Panadería, Taller Mecánico, Gimnasio, Inmobiliaria o Peluquería para generar un diagnóstico.';

    const featBox = document.getElementById('res-industry-features');
    featBox.innerHTML = `
      <div class="feature-item-box" style="grid-column: 1/-1; border-color: rgba(255, 0, 127, 0.4); background: rgba(255, 0, 127, 0.05);">
        <i class="fa-solid fa-shield-halved" style="color: var(--neon-pink);"></i>
        <div>
          <strong style="display: block; font-size: 0.95rem; color: #fff;">Filtro de Sanidad & Seguridad Operativa</strong>
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            PPV Soluciones desarrolla software exclusivamente para actividades comerciales, profesionales e industriales legítimas.
          </span>
        </div>
      </div>
    `;
  }

  function renderCustomIndustrySolution(userText) {
    const sanitizedText = escapeHtml(userText);
    const data = {
      tag: `Rubro Comercial: ${sanitizedText}`,
      title: `Sistema de Gestión & Automatización para ${sanitizedText}`,
      time: '3 a 5 días',
      impact: `Optimización de procesos operativos, atención a clientes 24/7 y control total de datos para ${sanitizedText}.`,
      features: [
        { icon: 'fa-gears', title: 'Asistente de Automatización para tu Negocio', desc: `Entrenado para responder consultas frecuentes de clientes de ${sanitizedText}.` },
        { icon: 'fa-network-wired', title: 'Automatización de Procesos', desc: 'Conexión de formularios, bases de datos y notificaciones automáticas.' },
        { icon: 'fa-chart-line', title: 'Dashboard de Control Operativo', desc: 'Panel visual para monitorear ventas, clientes y métricas del negocio.' },
        { icon: 'fa-mobile-screen', title: 'Plataforma Web Responsiva', desc: 'Accesible desde celulares, tablets y computadoras.' }
      ]
    };
    updateSolutionDOM(data.tag, data.title, data.time, data.impact, data.features);
  }

  function updateSolutionDOM(tag, title, time, impact, features) {
    document.getElementById('res-industry-tag').textContent = tag;
    document.getElementById('res-industry-title').textContent = title;
    document.getElementById('res-industry-time').innerHTML = `<i class="fa-solid fa-clock"></i> Tiempo estimado: ${time}`;
    document.getElementById('res-industry-impact').textContent = impact;

    const featBox = document.getElementById('res-industry-features');
    featBox.innerHTML = '';

    features.forEach(f => {
      const div = document.createElement('div');
      div.className = 'feature-item-box';
      div.innerHTML = `
        <i class="fa-solid ${f.icon}"></i>
        <div>
          <strong style="display: block; font-size: 0.95rem; color: #fff;">${escapeHtml(f.title)}</strong>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(f.desc)}</span>
        </div>
      `;
      featBox.appendChild(div);
    });

    // Configurar botón para pre-llenar contacto
    if (btnRequest) {
      btnRequest.onclick = () => {
        const subjectInput = document.getElementById('contact-subject');
        const messageInput = document.getElementById('contact-message');
        if (subjectInput) subjectInput.value = `Cotización de Solución para ${tag}`;
        if (messageInput) messageInput.value = `Hola, estoy interesado en implementar la siguiente solución para mi negocio (${tag}):\n\n"${title}"\n\nPor favor contáctenme para revisar detalles y presupuesto.`;
      };
    }
  }

  // Auditoría SEO
  const btnSeoAudit = document.getElementById('btn-request-seo-audit');
  if (btnSeoAudit) {
    btnSeoAudit.onclick = () => {
      const subjectInput = document.getElementById('contact-subject');
      const messageInput = document.getElementById('contact-message');
      if (subjectInput) subjectInput.value = 'Solicitud de Auditoría de Posicionamiento Web & SEO';
      if (messageInput) messageInput.value = 'Hola PPV Soluciones, me gustaría solicitar una auditoría gratuita de posicionamiento web, velocidad y visibilidad de marca para mi sitio web actual.';
    };
  }
}



function initDemoTabs() {
  const tabs = document.querySelectorAll('.demo-tab');
  const panels = document.querySelectorAll('.demo-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(tab.dataset.target);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   4. DEMO 1: BOT DE RESPUESTA SIMULADO
   -------------------------------------------------------------------------- */
function initChatbotDemo() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const box = document.getElementById('chat-messages-box');
  const roleSelect = document.getElementById('chat-role-select');

  if (!form || !input || !box) return;

  const responsesByRole = {
    tech: [
      "En PPV Soluciones recomendamos una arquitectura Serverless con Python en el backend y una interfaz ligera en Vanilla JS.",
      "Podemos conectar flujos de trabajo automatizados usando consultas preparadas y almacenamiento en SQLite/IndexedDB.",
      "Para asegurar el código, aplicaremos validación estricta de tipos e higienización de entradas."
    ],
    support: [
      "¡Por supuesto! Estaremos encantados de ayudarte a cotizar o adaptar este servicio para tu negocio. ¿Cuál es tu objetivo principal?",
      "Nuestros tiempos promedio de prototipado varían entre 24 y 48 horas para tener un MVP funcional.",
      "Podemos guardar automáticamente las consultas de tus clientes en la base de datos de tu preferencia."
    ],
    data: [
      "He analizado el volumen de datos. Un flujo en n8n procesando lotes de 100 registros reducirá los tiempos de ejecución en un 40%.",
      "Podemos generar reportes automáticos en formato JSON o CSV directamente desde las interacciones registradas."
    ]
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;

    appendMessage('user', userText);
    input.value = '';

    setTimeout(() => {
      const role = roleSelect.value || 'tech';
      const roleResponses = responsesByRole[role] || responsesByRole.tech;
      const randomReply = roleResponses[Math.floor(Math.random() * roleResponses.length)];
      appendMessage('ai', randomReply);
    }, 600);
  });

  function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    const avatarIcon = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-gears"></i>';
    
    msgDiv.innerHTML = `
      <div class="msg-avatar">${avatarIcon}</div>
      <div class="msg-bubble">${text}</div>
    `;
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;
  }
}

/* --------------------------------------------------------------------------
   5. DEMO 2: FLUJO DE AUTOMATIZACIÓN (N8N CANVAS)
   -------------------------------------------------------------------------- */
function initWorkflowDemo() {
  const btnRun = document.getElementById('btn-run-workflow');
  const packet = document.getElementById('workflow-packet');
  const logBox = document.getElementById('workflow-log');

  if (!btnRun || !packet || !logBox) return;

  btnRun.addEventListener('click', () => {
    btnRun.disabled = true;
    logBox.innerHTML = '<span style="color: var(--neon-cyan);">[Paso 1/3]: Recibiendo evento Webhook... Payload válido.</span>';
    
    packet.style.animation = 'none';
    packet.offsetHeight;
    packet.style.animation = 'movePacket 3s linear forward';

    setTimeout(() => {
      logBox.innerHTML = '<span style="color: var(--neon-violet);">[Paso 2/3]: Procesando texto con OpenAI API (GPT-4o mini)... Enriqueciendo datos.</span>';
    }, 1200);

    setTimeout(() => {
      logBox.innerHTML = '<span style="color: var(--neon-emerald);">[Paso 3/3]: ¡Éxito! Registro guardado en Database y notificación enviada.</span>';
      btnRun.disabled = false;
    }, 2800);
  });
}

/* --------------------------------------------------------------------------
   5. DEMO 4: SALA DE VIDEOLLAMADA PROPIA (WEBRTC) POP-UP MULTICONFERENCIA
   -------------------------------------------------------------------------- */
function initSignaturePadDemo() {
  const modalAccess = document.getElementById('modal-video-access');
  const modalRoom = document.getElementById('modal-webrtc-room');
  const btnCloseAccess = document.getElementById('btn-close-access-modal');
  const btnCloseRoom = document.getElementById('btn-close-popup-room');
  
  const btnStartCall = document.getElementById('btn-start-native-call');
  const formLogin = document.getElementById('form-video-room-login');
  const btnGenPass = document.getElementById('btn-gen-random-pass');
  const btnCopyPass = document.getElementById('btn-copy-access-pass');
  const nameInput = document.getElementById('room-user-name');
  const emailInput = document.getElementById('room-user-email');
  const passInput = document.getElementById('room-access-pass');
  
  const labelHostName = document.getElementById('label-host-name');
  const participantDisplay = document.getElementById('popup-participant-email');

  // Elementos de la sala Pop-Up
  const popupGrid = document.getElementById('popup-video-grid');
  const videoLocal = document.getElementById('popup-video-local');
  const localAvatar = document.getElementById('popup-local-avatar');
  const cardLocal = document.getElementById('card-video-local');
  const cardRemote = document.getElementById('card-video-remote');
  const remoteGuestName = document.getElementById('remote-guest-name');
  const remoteVoiceCanvas = document.getElementById('remote-voice-canvas');

  // Controles Pop-Up
  const btnPopMic = document.getElementById('btn-popup-mic');
  const btnPopCam = document.getElementById('btn-popup-cam');
  const btnPopShare = document.getElementById('btn-popup-share');
  const btnPopEnd = document.getElementById('btn-popup-end');
  const popupTimer = document.getElementById('popup-timer-display');
  const btnAddGuest = document.getElementById('btn-add-guest-participant');

  // Controles de Tamaño, Layout & Aspect Ratio (16:9 / 9:16)
  const layoutBtns = document.querySelectorAll('.layout-btn');
  const aspectBtns = document.querySelectorAll('.aspect-btn');
  const sliderHeight = document.getElementById('slider-video-height');
  const btnShrink = document.getElementById('btn-resize-shrink');
  const btnGrow = document.getElementById('btn-resize-grow');

  // Auto-Detección Responsiva de Aspect Ratio (Desktop 16:9 vs Mobile 9:16)
  function autoDetectAspectRatio() {
    if (!popupGrid) return;
    const isMobile = window.innerWidth < 768;
    aspectBtns.forEach(b => b.classList.remove('active'));

    popupGrid.classList.remove('aspect-16-9', 'aspect-9-16');

    if (isMobile) {
      popupGrid.classList.add('aspect-9-16');
      const mobileBtn = document.getElementById('btn-aspect-916');
      if (mobileBtn) mobileBtn.classList.add('active');
    } else {
      popupGrid.classList.add('aspect-16-9');
      const pcBtn = document.getElementById('btn-aspect-169');
      if (pcBtn) pcBtn.classList.add('active');
    }
  }

  // Manejador del Selector Manual de Aspect Ratio (16:9 PC vs 9:16 Celular)
  aspectBtns.forEach(btn => {
    btn.onclick = () => {
      aspectBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      popupGrid.classList.remove('aspect-16-9', 'aspect-9-16');
      popupGrid.classList.add(btn.dataset.aspect);

      const aspectLabel = btn.dataset.aspect === 'aspect-9-16' ? '9:16 Vertical (Celular)' : '16:9 Horizontal (Computador)';
      showToast(`📱 Formato de pantalla cambiado a: ${aspectLabel}`);
    };
  });

  // Firma Digital Canvas
  const canvas = document.getElementById('signature-canvas');
  const btnClear = document.getElementById('btn-clear-signature');
  const btnConfirm = document.getElementById('btn-confirm-signature');
  const btnDownload = document.getElementById('btn-download-signed-pdf');
  const resultBox = document.getElementById('signed-result-box');
  const stampStatus = document.getElementById('doc-stamp-status');

  if (!canvas) return;

  let localStream = null;
  let isMicActive = true;
  let isCamActive = true;
  let timerInterval = null;
  let secondsElapsed = 0;

  let audioContext = null;
  let analyser = null;
  let microphoneSource = null;
  let animFrameId = null;
  let simulatedTurnInterval = null;
  let guestCount = 1;

  // Nombres simulados para nuevos invitados multiconferencia (3º, 4º, 5º)
  const EXTRA_GUEST_NAMES = [
    { name: 'Dra. Valeria Gómez', role: 'Asesora Legal' },
    { name: 'Arq. Carlos Fuentes', role: 'Director de Obra' },
    { name: 'Lic. Mariana Silva', role: 'Finanzas & Presupuesto' }
  ];

  const btnCopyDirectLink = document.getElementById('btn-copy-direct-invite-link');
  const inviteBanner = document.getElementById('invitation-alert-banner');
  const inviteBannerText = document.getElementById('invitation-banner-text');

  // --- 0. Detección Automática de Link de Invitación en la URL (#join-room?room=...&key=...) ---
  function checkInvitationLinkUrl() {
    const hash = window.location.hash;
    if (hash && hash.includes('join-room')) {
      try {
        const queryStr = hash.split('?')[1];
        if (queryStr) {
          const params = new URLSearchParams(queryStr);
          const room = params.get('room');
          const key = params.get('key');

          if (room && key) {
            if (passInput) passInput.value = key;
            if (nameInput) nameInput.value = '';
            if (emailInput) emailInput.value = '';

            if (inviteBanner && inviteBannerText) {
              inviteBannerText.textContent = `Has sido invitado a la sala privada ${room}. Clave verificada automáticamente. Ingresa tu Nombre y Correo para unirte.`;
              inviteBanner.style.display = 'block';
            }

            if (modalAccess) modalAccess.classList.add('active');
            showToast(`✉️ Enlace de invitación detectado para la sala ${room}. Ingresa tu Nombre y Correo para ingresar.`);
          }
        }
      } catch (e) {
        console.log('Error parsing join-room hash:', e);
      }
    }
  }

  // Ejecutar verificación de invitación al cargar la página
  checkInvitationLinkUrl();

  // Copiar Enlace Directo de Invitación
  if (btnCopyDirectLink) {
    btnCopyDirectLink.onclick = () => {
      const room = 'PPV-MEET-8942';
      const key = passInput ? passInput.value : generateRandomPassword();
      const fullUrl = `${window.location.origin}/#join-room?room=${encodeURIComponent(room)}&key=${encodeURIComponent(key)}`;

      navigator.clipboard.writeText(fullUrl);
      showToast('📋 Enlace de invitación directo copiado. Puedes enviarlo a tu cliente.');
    };
  }
  function generateRandomPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'MEET-';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    code += '-';
    for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  }

  if (btnGenPass && passInput) {
    btnGenPass.onclick = () => {
      passInput.value = generateRandomPassword();
      showToast('🔑 Clave aleatoria segura generada.');
    };
  }

  if (btnCopyPass && passInput) {
    btnCopyPass.onclick = () => {
      if (passInput.value) {
        navigator.clipboard.writeText(passInput.value);
        showToast('¡Clave copiada al portapapeles!');
      }
    };
  }

  // --- 2. Abrir Modal de Acceso ---
  if (btnStartCall) {
    btnStartCall.onclick = () => {
      if (passInput && !passInput.value) {
        passInput.value = generateRandomPassword();
      }
      modalAccess.classList.add('active');
    };
  }

  if (btnCloseAccess) btnCloseAccess.onclick = () => modalAccess.classList.remove('active');
  if (btnCloseRoom) btnCloseRoom.onclick = () => closePopUpRoom();

  // --- 3. Login e Ingreso a la Sala Pop-Up ---
  if (formLogin) {
    formLogin.onsubmit = async (e) => {
      const userName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Participante';
      const userEmail = (emailInput && emailInput.value.trim()) ? emailInput.value.trim() : 'usuario@empresa.com';
      const pass = passInput ? passInput.value.trim() : '';

      if (!userName || !userEmail || !pass) return;

      if (labelHostName) labelHostName.textContent = userName;
      if (participantDisplay) participantDisplay.textContent = `Sesión: ${userName} (${userEmail}) | Clave: ${pass}`;

      modalAccess.classList.remove('active');
      modalRoom.classList.add('active');
      autoDetectAspectRatio();

      showToast(`🔑 Acceso verificado para ${userName}. Abriendo Multiconferencia...`);
      await startNativePopUpCamera();
    };
  }

  // --- 4. Cámara Nativa & Stream en Pop-Up con Detector de Voz Excluyente ---
  async function startNativePopUpCamera() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoLocal) {
          videoLocal.srcObject = localStream;
          videoLocal.style.display = 'block';
        }
        
        // CORRECCIÓN CRÍTICA: Asegurar que el avatar placeholder esté oculto cuando la cámara está activa
        if (localAvatar) localAvatar.style.display = 'none';

        // Iniciar detector de voz en tiempo real para la voz de Patricio
        initVoiceDetection(localStream);

        // Iniciar simulación de turnos excluyentes de conversación
        startExclusiveTurnSimulation();

        startTimer();
      }
    } catch (err) {
      console.log('Cámara en modo simulación:', err);
      if (localAvatar) localAvatar.style.display = 'flex';
      startTimer();
    }
  }

  // Real-Time Web Audio API Voice Detector for Local Mic
  function initVoiceDetection(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;

      microphoneSource = audioContext.createMediaStreamSource(stream);
      microphoneSource.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function detectVolume() {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Cuando Patricio habla: encender su marco y APAGAR los marcos de los invitados
        if (average > 12 && isMicActive) {
          if (cardLocal) cardLocal.classList.add('speaking-host');
          
          // Apagar turnos remotos durante la intervención del Host
          document.querySelectorAll('.video-box-card:not(#card-video-local)').forEach(c => {
            c.classList.remove('speaking');
          });
        } else {
          if (cardLocal) cardLocal.classList.remove('speaking-host');
        }

        animFrameId = requestAnimationFrame(detectVolume);
      }

      detectVolume();
    } catch (e) {
      console.log('Web Audio API no soportado:', e);
    }
  }

  // Simulación de alternancia excluyente de voz (Solo 1 persona habla a la vez)
  function startExclusiveTurnSimulation() {
    clearInterval(simulatedTurnInterval);
    let activeGuestIndex = 0;

    simulatedTurnInterval = setInterval(() => {
      // Si el Host no está hablando en este instante, asignar turno al invitado
      if (cardLocal && !cardLocal.classList.contains('speaking-host')) {
        const guestCards = document.querySelectorAll('.video-box-card:not(#card-video-local)');
        if (guestCards.length > 0) {
          guestCards.forEach(c => c.classList.remove('speaking'));
          
          const currentSpeakingCard = guestCards[activeGuestIndex % guestCards.length];
          currentSpeakingCard.classList.add('speaking');
          activeGuestIndex++;

          drawRemoteSoundwave(true);
        }
      }
    }, 4000);
  }

  // Multiconferencia: Sumar 3º, 4º o 5º Participante a la Sala
  if (btnAddGuest && popupGrid) {
    btnAddGuest.onclick = () => {
      if (guestCount >= 6) {
        showToast('Límite de simulación multiconferencia alcanzado (6 invitados).');
        return;
      }

      const guestData = EXTRA_GUEST_NAMES[(guestCount - 1) % EXTRA_GUEST_NAMES.length];
      guestCount++;
      const wrapperId = `wrapper-video-guest-${Date.now()}`;
      const cardId = `card-video-guest-${Date.now()}`;

      const newWrapper = document.createElement('div');
      newWrapper.className = 'video-card-wrapper';
      newWrapper.id = wrapperId;
      newWrapper.innerHTML = `
        <div class="video-box-card" id="${cardId}">
          <button type="button" class="btn-remove-guest" title="Expulsar / Quitar Invitado" onclick="removeGuestCard('${wrapperId}')">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <span class="speaking-badge" style="border-color: var(--neon-emerald); color: var(--neon-emerald);">
            <i class="fa-solid fa-volume-high text-emerald"></i> Hablando...
          </span>
          <div class="remote-guest-container">
            <div class="guest-wave-avatar" style="background: linear-gradient(135deg, #00f3ff, #00ff88);">
              <i class="fa-solid fa-user-doctor"></i>
            </div>
          </div>
        </div>
        <div class="video-card-footer">
          <span class="participant-name-highlight">
            <i class="fa-solid fa-user-gear text-cyan"></i> ${guestData.name}
          </span>
          <span class="participant-role-tag">${guestData.role}</span>
        </div>
      `;

      popupGrid.appendChild(newWrapper);
      showToast(`👥 ${guestData.name} se ha unido a la reunión.`);
    };
  }

  // Función Global para Quitar Participante de la Sala
  window.removeGuestCard = function(wrapperId) {
    const wrapperEl = document.getElementById(wrapperId);
    if (wrapperEl) {
      wrapperEl.style.transition = 'all 0.3s ease';
      wrapperEl.style.opacity = '0';
      wrapperEl.style.transform = 'scale(0.8)';
      setTimeout(() => {
        wrapperEl.remove();
        showToast('❌ Participante removido de la reunión.');
      }, 300);
    }
  };

  // Dibujar onda de sonido en el recuadro del invitado
  function drawRemoteSoundwave(isSpeaking) {
    if (!remoteVoiceCanvas) return;
    const rCtx = remoteVoiceCanvas.getContext('2d');
    rCtx.clearRect(0, 0, remoteVoiceCanvas.width, remoteVoiceCanvas.height);

    if (!isSpeaking) return;

    rCtx.fillStyle = '#00ff88';
    const numBars = 20;
    const barWidth = remoteVoiceCanvas.width / numBars;

    for (let i = 0; i < numBars; i++) {
      const h = Math.random() * 40 + 10;
      rCtx.fillRect(i * barWidth + 2, remoteVoiceCanvas.height - h, barWidth - 4, h);
    }
  }

  function startTimer() {
    clearInterval(timerInterval);
    secondsElapsed = 0;
    timerInterval = setInterval(() => {
      secondsElapsed++;
      const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
      const secs = String(secondsElapsed % 60).padStart(2, '0');
      if (popupTimer) popupTimer.textContent = `⏱️ ${mins}:${secs}`;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function closePopUpRoom() {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    if (videoLocal) videoLocal.srcObject = null;

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    if (animFrameId) cancelAnimationFrame(animFrameId);
    clearInterval(simulatedTurnInterval);

    stopTimer();
    modalRoom.classList.remove('active');
  }

  // --- 5. Controles de Layout (Organizar Recuadros Grid, Enfoque, Apilado) ---
  layoutBtns.forEach(btn => {
    btn.onclick = () => {
      layoutBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      popupGrid.classList.remove('mode-split', 'mode-focus', 'mode-stacked');
      popupGrid.classList.add(btn.dataset.layout);
      showToast(`Modo de vista cambiado a: ${btn.textContent.trim()}`);
    };
  });

  // --- 6. Ajustar Tamaño de Recuadros (Slider & Botones +/-) ---
  if (sliderHeight && popupGrid) {
    sliderHeight.oninput = () => {
      popupGrid.style.height = `${sliderHeight.value}px`;
    };
  }

  if (btnShrink && sliderHeight && popupGrid) {
    btnShrink.onclick = () => {
      const newVal = Math.max(200, parseInt(sliderHeight.value, 10) - 40);
      sliderHeight.value = newVal;
      popupGrid.style.height = `${newVal}px`;
    };
  }

  if (btnGrow && sliderHeight && popupGrid) {
    btnGrow.onclick = () => {
      const newVal = Math.min(550, parseInt(sliderHeight.value, 10) + 40);
      sliderHeight.value = newVal;
      popupGrid.style.height = `${newVal}px`;
    };
  }

  // --- 7. Controles Mute / Cam / Share / End en Pop-Up ---
  if (btnPopMic) {
    btnPopMic.onclick = () => {
      isMicActive = !isMicActive;
      if (localStream) localStream.getAudioTracks().forEach(t => t.enabled = isMicActive);
      const icon = btnPopMic.querySelector('i');
      if (isMicActive) {
        btnPopMic.classList.remove('muted');
        icon.className = 'fa-solid fa-microphone';
        showToast('🎙️ Micrófono Activado.');
      } else {
        btnPopMic.classList.add('muted');
        icon.className = 'fa-solid fa-microphone-slash';
        showToast('🔇 Micrófono Silenciado.');
      }
    };
  }

  if (btnPopCam) {
    btnPopCam.onclick = () => {
      isCamActive = !isCamActive;
      if (localStream) localStream.getVideoTracks().forEach(t => t.enabled = isCamActive);
      const icon = btnPopCam.querySelector('i');
      if (isCamActive) {
        btnPopCam.classList.remove('cam-off');
        icon.className = 'fa-solid fa-video';
        if (videoLocal) videoLocal.style.display = 'block';
        if (localAvatar) localAvatar.style.display = 'none';
        showToast('📷 Cámara Encendida.');
      } else {
        btnPopCam.classList.add('cam-off');
        icon.className = 'fa-solid fa-video-slash';
        if (videoLocal) videoLocal.style.display = 'none';
        if (localAvatar) localAvatar.style.display = 'flex';
        showToast('🙈 Cámara Apagada.');
      }
    };
  }

  if (btnPopShare) {
    btnPopShare.onclick = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          if (videoLocal) videoLocal.srcObject = screenStream;
          showToast('🖥️ Compartiendo Pantalla en la Sala Pop-Up...');
          screenStream.getVideoTracks()[0].onended = () => {
            if (localStream && videoLocal) videoLocal.srcObject = localStream;
          };
        }
      } catch (e) {
        showToast('Transmisión de pantalla finalizada.');
      }
    };
  }

  if (btnPopEnd) {
    btnPopEnd.onclick = () => {
      closePopUpRoom();
      showToast('🛑 Reunión finalizada. Minuta de acuerdos generada automáticamente.');

      const docContainer = document.getElementById('agreement-doc-container');
      if (docContainer) {
        docContainer.scrollIntoView({ behavior: 'smooth' });
      }
    };
  }

  // --- 8. Lienzo de Firma Digital Canvas ---
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let hasSigned = false;

  ctx.strokeStyle = '#00f3ff';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function startDrawing(e) {
    isDrawing = true;
    hasSigned = true;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    isDrawing = false;
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('touchend', stopDrawing);

  if (btnClear) {
    btnClear.onclick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasSigned = false;
      if (resultBox) resultBox.style.display = 'none';
      if (stampStatus) {
        stampStatus.className = 'agreement-stamp';
        stampStatus.style.borderColor = 'var(--neon-emerald)';
        stampStatus.style.color = 'var(--neon-emerald)';
        stampStatus.innerHTML = '<i class="fa-solid fa-clock"></i> Pendiente de Firma';
      }
      showToast('Lienzo de firma limpiado.');
    };
  }

  if (btnConfirm) {
    btnConfirm.onclick = () => {
      if (!hasSigned) {
        showToast('⚠️ Por favor dibuja tu firma en el lienzo antes de confirmar.', true);
        return;
      }

      if (stampStatus) {
        stampStatus.style.borderColor = 'var(--neon-emerald)';
        stampStatus.style.color = 'var(--neon-emerald)';
        stampStatus.innerHTML = '<i class="fa-solid fa-file-circle-check"></i> FIRMADO DIGITALMENTE';
      }

      if (resultBox) {
        resultBox.style.display = 'block';
        const randomHash = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
        document.getElementById('signed-doc-hash').textContent = `sha256:${randomHash}`;
      }

      showToast('¡Acta de Proyecto firmada digitalmente con éxito!');
    };
  }

  if (btnDownload) {
    btnDownload.onclick = () => {
      alert('📄 Generando descarga de Acta de Acuerdo Firmada en formato PDF...\n\nIncluye resúmenes de entregables, presupuesto $450 USD, plazo 4 días y firma estampa SHA-256.');
      showToast('Descarga simulada de PDF completada.');
    };
  }
}




/* --------------------------------------------------------------------------
   6. FORMULARIO DE CONTACTO E INDEXEDDB
   -------------------------------------------------------------------------- */
async function sendTelegramNotification(data) {
  // Token enviado via proxy en Hetzner para no exponerlo en el cliente
  const PROXY_URL = 'https://ppvsoluciones.cl/tg-notify';

  const dateStr = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
  const text = `🚀 <b>NUEVO MENSAJE DE CONTACTO - PPV SOLUCIONES</b>\n\n` +
    `👤 <b>Nombre:</b> ${escapeHtml(data.name)}\n` +
    `📧 <b>Email:</b> ${escapeHtml(data.email)}\n` +
    `📌 <b>Asunto:</b> ${escapeHtml(data.subject || 'Consulta General')}\n` +
    `💰 <b>Presupuesto:</b> ${escapeHtml(data.budgetText || data.budget || 'Por definir')}\n\n` +
    `💬 <b>Mensaje:</b>\n<i>"${escapeHtml(data.message)}"</i>\n\n` +
    `📅 <i>${dateStr}</i>\n` +
    `🌐 <i>Origen: ppvsoluciones.cl</i>`;

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        contact_pref: data.contact_pref || '',
        subject: data.subject,
        website: data.website || '',
        budgetText: data.budgetText || data.budget,
        message: data.message
      })
    });
    const resData = await response.json();
    console.log('Respuesta proxy Telegram:', resData);
    return resData.ok;
  } catch (err) {
    console.error('Error enviando notificación a Telegram:', err);
    return false;
  }
}

function initContactAndDB() {
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('btn-submit-contacto');
  const modalContacto = document.getElementById('modal-contacto');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
    }

    const budgetSelect = document.getElementById('contact-budget');
    const budgetText = (budgetSelect && budgetSelect.selectedIndex >= 0) ? budgetSelect.options[budgetSelect.selectedIndex].text : '';
    const phoneEl = document.getElementById('contact-phone');
    const prefEl = document.getElementById('contact-pref');

    const data = {
      name: document.getElementById('contact-name').value.trim(),
      email: document.getElementById('contact-email').value.trim(),
      phone: phoneEl ? phoneEl.value.trim() : '',
      contact_pref: prefEl ? prefEl.value : 'WhatsApp',
      subject: document.getElementById('contact-subject').value.trim(),
      budget: document.getElementById('contact-budget').value,
      budgetText: budgetText,
      message: document.getElementById('contact-message').value.trim()
    };

    // 1. Enviar siempre a Telegram primero
    try {
      await sendTelegramNotification(data);
    } catch (tErr) {
      console.error('Error al notificar Telegram:', tErr);
    }

    // 2. Guardar en IndexedDB local
    try {
      if (window.portfolioDB) {
        await window.portfolioDB.saveMessage(data);
      }
    } catch (dbErr) {
      console.error('Error al guardar en base de datos local:', dbErr);
    }

    // 3. Confirmación al usuario y limpiar formulario
    showToast('¡Mensaje enviado con éxito!');
    contactForm.reset();
    
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Mensaje';
    }
    
    if (modalContacto) {
      modalContacto.classList.remove('active');
    }
  });
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('global-toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.style.borderColor = isError ? 'var(--neon-pink)' : 'var(--neon-emerald)';
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* --------------------------------------------------------------------------
   7. GESTIÓN DE MODALES & AUTENTICACIÓN ADMINISTRATIVA
   -------------------------------------------------------------------------- */
// Credenciales admin: hash SHA-256 (nunca texto plano en el cliente)
const ADMIN_HASHES = {
  emailHash: 'dbcba288f24a1d8b77274a31adba1b6ae7c5744e7b9e99776e556a816a5e4bb1',
  passHash: '2bea8efab55e996f89e4804280208da9711e6a2a693a30bc77355abed3c2ccdc'
};
async function hashString(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function initModals() {
  // Modal Contacto
  const modalContacto = document.getElementById('modal-contacto');
  const btnCloseContacto = document.getElementById('btn-close-contacto');
  
  if (modalContacto && btnCloseContacto) {
    btnCloseContacto.addEventListener('click', () => {
      modalContacto.classList.remove('active');
      modalContacto.style.display = 'none';
    });
    
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href="#contacto"]');
      if (link) {
        e.preventDefault();
        modalContacto.classList.add('active');
        modalContacto.style.display = 'flex';
      }
    });
    
    modalContacto.addEventListener('click', (e) => {
      if (e.target === modalContacto) {
        modalContacto.classList.remove('active');
        modalContacto.style.display = 'none';
      }
    });
  }

  // Interceptor global para cerrar cualquier modal con el botón .modal-close
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.modal-close');
    if (closeBtn) {
      e.preventDefault();
      const modal = closeBtn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
      }
    }
  });

  // Modal Tarjeta Digital (vCard)
  const modalVCard = document.getElementById('modal-vcard');
  const btnCloseVCard = document.getElementById('btn-close-vcard-modal');
  if (modalVCard) {
    if (btnCloseVCard) {
      btnCloseVCard.addEventListener('click', () => {
        modalVCard.classList.remove('active');
        modalVCard.style.display = 'none';
      });
    }

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href="#vcard"], .btn-open-vcard-modal');
      if (link) {
        e.preventDefault();
        modalVCard.classList.add('active');
        modalVCard.style.display = 'flex';
      }
    });

    modalVCard.addEventListener('click', (e) => {
      if (e.target === modalVCard) {
        modalVCard.classList.remove('active');
        modalVCard.style.display = 'none';
      }
    });
  }

  const modalLogin = document.getElementById('modal-admin-login');
  const modalDB = document.getElementById('modal-db-admin');
  const btnOpenDB = document.getElementById('btn-open-admin-db');
  const btnOpenDBDrawer = document.getElementById('btn-open-db-drawer');
  const btnCloseDB = document.getElementById('btn-close-db-modal');
  const btnCloseLogin = document.getElementById('btn-close-login-modal');
  const btnExportJSON = document.getElementById('btn-export-db-json');
  const btnLogout = document.getElementById('btn-admin-logout');

  const formLogin = document.getElementById('form-admin-login');
  const errorMsg = document.getElementById('login-error-msg');
  const btnTogglePass = document.getElementById('btn-toggle-admin-pass');
  const passInput = document.getElementById('admin-password');

  if (btnTogglePass && passInput) {
    btnTogglePass.onclick = () => {
      const icon = btnTogglePass.querySelector('i');
      if (passInput.type === 'password') {
        passInput.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
      } else {
        passInput.type = 'password';
        icon.className = 'fa-solid fa-eye';
      }
    };
  }

  // Modales de Ciberseguridad y Solicitud Rápida
  const modalSec = document.getElementById('modal-security-audit');
  const modalReq = document.getElementById('modal-service-request');

  const btnHeroSec = document.getElementById('btn-hero-sec-audit');
  const btnSecSection = document.getElementById('btn-open-sec-section-modal');
  const btnCloseSec = document.getElementById('btn-close-sec-modal');
  const btnCloseReq = document.getElementById('btn-close-service-modal');

  const formSec = document.getElementById('form-security-audit-modal');
  const formReq = document.getElementById('form-service-request-modal');

  // Actualizar UI del Modal de Ciberseguridad dinámicamente según el nivel
  const updateSecModalUI = (tier) => {
    const badge = document.getElementById('sec-modal-header-badge');
    const btnSubmit = document.getElementById('btn-sec-modal-submit');
    if (tier === '200') {
      if (badge) badge.innerHTML = `<i class="fa-solid fa-tag"></i> Inversión: $200 USD | <i class="fa-solid fa-clock"></i> Plazo de Entrega: 2 días`;
      if (btnSubmit) btnSubmit.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Enviar Solicitud & Aceptar Diagnóstico ($200 USD)`;
    } else {
      if (badge) badge.innerHTML = `<i class="fa-solid fa-tag"></i> Inversión: $450 USD | <i class="fa-solid fa-clock"></i> Plazo de Entrega: 4 días`;
      if (btnSubmit) btnSubmit.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Enviar Solicitud & Aceptar Hardening ($450 USD)`;
    }
  };

  // Abrir Modal de Ciberseguridad con nivel seleccionado
  window.openSecurityAuditModal = (tier = '450') => {
    if (!modalSec) return;
    const radio200 = document.getElementById('radio-tier-200');
    const radio450 = document.getElementById('radio-tier-450');

    if (tier === '200' && radio200) radio200.checked = true;
    else if (radio450) radio450.checked = true;

    updateSecModalUI(tier);
    modalSec.classList.add('active');
  };

  document.querySelectorAll('input[name="sec_tier"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updateSecModalUI(radio.value);
    });
  });

  if (btnHeroSec) btnHeroSec.onclick = () => window.openSecurityAuditModal('450');
  if (btnSecSection) btnSecSection.onclick = () => window.openSecurityAuditModal('450');
  if (btnCloseSec) btnCloseSec.onclick = () => modalSec.classList.remove('active');

  // Botones de niveles en la sección
  document.querySelectorAll('.btn-sec-tier').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const tier = btn.dataset.tier || '450';
      window.openSecurityAuditModal(tier);
    };
  });

  // Abrir Modal de Solicitud Rápida de Servicio
  window.openServiceRequestModal = (serviceTitle, serviceSubtitle = 'Diagnóstico & Cotización Directa') => {
    if (!modalReq) return;
    const titleEl = document.getElementById('modal-req-title');
    const subEl = document.getElementById('modal-req-subtitle');
    const subjInput = document.getElementById('req-modal-subject');

    if (titleEl) titleEl.textContent = 'Solicitud de Servicio';
    if (subEl) subEl.textContent = serviceSubtitle;
    if (subjInput) subjInput.value = serviceTitle;

    modalReq.classList.add('active');
  };

  if (btnCloseReq) btnCloseReq.onclick = () => modalReq.classList.remove('active');

  // Evento Solución por Rubro
  const btnReqIndustry = document.getElementById('btn-request-industry-solution');
  if (btnReqIndustry) {
    btnReqIndustry.onclick = (e) => {
      e.preventDefault();
      const title = document.getElementById('res-industry-title').textContent;
      const tag = document.getElementById('res-industry-tag').textContent;
      window.openServiceRequestModal(title, tag);
    };
  }

  // Evento Calculadora de Presupuesto
  const btnCalcReq = document.getElementById('btn-calc-request-modal');
  if (btnCalcReq) {
    btnCalcReq.onclick = (e) => {
      e.preventDefault();
      const totalUSD = document.getElementById('calc-total-usd')?.textContent || '$350 USD';
      const totalTime = document.getElementById('calc-total-time')?.textContent || '3 días';
      const selectedCards = document.querySelectorAll('.calc-options .option-card.selected strong');
      const modules = Array.from(selectedCards).map(el => el.textContent.trim()).join(', ');
      
      const title = `Proyecto Calculado: ${modules || 'Módulos Seleccionados'}`;
      const subtitle = `Presupuesto: ${totalUSD} | Plazo: ${totalTime}`;
      window.openServiceRequestModal(title, subtitle);
    };
  }

  // Submit Formulario Auditoría Ciberseguridad
  if (formSec) {
    formSec.onsubmit = async (e) => {
      e.preventDefault();
      const selectedTier = document.querySelector('input[name="sec_tier"]:checked')?.value || '450';
      const isTier200 = selectedTier === '200';
      const phoneSec = document.getElementById('sec-modal-phone')?.value.trim() || '';
      const prefSec = document.getElementById('sec-modal-contact-pref')?.value || 'WhatsApp';

      const data = {
        name: document.getElementById('sec-modal-name').value.trim(),
        email: document.getElementById('sec-modal-email').value.trim(),
        phone: phoneSec,
        contact_pref: prefSec,
        subject: isTier200 ? '🛡️ DIAGNÓSTICO DE CIBERSEGURIDAD (NIVEL 1 - $200 USD)' : '🛡️ AUDITORÍA + HARDENING TOTAL (NIVEL 2 - $450 USD)',
        website: document.getElementById('sec-modal-website').value.trim(),
        budgetText: isTier200 ? '$200 USD (Plazo 2 días)' : '$450 USD (Plazo 4 días)',
        message: document.getElementById('sec-modal-message').value.trim()
      };

      await sendTelegramNotification(data);
      if (window.portfolioDB) {
        await window.portfolioDB.add('messages', { ...data, timestamp: new Date().toISOString() });
      }
      showToast('¡Solicitud enviada! En 2 a 4 hrs recibirás un correo desde contacto@ppvsoluciones.cl con la orden PDF y documento de inicio.');
      formSec.reset();
      modalSec.classList.remove('active');
    };
  }

  // Submit Formulario Solicitud Rápida
  if (formReq) {
    formReq.onsubmit = async (e) => {
      e.preventDefault();
      const phoneReq = document.getElementById('req-modal-phone')?.value.trim() || '';
      const prefReq = document.getElementById('req-modal-contact-pref')?.value || 'WhatsApp';

      const data = {
        name: document.getElementById('req-modal-name').value.trim(),
        email: document.getElementById('req-modal-email').value.trim(),
        phone: phoneReq,
        contact_pref: prefReq,
        subject: document.getElementById('req-modal-subject').value.trim(),
        budgetText: 'Por definir',
        message: document.getElementById('req-modal-message').value.trim()
      };

      await sendTelegramNotification(data);
      if (window.portfolioDB) {
        await window.portfolioDB.add('messages', { ...data, timestamp: new Date().toISOString() });
      }
      showToast('¡Solicitud enviada con éxito! Te contactaremos a la brevedad.');
      formReq.reset();
      modalReq.classList.remove('active');
    };
  }

  // Abrir panel o solicitar login
  if (btnOpenDB) btnOpenDB.onclick = () => requestAdminAccess();
  if (btnOpenDBDrawer) btnOpenDBDrawer.onclick = () => requestAdminAccess();

  if (btnCloseDB) btnCloseDB.onclick = () => modalDB.classList.remove('active');
  if (btnCloseLogin) btnCloseLogin.onclick = () => modalLogin.classList.remove('active');

  function isAuthorized() {
    return sessionStorage.getItem('ppv_admin_logged') === 'true';
  }

  function requestAdminAccess() {
    if (isAuthorized()) {
      openDBModal();
    } else {
      if (errorMsg) errorMsg.style.display = 'none';
      modalLogin.classList.add('active');
    }
  }

  // Procesar Login Form
  if (formLogin) {
    formLogin.onsubmit = (e) => {
      e.preventDefault();
      const inputEmail = document.getElementById('admin-email').value.trim();
      const inputPass = document.getElementById('admin-password').value.trim();

      // Verificar contra hashes SHA-256 (nunca comparar texto plano)
      Promise.all([hashString(inputEmail), hashString(inputPass)]).then(([eHash, pHash]) => {
        if (eHash === ADMIN_HASHES.emailHash && pHash === ADMIN_HASHES.passHash) {
          sessionStorage.setItem('ppv_admin_logged', 'true');
          sessionStorage.setItem('ppv_admin_email', inputEmail);
          modalLogin.classList.remove('active');
          showToast('¡Sesión iniciada con éxito!');
          openDBModal();
        } else {
          if (errorMsg) errorMsg.style.display = 'flex';
        }
      });
    };
  }

  // Logout
  if (btnLogout) {
    btnLogout.onclick = () => {
      sessionStorage.removeItem('ppv_admin_logged');
      sessionStorage.removeItem('ppv_admin_email');
      modalDB.classList.remove('active');
      showToast('Sesión de administración cerrada.');
    };
  }

  async function openDBModal() {
    modalDB.classList.add('active');
    const sessionEmailEl = document.getElementById('admin-session-email');
    if (sessionEmailEl) {
      sessionEmailEl.textContent = sessionStorage.getItem('ppv_admin_email') || ADMIN_CREDENTIALS.email;
    }
    await loadDBTable();
    await loadMaintainerServicesTable();
    await loadMaintainerSkillsTable();
    await loadMaintainerBlockedTable();
  }

  // Atajo secret: Ctrl + Shift + A para solicitar acceso
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      requestAdminAccess();
    }
  });

  // Exportar JSON
  if (btnExportJSON) {
    btnExportJSON.onclick = async () => {
      const messages = await window.portfolioDB.getAllMessages();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ppv_mensajes_db_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };
  }

  // Modal Kit Freelance
  const modalKit = document.getElementById('modal-kit-freelance');
  const btnOpenKit = document.getElementById('btn-open-kit-freelance');
  const btnCloseKit = document.getElementById('btn-close-kit-modal');

  if (btnOpenKit) btnOpenKit.onclick = () => modalKit.classList.add('active');
  if (btnCloseKit) btnCloseKit.onclick = () => modalKit.classList.remove('active');
}


/* Cargar tabla de mensajes */
async function loadDBTable() {
  const tbody = document.getElementById('db-messages-tbody');
  if (!tbody || !window.portfolioDB) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">Cargando...</td></tr>';
  const messages = await window.portfolioDB.getAllMessages();

  if (!messages.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">No hay mensajes registrados aún.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  messages.forEach(msg => {
    const tr = document.createElement('tr');
    const badgeClass = msg.status === 'Nuevo' ? 'badge-new' : (msg.status === 'Leído' ? 'badge-read' : 'badge-replied');
    
    tr.innerHTML = `
      <td style="font-family: var(--font-code); color: var(--neon-cyan);">#${msg.id}</td>
      <td style="color: var(--text-muted); font-size: 0.8rem;">${msg.timestampFormatted}</td>
      <td><strong>${escapeHtml(msg.name)}</strong></td>
      <td style="color: var(--neon-violet);">${escapeHtml(msg.email)}</td>
      <td style="color: var(--neon-emerald); font-weight: 600;">${escapeHtml(msg.budget)}</td>
      <td><span class="badge-status ${badgeClass}">${msg.status}</span></td>
      <td>
        <button class="btn btn-outline btn-change-status" data-id="${msg.id}" style="padding: 2px 6px; font-size: 0.75rem;">
          <i class="fa-solid fa-check"></i>
        </button>
        <button class="btn btn-outline btn-delete-msg" data-id="${msg.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-change-status').forEach(btn => {
    btn.onclick = async () => {
      await window.portfolioDB.updateMessageStatus(parseInt(btn.dataset.id, 10), 'Respondido');
      loadDBTable();
    };
  });

  tbody.querySelectorAll('.btn-delete-msg').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Eliminar este mensaje de la base de datos?')) {
        await window.portfolioDB.deleteMessage(parseInt(btn.dataset.id, 10));
        loadDBTable();
      }
    };
  });
}

/* --------------------------------------------------------------------------
   8. PESTAÑAS DEL MANTENEDOR DE ADMINISTRACIÓN
   -------------------------------------------------------------------------- */
function initMaintainerTabs() {
  const tabBtns = document.querySelectorAll('.maintainer-tab-btn');
  const panels = document.querySelectorAll('.maintainer-panel');

  tabBtns.forEach(btn => {
    btn.onclick = () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.mTarget);
      if (target) target.classList.add('active');
    };
  });
}

/* --------------------------------------------------------------------------
   9. CRUD MANTENEDOR DE SERVICIOS & PRECIOS
   -------------------------------------------------------------------------- */
function initMaintainerServicesCRUD() {
  const form = document.getElementById('form-maintainer-service');
  const btnCancel = document.getElementById('btn-cancel-service');

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const idInput = document.getElementById('m-service-id').value;
    
    const serviceData = {
      title: document.getElementById('m-service-title').value.trim(),
      priceUSD: parseInt(document.getElementById('m-service-price').value, 10) || 0,
      timeDays: document.getElementById('m-service-time').value.trim(),
      desc: document.getElementById('m-service-desc').value.trim(),
      icon: 'fa-check'
    };

    if (idInput) {
      serviceData.id = parseInt(idInput, 10);
    }

    await window.portfolioDB.saveService(serviceData);
    showToast(idInput ? 'Servicio actualizado correctamente.' : 'Nuevo servicio agregado.');
    resetServiceForm();
    await loadMaintainerServicesTable();
    await loadServicesCalculator(); // Actualiza la vista pública inmediatamente
  };

  if (btnCancel) {
    btnCancel.onclick = () => resetServiceForm();
  }

  function resetServiceForm() {
    form.reset();
    document.getElementById('m-service-id').value = '';
    document.getElementById('service-form-title').innerHTML = '<i class="fa-solid fa-plus"></i> Agregar / Editar Servicio de la Calculadora';
  }
}

async function loadMaintainerServicesTable() {
  const tbody = document.getElementById('m-services-tbody');
  if (!tbody || !window.portfolioDB) return;

  const services = await window.portfolioDB.getAll('services');
  tbody.innerHTML = '';

  if (!services.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No hay servicios.</td></tr>';
    return;
  }

  services.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: var(--font-code); color: var(--neon-cyan);">#${s.id}</td>
      <td><strong>${escapeHtml(s.title)}</strong></td>
      <td style="color: var(--neon-emerald); font-weight: 700;">$${s.priceUSD} USD</td>
      <td style="color: var(--neon-violet);">${escapeHtml(s.timeDays)}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(s.desc)}</td>
      <td>
        <button class="btn btn-outline btn-edit-service" data-id="${s.id}" style="padding: 2px 6px; font-size: 0.75rem;">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-outline btn-delete-service" data-id="${s.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-edit-service').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id, 10);
      const all = await window.portfolioDB.getAll('services');
      const target = all.find(x => x.id === id);
      if (target) {
        document.getElementById('m-service-id').value = target.id;
        document.getElementById('m-service-title').value = target.title;
        document.getElementById('m-service-price').value = target.priceUSD;
        document.getElementById('m-service-time').value = target.timeDays;
        document.getElementById('m-service-desc').value = target.desc;
        document.getElementById('service-form-title').innerHTML = `<i class="fa-solid fa-pen"></i> Editando Servicio #${target.id}`;
      }
    };
  });

  tbody.querySelectorAll('.btn-delete-service').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Eliminar este servicio de la calculadora?')) {
        await window.portfolioDB.deleteService(parseInt(btn.dataset.id, 10));
        await loadMaintainerServicesTable();
        await loadServicesCalculator();
        showToast('Servicio eliminado.');
      }
    };
  });
}

/* --------------------------------------------------------------------------
   10. CRUD MANTENEDOR DE HABILIDADES TÉCNICAS
   -------------------------------------------------------------------------- */
function initMaintainerSkillsCRUD() {
  const form = document.getElementById('form-maintainer-skill');
  const btnCancel = document.getElementById('btn-cancel-skill');

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const idInput = document.getElementById('m-skill-id').value;

    const skillData = {
      name: document.getElementById('m-skill-name').value.trim(),
      category: document.getElementById('m-skill-category').value,
      level: document.getElementById('m-skill-level').value.trim(),
      levelText: document.getElementById('m-skill-text').value.trim(),
      desc: document.getElementById('m-skill-desc').value.trim()
    };

    if (idInput) {
      skillData.id = parseInt(idInput, 10);
    }

    await window.portfolioDB.saveSkill(skillData);
    showToast(idInput ? 'Habilidad actualizada correctamente.' : 'Nueva habilidad agregada.');
    resetSkillForm();
    await loadMaintainerSkillsTable();
    await loadSkillsMatrix(); // Actualiza la matriz pública inmediatamente
  };

  if (btnCancel) {
    btnCancel.onclick = () => resetSkillForm();
  }

  function resetSkillForm() {
    form.reset();
    document.getElementById('m-skill-id').value = '';
    document.getElementById('skill-form-title').innerHTML = '<i class="fa-solid fa-plus"></i> Agregar / Editar Habilidad Técnica';
  }
}

async function loadMaintainerSkillsTable() {
  const tbody = document.getElementById('m-skills-tbody');
  if (!tbody || !window.portfolioDB) return;

  const skills = await window.portfolioDB.getAll('skills');
  tbody.innerHTML = '';

  if (!skills.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No hay habilidades.</td></tr>';
    return;
  }

  skills.forEach(sk => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: var(--font-code); color: var(--neon-cyan);">#${sk.id}</td>
      <td><strong>${escapeHtml(sk.name)}</strong></td>
      <td style="color: var(--neon-violet); text-transform: uppercase; font-size: 0.75rem;">${escapeHtml(sk.category)}</td>
      <td style="color: var(--neon-emerald);">${escapeHtml(sk.level)} (${escapeHtml(sk.levelText)})</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(sk.desc)}</td>
      <td>
        <button class="btn btn-outline btn-edit-skill" data-id="${sk.id}" style="padding: 2px 6px; font-size: 0.75rem;">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-outline btn-delete-skill" data-id="${sk.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-edit-skill').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id, 10);
      const all = await window.portfolioDB.getAll('skills');
      const target = all.find(x => x.id === id);
      if (target) {
        document.getElementById('m-skill-id').value = target.id;
        document.getElementById('m-skill-name').value = target.name;
        document.getElementById('m-skill-category').value = target.category;
        document.getElementById('m-skill-level').value = target.level;
        document.getElementById('m-skill-text').value = target.levelText || target.level;
        document.getElementById('m-skill-desc').value = target.desc;
        document.getElementById('skill-form-title').innerHTML = `<i class="fa-solid fa-pen"></i> Editando Habilidad #${target.id}`;
      }
    };
  });

  tbody.querySelectorAll('.btn-delete-skill').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Eliminar esta habilidad de la matriz pública?')) {
        await window.portfolioDB.deleteSkill(parseInt(btn.dataset.id, 10));
        await loadMaintainerSkillsTable();
        await loadSkillsMatrix();
        showToast('Habilidad eliminada.');
      }
    };
  });
}

/* --------------------------------------------------------------------------
   11. COPIAR TEXTO AL PORTAPAPELES
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   11. CRUD MANTENEDOR DE PALABRAS / RUBROS BLOQUEADOS
   -------------------------------------------------------------------------- */
function initMaintainerBlockedCRUD() {
  const form = document.getElementById('form-maintainer-blocked');
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const wordInput = document.getElementById('m-blocked-word').value.trim();
    if (!wordInput) return;

    try {
      await window.portfolioDB.addBlockedWord(wordInput);
      showToast(`Término "${wordInput}" agregado a la lista negra.`);
      form.reset();
      await loadMaintainerBlockedTable();
    } catch (err) {
      showToast('Ese término ya existe en la lista negra.', true);
    }
  };
}

async function loadMaintainerBlockedTable() {
  const tbody = document.getElementById('m-blocked-tbody');
  if (!tbody || !window.portfolioDB) return;

  const records = await window.portfolioDB.getAll('blocked');
  tbody.innerHTML = '';

  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No hay palabras bloqueadas.</td></tr>';
    return;
  }

  records.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: var(--font-code); color: var(--neon-cyan);">#${r.id}</td>
      <td><strong style="color: var(--neon-pink);">${escapeHtml(r.word)}</strong></td>
      <td><span class="badge-status" style="background: rgba(255,0,127,0.2); color: var(--neon-pink);">Bloqueado</span></td>
      <td>
        <button class="btn btn-outline btn-delete-blocked" data-id="${r.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i> Quitar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-delete-blocked').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Quitar esta palabra de la lista negra?')) {
        await window.portfolioDB.deleteBlockedWord(parseInt(btn.dataset.id, 10));
        await loadMaintainerBlockedTable();
        showToast('Término eliminado de la lista negra.');
      }
    };
  });
}

function initCopyButtons() {
  const copyBtns = document.querySelectorAll('.copy-btn');
  copyBtns.forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.dataset.copy;
      const textEl = document.getElementById(targetId);
      if (textEl) {
        navigator.clipboard.writeText(textEl.textContent.trim());
        showToast('¡Texto copiado al portapapeles!');
      }
    };
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function loadClientsSection() {
  const grid = document.getElementById('clients-grid');
  const filterBtns = document.querySelectorAll('.client-filter-btn');
  if (!grid || !window.portfolioDB) return;

  const clients = await window.portfolioDB.getAllClients();
  renderGrid(clients);

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = 'rgba(255,255,255,0.2)';
        b.style.color = 'var(--text-muted)';
      });
      btn.classList.add('active');
      btn.style.borderColor = 'var(--neon-cyan)';
      btn.style.color = 'var(--neon-cyan)';

      const filter = btn.dataset.filter;
      if (filter === 'all') {
        renderGrid(clients);
      } else {
        const filtered = clients.filter(c => c.category === filter);
        renderGrid(filtered);
      }
    };
  });

  function renderGrid(items) {
    grid.innerHTML = '';
    if (!items || items.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No hay casos de éxito registrados en esta categoría.</div>';
      return;
    }

    items.forEach(c => {
      const card = document.createElement('div');
      card.className = 'glass-card';
      card.style.cssText = 'display: flex; flex-direction: column; justify-content: space-between; border-color: rgba(0, 243, 255, 0.2); transition: all 0.3s ease; position: relative; overflow: hidden;';

      const categoryColor = c.category === 'Ciberseguridad' ? 'var(--neon-pink)' : (c.category === 'Desarrollo Web' ? 'var(--neon-cyan)' : 'var(--neon-violet)');
      const webBtn = c.website ? `<a href="${escapeHtml(c.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size: 0.78rem; padding: 4px 10px; border-color: ${categoryColor}; color: ${categoryColor}; text-decoration: none;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Visitar Sitio Web</a>` : '';

      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
            <h3 style="font-size: 1.15rem; color: #fff; margin: 0;">${escapeHtml(c.name)}</h3>
            <span class="badge-status" style="background: rgba(0,243,255,0.08); border: 1px solid ${categoryColor}; color: ${categoryColor}; font-size: 0.75rem;">${escapeHtml(c.badge || c.category)}</span>
          </div>

          <div style="font-size: 0.82rem; color: var(--neon-cyan); font-weight: 600; margin-bottom: 0.6rem;">
            <i class="fa-solid fa-briefcase"></i> ${escapeHtml(c.rubro)}
          </div>

          <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.2rem;">
            <strong style="color: #d0d5e2; display: block; margin-bottom: 0.2rem;">💡 Solución Entregada:</strong>
            ${escapeHtml(c.solution)}
          </p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.8rem; margin-top: 0.5rem;">
          <span style="font-size: 0.75rem; color: var(--neon-emerald);"><i class="fa-solid fa-circle-check"></i> Proyecto Cumplido</span>
          ${webBtn}
        </div>
      `;
      grid.appendChild(card);
    });
  }
}

/* --------------------------------------------------------------------------
   16. TARJETA DIGITAL EJECUTIVA & CÓDIGO QR (VCARD DINÁMICO)
   -------------------------------------------------------------------------- */
async function initVCardLogic() {
  const btnDownloadVCard = document.querySelectorAll('.btn-download-vcard');
  const btnCopyVCardLink = document.querySelectorAll('.btn-copy-vcard-link');
  const btnOpenModal = document.querySelectorAll('.btn-open-vcard-modal');
  const modalVCard = document.getElementById('modal-vcard');
  const btnCloseModal = document.getElementById('btn-close-vcard-modal');

  let profile = null;
  if (window.portfolioDB) {
    profile = await window.portfolioDB.getConfig('vcard_profile');
  }
  if (!profile) {
    const local = localStorage.getItem('ppv_vcard_profile');
    if (local) {
      try { profile = JSON.parse(local); } catch(e){}
    }
  }

  if (!profile) {
    profile = {
      name: 'Patricio Padilla',
      role: 'CEO & Fundador — PPV Soluciones',
      email: 'ppv@ppvsoluciones.cl',
      phone: '+56 9 5704 0679',
      location: 'Santiago, Chile',
      desc: 'Especialista en Ciberseguridad Web, Hardening de Servidores Linux/Docker, Automatización de Procesos con IA (n8n) y Desarrollo de Software en Chile.'
    };
  }

  // Actualizar DOM en la tarjeta pública si existe
  const vcardSection = document.getElementById('vcard');
  if (vcardSection) {
    const nameEl = vcardSection.querySelector('.vcard-info h3');
    const roleEl = vcardSection.querySelector('.vcard-info p');
    const descEl = vcardSection.querySelector('.vcard-card > p');
    const emailEl = vcardSection.querySelector('.vcard-details-list li:nth-child(1) span');
    const phoneEl = vcardSection.querySelector('.vcard-details-list li:nth-child(2) span');
    const locEl = vcardSection.querySelector('.vcard-details-list li:nth-child(4) span');
    const qrImg = vcardSection.querySelector('.qr-code-img');
    const avatarEl = vcardSection.querySelector('.vcard-avatar');

    if (nameEl) nameEl.textContent = profile.name;
    if (roleEl) roleEl.textContent = profile.role;
    if (descEl) descEl.textContent = profile.desc;
    if (emailEl) emailEl.innerHTML = `<strong>Correo Oficial:</strong> ${escapeHtml(profile.email)}`;
    if (phoneEl) phoneEl.innerHTML = `<strong>WhatsApp Directo:</strong> ${escapeHtml(profile.phone)}`;
    if (locEl) locEl.innerHTML = `<strong>Ubicación:</strong> ${escapeHtml(profile.location)}`;

    if (avatarEl) {
      const initials = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      avatarEl.textContent = initials || 'PP';
    }

    const cleanPhone = profile.phone.replace(/[^0-9]/g, '');
    const waLink = vcardSection.querySelector('a[href*="wa.me"]');
    if (waLink && cleanPhone) waLink.href = `https://wa.me/${cleanPhone}`;

    const mailLink = vcardSection.querySelector('a[href*="mailto:"]');
    if (mailLink) mailLink.href = `mailto:${profile.email}`;

    const vcardStr = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nORG:PPV Soluciones\nTITLE:${profile.role}\nTEL;TYPE=CELL,VOICE:${profile.phone}\nEMAIL;TYPE=INTERNET,PREF:${profile.email}\nURL:https://ppvsoluciones.cl\nEND:VCARD`;

    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(vcardStr)}`;
    }
  }

  // Actualizar Modal
  if (modalVCard) {
    const mName = modalVCard.querySelector('h3');
    const mRole = modalVCard.querySelector('p');
    const mQR = modalVCard.querySelector('img');
    const mWa = modalVCard.querySelector('a[href*="wa.me"], a.btn-secondary');
    const mMail = modalVCard.querySelector('a[href*="mailto:"], a.btn-vcard-email');
    const mAvatar = modalVCard.querySelector('div[style*="border-radius: 50%"]');

    if (mName) mName.textContent = profile.name;
    if (mRole) mRole.textContent = profile.role;
    if (mAvatar) {
      const initials = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      mAvatar.textContent = initials || 'PP';
    }

    const cleanPhone = profile.phone.replace(/[^0-9]/g, '');
    if (mWa && cleanPhone) {
      mWa.href = `https://wa.me/${cleanPhone}`;
    }
    if (mMail) {
      mMail.href = `mailto:${profile.email}`;
    }

    const vcardStr = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nORG:PPV Soluciones\nTITLE:${profile.role}\nTEL;TYPE=CELL,VOICE:${profile.phone}\nEMAIL;TYPE=INTERNET,PREF:${profile.email}\nURL:https://ppvsoluciones.cl\nEND:VCARD`;

    if (mQR) {
      mQR.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(vcardStr)}`;
    }
  }

  const currentVCardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nORG:PPV Soluciones\nTITLE:${profile.role}\nTEL;TYPE=CELL,VOICE:${profile.phone}\nEMAIL;TYPE=INTERNET,PREF:${profile.email}\nURL:https://ppvsoluciones.cl\nEND:VCARD`;

  btnDownloadVCard.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const blob = new Blob([currentVCardData], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${profile.name.replace(/\s+/g, '_')}_PPV.vcf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`🎴 Contacto descargado (${profile.name}_PPV.vcf). ¡Guárdalo en tu celular!`);
    };
  });

  btnCopyVCardLink.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      navigator.clipboard.writeText('https://ppvsoluciones.cl/#vcard');
      showToast('📋 Enlace de Tarjeta Digital copiado al portapapeles.');
    };
  });

  // Click listeners delegados para abrir vcard
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href="#vcard"], .btn-open-vcard-modal');
    if (link) {
      e.preventDefault();
      if (modalVCard) modalVCard.style.display = 'flex';
    }
  });

  if (btnCloseModal && modalVCard) {
    btnCloseModal.onclick = () => modalVCard.style.display = 'none';
  }

  if (modalVCard) {
    modalVCard.onclick = (e) => {
      if (e.target === modalVCard) modalVCard.style.display = 'none';
    };
  }
}


/* --------------------------------------------------------------------------
   16. GESTIÓN DE PREVISUALIZACIÓN Y COTIZACIÓN DE FORMATOS WEB EN UF
   -------------------------------------------------------------------------- */
function initFormatPreviews() {
  const modalFormat = document.getElementById('modal-format-preview');
  const btnCloseFormat = document.getElementById('btn-close-format-modal');
  const modalBody = document.getElementById('format-modal-body');

  const formatData = {
    landing: {
      title: 'Landing Page (Página de Aterrizaje)',
      badge: '🎯 Objetivo: Alta Conversión de Leads',
      uf: '4 – 12 UF (~ $160.000 – $480.000 CLP + IVA)',
      budget: '4-12 UF',
      desc: 'Formato diseñado exclusivamente para transformar visitantes en clientes. No posee menús con enlaces externos ni distracciones.',
      mockupHtml: `
        <div class="mini-browser-mockup" style="background: #0d111a; border: 1px solid var(--neon-cyan); border-radius: 10px; overflow: hidden; margin-bottom: 1.2rem; box-shadow: 0 8px 25px rgba(0,243,255,0.15);">
          <div style="background: #161d2b; padding: 6px 12px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
            <div style="background: #0d111a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1px 10px; font-size: 0.68rem; color: var(--neon-cyan); flex: 1; text-align: center; font-family: monospace;">https://oferta.tu-empresa.cl/landing-demo</div>
          </div>
          <div style="padding: 0.9rem; background: #0a0d14;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px; margin-bottom: 10px;">
              <span style="color: var(--neon-cyan); font-weight: 800; font-size: 0.8rem;">[LOGO EMPRESA]</span>
              <span style="background: #10b981; color: #000; font-weight: 800; padding: 2px 8px; border-radius: 4px; font-size: 0.65rem;">
                <i class="fa-brands fa-whatsapp"></i> Llamar / WhatsApp
              </span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(0,243,255,0.04); border: 1px dashed var(--neon-cyan); padding: 10px; border-radius: 6px; margin-bottom: 8px;">
              <div>
                <span style="background: rgba(255,0,127,0.2); color: var(--neon-pink); padding: 2px 6px; border-radius: 4px; font-size: 0.62rem; font-weight: 700;">OFERTA ÚNICA</span>
                <h4 style="color: #fff; font-size: 0.82rem; margin: 3px 0;">¡Obtén tu Cotización Directa Hoy!</h4>
                <p style="font-size: 0.68rem; color: var(--text-muted); margin: 0;">Captura el 100% de la atención sin enlaces externos que distraigan.</p>
              </div>
              <div style="background: #161d2b; padding: 6px; border-radius: 6px; border: 1px solid var(--border-glow);">
                <div style="font-size: 0.68rem; color: #fff; font-weight: 700; margin-bottom: 4px;">Formulario de Registro</div>
                <div style="background: #0d111a; height: 16px; border-radius: 3px; margin-bottom: 3px; font-size: 0.6rem; color: #666; padding: 1px 4px;">Tu Nombre</div>
                <div style="background: #0d111a; height: 16px; border-radius: 3px; margin-bottom: 4px; font-size: 0.6rem; color: #666; padding: 1px 4px;">Teléfono WhatsApp</div>
                <div style="background: var(--neon-cyan); color: #000; font-weight: 800; font-size: 0.64rem; text-align: center; padding: 2px; border-radius: 3px;">
                  ¡ENVIAR AHORA!
                </div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; text-align: center;">
              <div style="background: rgba(255,255,255,0.02); padding: 4px; border-radius: 4px; font-size: 0.62rem; color: var(--text-muted);">
                <i class="fa-solid fa-bolt text-cyan"></i><br><strong style="color: #fff;">100% Enfocado</strong>
              </div>
              <div style="background: rgba(255,255,255,0.02); padding: 4px; border-radius: 4px; font-size: 0.62rem; color: var(--text-muted);">
                <i class="fa-solid fa-shield text-emerald"></i><br><strong style="color: #fff;">Sin Distracciones</strong>
              </div>
              <div style="background: rgba(255,255,255,0.02); padding: 4px; border-radius: 4px; font-size: 0.62rem; color: var(--text-muted);">
                <i class="fa-solid fa-star text-pink"></i><br><strong style="color: #fff;">Alta Conversión</strong>
              </div>
            </div>
          </div>
        </div>
      `,
      diagram: [
        { section: '1. Encabezado Impactante', icon: 'fa-heading', detail: 'Titular de propuesta de valor clara + Subtítulo persuasivo + Botón directo a WhatsApp/Formulario.' },
        { section: '2. Formulario Lead / Captura', icon: 'fa-wpforms', detail: 'Campos breves de contacto directo (Nombre, Teléfono, Correo) conectados a Telegram/Email.' },
        { section: '3. Beneficios & Galería', icon: 'fa-star', detail: 'Iconos de ventajas competitivas, imágenes atractivas del producto o servicio y testimonios.' },
        { section: '4. Llamado a la Acción (CTA)', icon: 'fa-paper-plane', detail: 'Botón final flotante o fijo de contacto para cerrar la venta.' }
      ],
      idealFor: 'Lanzamiento de ofertas específicas, campañas de publicidad en Google Ads o Meta Ads, captar leads calificados.',
      subject: 'Cotización de Landing Page (4-12 UF)'
    },
    onepage: {
      title: 'Sitio "One-Page" (Página Única Ágil)',
      badge: '⚡ Objetivo: Presencia Rápida & Fluida',
      uf: '6 – 20 UF (~ $240.000 – $800.000 CLP + IVA)',
      budget: '6-20 UF',
      desc: 'Toda la empresa explicada en una sola página larga con desplazamiento automático (Smooth Scroll) al presionar las opciones del menú.',
      mockupHtml: `
        <div class="mini-browser-mockup" style="background: #0d111a; border: 1px solid var(--neon-emerald); border-radius: 10px; overflow: hidden; margin-bottom: 1.2rem; box-shadow: 0 8px 25px rgba(0,255,136,0.15);">
          <div style="background: #161d2b; padding: 6px 12px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
            <div style="background: #0d111a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1px 10px; font-size: 0.68rem; color: var(--neon-emerald); flex: 1; text-align: center; font-family: monospace;">https://www.tu-empresa.cl (Navegación Scroll Única)</div>
          </div>
          <div style="padding: 0.9rem; background: #0a0d14;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #161d2b; padding: 5px 8px; border-radius: 6px; margin-bottom: 8px;">
              <span style="color: var(--neon-emerald); font-weight: 800; font-size: 0.78rem;">MI MARCA</span>
              <div style="display: flex; gap: 6px; font-size: 0.62rem; color: var(--text-muted);">
                <span style="color: var(--neon-cyan); text-decoration: underline;">#Inicio</span>
                <span>#Nosotros</span>
                <span>#Servicios</span>
                <span>#Contacto</span>
              </div>
            </div>
            <div style="background: linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,243,255,0.05)); border: 1px solid var(--neon-emerald); padding: 8px; border-radius: 6px; margin-bottom: 6px; text-align: center;">
              <h4 style="color: #fff; font-size: 0.8rem; margin: 0 0 2px 0;">Soluciones Integrales en Una Sola Vista</h4>
              <span style="font-size: 0.64rem; color: var(--neon-emerald);">Desplazamiento fluido a secciones sin recargar la página</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div style="background: rgba(255,255,255,0.03); padding: 5px; border-radius: 4px;">
                <span style="font-size: 0.62rem; color: var(--neon-cyan); font-weight: 700;">SECCIÓN: NOSOTROS</span>
                <p style="font-size: 0.6rem; color: var(--text-muted); margin: 2px 0 0 0;">Historia, equipo y valores resumidos.</p>
              </div>
              <div style="background: rgba(255,255,255,0.03); padding: 5px; border-radius: 4px;">
                <span style="font-size: 0.62rem; color: var(--neon-emerald); font-weight: 700;">SECCIÓN: SERVICIOS</span>
                <p style="font-size: 0.6rem; color: var(--text-muted); margin: 2px 0 0 0;">Grid de tarjetas de servicios y oferta.</p>
              </div>
            </div>
          </div>
        </div>
      `,
      diagram: [
        { section: '1. Barra de Navegación', icon: 'fa-bars', detail: 'Menú fijo con enlaces a secciones internas (Inicio, Nosotros, Servicios, Contacto).' },
        { section: '2. Banner Principal & Quiénes Somos', icon: 'fa-address-card', detail: 'Presentación del equipo, historia resumida y misión de la empresa.' },
        { section: '3. Grid de Servicios o Productos', icon: 'fa-cubes', detail: 'Tarjetas informativas de los servicios ofrecidos con precios o descripción.' },
        { section: '4. Formulario de Contacto & Mapa', icon: 'fa-location-dot', detail: 'Formulario integrado al final del scroll junto con canales directos.' }
      ],
      idealFor: 'Profesionales independientes, freelancers, consultores, PYMEs locales que no requieren cientos de páginas internas.',
      subject: 'Cotización de Sitio One-Page (6-20 UF)'
    },
    corporate: {
      title: 'Sitio Web Corporativo (Multi-Página & SEO)',
      badge: '🏢 Objetivo: Credibilidad & Posicionamiento en Google',
      uf: '12 – 38 UF (~ $480.000 – $1.500.000 CLP + IVA)',
      budget: '12-38 UF',
      desc: 'Plataforma completa estructurada en varias páginas independientes para presentar la empresa con máxima solvencia institucional.',
      mockupHtml: `
        <div class="mini-browser-mockup" style="background: #0d111a; border: 1px solid var(--neon-violet); border-radius: 10px; overflow: hidden; margin-bottom: 1.2rem; box-shadow: 0 8px 25px rgba(147,51,234,0.15);">
          <div style="background: #161d2b; padding: 6px 12px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
            <div style="background: #0d111a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1px 10px; font-size: 0.68rem; color: var(--neon-violet); flex: 1; text-align: center; font-family: monospace;">https://www.corporativo-empresa.cl (Multi-Página SEO)</div>
          </div>
          <div style="padding: 0.9rem; background: #0a0d14;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #161d2b; padding: 5px 8px; border-radius: 6px; margin-bottom: 8px;">
              <span style="color: var(--neon-violet); font-weight: 800; font-size: 0.78rem;">GLOBAL CORP</span>
              <div style="display: flex; gap: 6px; font-size: 0.62rem; color: var(--text-muted);">
                <span style="background: rgba(147,51,234,0.3); color: #fff; padding: 1px 5px; border-radius: 3px;">Inicio.html</span>
                <span>Nosotros.html</span>
                <span>Servicios/▼</span>
                <span>Contacto.html</span>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 6px; margin-bottom: 6px;">
              <div style="background: rgba(147,51,234,0.08); border: 1px solid var(--neon-violet); padding: 6px; border-radius: 6px;">
                <h4 style="color: #fff; font-size: 0.78rem; margin: 0 0 2px 0;">Líderes en Consultoría & Tecnología</h4>
                <p style="font-size: 0.6rem; color: var(--text-muted); margin: 0;">Múltiples subpáginas indexables independientemente en Google (SEO).</p>
              </div>
              <div style="background: rgba(255,255,255,0.03); padding: 5px; border-radius: 6px; font-size: 0.6rem; color: var(--text-muted);">
                <strong style="color: var(--neon-cyan); display: block;">Respaldo</strong>
                Certificaciones ISO, Convenio Marco, Clientes.
              </div>
            </div>
            <div style="background: #0d111a; padding: 4px 6px; border-radius: 4px; font-size: 0.58rem; color: #666; display: flex; justify-content: space-between;">
              <span>© 2026 Global Corp S.A.</span>
              <span>Mapa del Sitio | Políticas Legal</span>
            </div>
          </div>
        </div>
      `,
      diagram: [
        { section: '1. Página de Inicio (Home)', icon: 'fa-house', detail: 'Resumen ejecutivo de la empresa, servicios destacados, opiniones de clientes e hitos.' },
        { section: '2. Páginas de Servicios Internos', icon: 'fa-list-check', detail: 'Páginas dedicadas a cada servicio por separado para posicionar palabras clave en Google (SEO).' },
        { section: '3. Nosotros & Casos de Éxito', icon: 'fa-award', detail: 'Historia detallada, valores, certificaciones, portafolio de clientes y proyectos realizados.' },
        { section: '4. Central de Contacto & Soporte', icon: 'fa-headset', detail: 'Múltiples vías de atención, mapas interactivos, preguntas frecuentes (FAQ) y formularios.' }
      ],
      idealFor: 'Empresas consolidadas, consultoras, constructoras, clínicas e instituciones que necesitan transmitir seguridad institucional.',
      subject: 'Cotización de Sitio Corporativo (12-38 UF)'
    },
    ecommerce: {
      title: 'Tienda Online (E-commerce Automatizado)',
      badge: '🛒 Objetivo: Ventas Automatizadas 24/7',
      uf: '25 – 100+ UF (~ $1.000.000 – $4.000.000+ CLP + IVA)',
      budget: '25-100+ UF',
      desc: 'Sistema dinámico para vender productos físicos o digitales con pasarelas de pago y gestión automática de inventarios.',
      mockupHtml: `
        <div class="mini-browser-mockup" style="background: #0d111a; border: 1px solid var(--neon-pink); border-radius: 10px; overflow: hidden; margin-bottom: 1.2rem; box-shadow: 0 8px 25px rgba(255,0,127,0.15);">
          <div style="background: #161d2b; padding: 6px 12px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
            <div style="background: #0d111a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1px 10px; font-size: 0.68rem; color: var(--neon-pink); flex: 1; text-align: center; font-family: monospace;">https://tienda.tu-marca.cl (Catálogo & Carrito)</div>
          </div>
          <div style="padding: 0.9rem; background: #0a0d14;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #161d2b; padding: 5px 8px; border-radius: 6px; margin-bottom: 6px;">
              <span style="color: var(--neon-pink); font-weight: 800; font-size: 0.78rem;">STORE 24/7</span>
              <div style="background: #0d111a; border: 1px solid #333; padding: 1px 6px; border-radius: 10px; font-size: 0.6rem; color: #aaa;">🔍 Buscar...</div>
              <span style="background: var(--neon-pink); color: #fff; padding: 1px 6px; border-radius: 10px; font-size: 0.62rem; font-weight: 800;">🛒 Carrito (2)</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 6px;">
              <div style="background: rgba(255,0,127,0.06); border: 1px solid rgba(255,0,127,0.2); padding: 5px; border-radius: 5px; text-align: center;">
                <div style="background: #161d2b; height: 30px; border-radius: 3px; margin-bottom: 3px; display: flex; align-items: center; justify-content: center; color: var(--neon-pink); font-size: 0.8rem;"><i class="fa-solid fa-box-open"></i></div>
                <div style="font-size: 0.6rem; color: #fff; font-weight: 700;">Producto A</div>
                <div style="font-size: 0.58rem; color: var(--neon-emerald); font-weight: 800;">$29.990 CLP</div>
                <div style="background: var(--neon-pink); color: #fff; font-size: 0.55rem; padding: 1px; border-radius: 2px; margin-top: 2px; font-weight: 700;">+ Agregar</div>
              </div>
              <div style="background: rgba(255,0,127,0.06); border: 1px solid rgba(255,0,127,0.2); padding: 5px; border-radius: 5px; text-align: center;">
                <div style="background: #161d2b; height: 30px; border-radius: 3px; margin-bottom: 3px; display: flex; align-items: center; justify-content: center; color: var(--neon-cyan); font-size: 0.8rem;"><i class="fa-solid fa-shirt"></i></div>
                <div style="font-size: 0.6rem; color: #fff; font-weight: 700;">Producto B</div>
                <div style="font-size: 0.58rem; color: var(--neon-emerald); font-weight: 800;">$45.990 CLP</div>
                <div style="background: var(--neon-pink); color: #fff; font-size: 0.55rem; padding: 1px; border-radius: 2px; margin-top: 2px; font-weight: 700;">+ Agregar</div>
              </div>
              <div style="background: rgba(255,0,127,0.06); border: 1px solid rgba(255,0,127,0.2); padding: 5px; border-radius: 5px; text-align: center;">
                <div style="background: #161d2b; height: 30px; border-radius: 3px; margin-bottom: 3px; display: flex; align-items: center; justify-content: center; color: #ffb703; font-size: 0.8rem;"><i class="fa-solid fa-mobile-screen"></i></div>
                <div style="font-size: 0.6rem; color: #fff; font-weight: 700;">Producto C</div>
                <div style="font-size: 0.58rem; color: var(--neon-emerald); font-weight: 800;">$89.990 CLP</div>
                <div style="background: var(--neon-pink); color: #fff; font-size: 0.55rem; padding: 1px; border-radius: 2px; margin-top: 2px; font-weight: 700;">+ Agregar</div>
              </div>
            </div>
            <div style="background: #161d2b; padding: 4px 6px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 0.58rem; color: var(--text-muted);">
              <span>💳 Medios de Pago Integrados:</span>
              <span style="color: #fff; font-weight: 700;">Webpay Plus / MercadoPago / Tarjetas</span>
            </div>
          </div>
        </div>
      `,
      diagram: [
        { section: '1. Catálogo Dinámico & Filtros', icon: 'fa-boxes-stacked', detail: 'Búsqueda instantánea, categorías, ofertas y filtros por precio o atributo.' },
        { section: '2. Ficha de Producto', icon: 'fa-tag', detail: 'Galería de imágenes, variaciones de tamaño/color, stock en tiempo real y botón de compra.' },
        { section: '3. Carrito de Compras & Checkout', icon: 'fa-cart-shopping', detail: 'Revisión del pedido, cálculo de envío automatizado e ingreso de datos del comprador.' },
        { section: '4. Pasarela de Pago (Webpay / Tarjetas)', icon: 'fa-credit-card', detail: 'Procesamiento seguro con Webpay Plus, MercadoPago o tarjetas bancarias.' }
      ],
      idealFor: 'Negocios de retail, marcas de ropa, venta de insumos, suscripciones o servicios digitales con pago automático.',
      subject: 'Cotización de Tienda E-commerce (25-100+ UF)'
    },
    blog: {
      title: 'Blog o Portal de Contenidos & Noticias',
      badge: '📰 Objetivo: Tráfico Orgánico & Marketing de Contenidos',
      uf: '8 – 20 UF (~ $320.000 – $800.000 CLP + IVA)',
      budget: '8-20 UF',
      desc: 'Plataforma para la publicación periódica de artículos, noticias y guías clasificadas por categorías y etiquetas.',
      mockupHtml: `
        <div class="mini-browser-mockup" style="background: #0d111a; border: 1px solid #ffb703; border-radius: 10px; overflow: hidden; margin-bottom: 1.2rem; box-shadow: 0 8px 25px rgba(255,183,3,0.15);">
          <div style="background: #161d2b; padding: 6px 12px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
            <div style="background: #0d111a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1px 10px; font-size: 0.68rem; color: #ffb703; flex: 1; text-align: center; font-family: monospace;">https://blog.tu-marca.cl (Publicación & SEO)</div>
          </div>
          <div style="padding: 0.9rem; background: #0a0d14;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #161d2b; padding: 5px 8px; border-radius: 6px; margin-bottom: 6px;">
              <span style="color: #ffb703; font-weight: 800; font-size: 0.78rem;">BLOG DIGITAL</span>
              <div style="display: flex; gap: 6px; font-size: 0.6rem; color: var(--text-muted);">
                <span style="color: #ffb703;">Tecnología</span>
                <span>Negocios</span>
                <span>Tutoriales</span>
              </div>
            </div>
            <div style="background: rgba(255,183,3,0.06); border: 1px solid rgba(255,183,3,0.3); padding: 6px; border-radius: 6px; margin-bottom: 6px;">
              <span style="background: #ffb703; color: #000; font-size: 0.55rem; font-weight: 800; padding: 1px 4px; border-radius: 3px;">DESTACADO</span>
              <h4 style="color: #fff; font-size: 0.78rem; margin: 3px 0 2px 0;">"10 Estrategias de Marketing Digital para 2026"</h4>
              <div style="font-size: 0.58rem; color: var(--text-muted);">Por Patricio Padilla | ⏱️ 5 min lectura</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
              <div style="background: rgba(255,255,255,0.02); padding: 5px; border-radius: 4px; font-size: 0.6rem;">
                <strong style="color: #fff; display: block;">Guía de Ciberseguridad PYME</strong>
                <span style="color: #888;">Publicado el 5 de Agosto</span>
              </div>
              <div style="background: rgba(255,255,255,0.02); padding: 5px; border-radius: 4px; font-size: 0.6rem;">
                <strong style="color: #fff; display: block;">Cómo Automatizar tu CRM</strong>
                <span style="color: #888;">Publicado el 2 de Agosto</span>
              </div>
            </div>
          </div>
        </div>
      `,
      diagram: [
        { section: '1. Feed Principal de Artículos', icon: 'fa-newspaper', detail: 'Destacados de la semana, publicaciones recientes ordenadas por fecha e imágenes de portada.' },
        { section: '2. Vista de Lectura & Comentarios', icon: 'fa-file-lines', detail: 'Diseño limpio de lectura, tiempo estimado de lectura, autor y botones para compartir en redes.' },
        { section: '3. Categorías & Buscador Interno', icon: 'fa-magnifying-glass', detail: 'Búsqueda por palabras clave, etiquetas temáticas y artículos relacionados.' },
        { section: '4. Captura de Suscriptores / Newsletter', icon: 'fa-paper-plane', detail: 'Cajas de suscripción para boletines por correo y recomendación de servicios al final del post.' }
      ],
      idealFor: 'Medios digitales, blogs especializados, creadores de contenido o marcas que buscan posicionamiento SEO informativo.',
      subject: 'Cotización de Blog / Portal de Noticias (8-20 UF)'
    }
  };
  // Delegated click event for opening format preview modal
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-open-format-preview');
    if (btn) {
      e.preventDefault();
      const formatKey = btn.dataset.format;
      const data = formatData[formatKey];
      if (data && modalBody && modalFormat) {
        let diagramHtml = data.diagram.map(item => `
          <div style="background: rgba(13, 17, 26, 0.8); border: 1px solid var(--border-glow); padding: 0.9rem; border-radius: 8px; margin-bottom: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem; color: var(--neon-cyan); font-weight: 700; font-size: 0.9rem; margin-bottom: 0.3rem;">
              <i class="fa-solid ${item.icon}"></i> ${escapeHtml(item.section)}
            </div>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0; line-height: 1.4;">${escapeHtml(item.detail)}</p>
          </div>
        `).join('');

        modalBody.innerHTML = `
          <div style="text-align: left;">
            <div style="display: inline-block; background: rgba(0,243,255,0.1); color: var(--neon-cyan); border: 1px solid var(--neon-cyan); padding: 4px 12px; border-radius: 50px; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.8rem;">
              ${escapeHtml(data.badge)}
            </div>
            <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.3rem;">${escapeHtml(data.title)}</h2>
            <p style="font-size: 0.9rem; color: #ffb703; font-weight: 700; margin-bottom: 1rem;">
              <i class="fa-solid fa-tag"></i> Inversión Estimada: ${escapeHtml(data.uf)}
            </p>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
              ${escapeHtml(data.desc)}
            </p>

            <h4 style="font-size: 0.95rem; color: #fff; margin-bottom: 0.6rem;">
              <i class="fa-solid fa-desktop text-cyan"></i> Ejemplo Gráfico de Interfaz (${escapeHtml(data.title.split(' ')[0])})
            </h4>
            ${data.mockupHtml}

            <h4 style="font-size: 1rem; color: #fff; margin-bottom: 0.8rem; border-bottom: 1px solid var(--border-glow); padding-bottom: 0.4rem;">
              <i class="fa-solid fa-sitemap text-cyan"></i> Estructura & Diagrama de Secciones Incluidas
            </h4>
            <div style="margin-bottom: 1.2rem;">
              ${diagramHtml}
            </div>

            <div style="background: rgba(0, 255, 136, 0.05); border: 1px solid var(--neon-emerald); padding: 0.9rem; border-radius: 8px; margin-bottom: 1.5rem;">
              <strong style="color: var(--neon-emerald); font-size: 0.85rem; display: block; margin-bottom: 0.3rem;">
                <i class="fa-solid fa-circle-check"></i> Uso Recomendado:
              </strong>
              <p style="font-size: 0.82rem; color: var(--text-main); margin: 0; line-height: 1.4;">${escapeHtml(data.idealFor)}</p>
            </div>

            <button class="btn btn-primary btn-modal-select-format" data-subject="${escapeHtml(data.subject)}" data-budget="${escapeHtml(data.budget)}" style="width: 100%; font-size: 0.9rem;">
              <i class="fa-solid fa-paper-plane"></i> Solicitar Cotización de este Formato
            </button>
          </div>
        `;

        modalFormat.classList.add('active');
        modalFormat.style.display = 'flex';
      }
    }

    // Delegated click for "Cotizar este Formato" button inside format modal or cards
    const selectBtn = e.target.closest('.btn-select-format, .btn-modal-select-format');
    if (selectBtn) {
      e.preventDefault();
      const subject = selectBtn.dataset.subject || 'Cotización de Desarrollo Web';
      const budget = selectBtn.dataset.budget || '';

      const subjInput = document.getElementById('contact-subject');
      if (subjInput) subjInput.value = subject;

      const budgetSelect = document.getElementById('contact-budget');
      if (budgetSelect && budget) {
        budgetSelect.value = budget;
      }

      // Close format preview modal if open
      if (modalFormat) {
        modalFormat.classList.remove('active');
        modalFormat.style.display = 'none';
      }

      // Open contact modal
      const modalContacto = document.getElementById('modal-contacto');
      if (modalContacto) {
        modalContacto.classList.add('active');
        modalContacto.style.display = 'flex';
      }
    }
  });

  if (btnCloseFormat && modalFormat) {
    btnCloseFormat.onclick = () => {
      modalFormat.classList.remove('active');
      modalFormat.style.display = 'none';
    };
  }

  if (modalFormat) {
    modalFormat.onclick = (e) => {
      if (e.target === modalFormat) {
        modalFormat.classList.remove('active');
        modalFormat.style.display = 'none';
      }
    };
  }
}

/* ==========================================================================
   PORTAFOLIO DE IA & DESARROLLO - LÓGICA DE APLICACIÓN Y MANTENEDORES (APP.JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar IndexedDB y luego renderizar
  if (window.portfolioDB) {
    await window.portfolioDB.init();
  }

  initMobileMenuNav();
  await loadDynamicStatusPill();
  initNeonSign();
  await loadSkillsMatrix();
  await loadServicesCalculator();
  initIndustrySolutions();
  initDemoTabs();
  initChatbotDemo();
  initWorkflowDemo();
  initSignaturePadDemo();
  initContactAndDB();
  initModals();
  initMaintainerTabs();
  initMaintainerServicesCRUD();
  initMaintainerSkillsCRUD();
  initMaintainerBlockedCRUD();
  initCopyButtons();
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
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    drawer.style.display = 'none';
    document.body.style.overflow = '';
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
      const textSpan = statusCtaEl.querySelector('.status-title-text');
      if (textSpan) {
        textSpan.textContent = cfg.text || 'Disponible para proyectos';
      }
    }
  }

  if (pillEls && pillEls.length > 0) {
    pillEls.forEach(pillEl => {
      if (cfg.visible === false) {
        pillEl.style.display = 'none';
      } else {
        pillEl.style.display = 'inline-flex';
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

  const servicesData = await window.portfolioDB.getAll('services');
  optionsContainer.innerHTML = '';

  if (servicesData.length === 0) {
    optionsContainer.innerHTML = '<p style="color: var(--text-muted);">No hay servicios registrados en el mantenedor.</p>';
    priceDisplay.textContent = '$0 USD';
    timeDisplay.textContent = '0 días';
    return;
  }

  servicesData.forEach((service, index) => {
    const isSelected = index === 0; // Seleccionar el primero por defecto
    const card = document.createElement('div');
    card.className = `option-card ${isSelected ? 'selected' : ''}`;
    card.dataset.price = service.priceUSD;
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
    let totalPrice = 0;
    let totalDays = 0;

    const selectedCards = optionsContainer.querySelectorAll('.option-card.selected');
    selectedCards.forEach(c => {
      totalPrice += parseInt(c.dataset.price || '0', 10);
      totalDays += parseInt(c.dataset.time || '1', 10);
    });

    priceDisplay.textContent = `$${totalPrice} USD`;
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
  if (!contactForm) return;

  let lastSubmitTime = 0; // Anti-spam cooldown

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Anti-spam: bloquear envíos repetidos en menos de 30 segundos
    const now = Date.now();
    if (now - lastSubmitTime < 30000) {
      showToast('Por favor espera un momento antes de enviar otro mensaje.', true);
      return;
    }

    const budgetSelect = document.getElementById('contact-budget');
    const budgetText = (budgetSelect && budgetSelect.selectedIndex >= 0) ? budgetSelect.options[budgetSelect.selectedIndex].text : '';
    const websiteEl = document.getElementById('contact-website');

    const data = {
      name: document.getElementById('contact-name').value.trim(),
      email: document.getElementById('contact-email').value.trim(),
      subject: document.getElementById('contact-subject').value.trim(),
      website: websiteEl ? websiteEl.value.trim() : '',
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
    lastSubmitTime = now;
    showToast('¡Mensaje enviado con éxito!');
    contactForm.reset();
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

  // Abrir Modal de Ciberseguridad con nivel seleccionado
  window.openSecurityAuditModal = (tier = '450') => {
    if (!modalSec) return;
    const radio200 = document.getElementById('radio-tier-200');
    const radio450 = document.getElementById('radio-tier-450');

    if (tier === '200' && radio200) radio200.checked = true;
    else if (radio450) radio450.checked = true;

    modalSec.classList.add('active');
  };

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

      const data = {
        name: document.getElementById('sec-modal-name').value.trim(),
        email: document.getElementById('sec-modal-email').value.trim(),
        subject: isTier200 ? '🛡️ DIAGNÓSTICO DE CIBERSEGURIDAD (NIVEL 1 - $200 USD)' : '🛡️ AUDITORÍA + HARDENING TOTAL (NIVEL 2 - $450 USD)',
        website: document.getElementById('sec-modal-website').value.trim(),
        budgetText: isTier200 ? '$200 USD (Plazo 2 días)' : '$450 USD (Plazo 4 días)',
        message: document.getElementById('sec-modal-message').value.trim()
      };

      await sendTelegramNotification(data);
      if (window.portfolioDB) {
        await window.portfolioDB.add('messages', { ...data, timestamp: new Date().toISOString() });
      }
      showToast('¡Solicitud de Auditoría enviada con éxito! Revisa tu correo o Telegram.');
      formSec.reset();
      modalSec.classList.remove('active');
    };
  }

  // Submit Formulario Solicitud Rápida
  if (formReq) {
    formReq.onsubmit = async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('req-modal-name').value.trim(),
        email: document.getElementById('req-modal-email').value.trim(),
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


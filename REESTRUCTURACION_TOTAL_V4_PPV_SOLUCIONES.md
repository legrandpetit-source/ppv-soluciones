# REESTRUCTURACIÓN TOTAL V4.1: PPV SOLUCIONES INFORMÁTICAS (`ppvsoluciones.cl`)
## Documento Maestro de Arquitectura, Diagnóstico Forense, Propuesta de Valor & Plan de Ejecución

**Autor:** Patricio Padilla (CEO & Fundador — PPV Soluciones Informáticas)  
**Fecha:** 15 de Noviembre de 2026  
**Dominio Oficial:** `https://ppvsoluciones.cl`  
**Repositorio Local:** `/home/patricio/Documentos/portfolio-ia` (Alias: `/home/patricio/Documentos/ppv-soluciones`)  
**Despliegue Producción:** Servidor Hetzner VPS (`167.233.122.18`) -> `/var/www/ppvsoluciones` -> Docker `ppv-soluciones` (Nginx Alpine)  

---

## 1. DIAGNÓSTICO FORENSE: ¿POR QUÉ EL SITIO ANTERIOR TIENE 0 VISITAS Y 0 CONVERSIÓN?

Tras una auditoría minuciosa del código fuente previo (`index.html` de 1.934 líneas, `app_core.js` de 141 KB y `styles.css` de 51 KB), se identificaron las 5 fallas estructurales críticas que explican por qué el sitio actual no tracciona visitas ni genera clientes:

### Falla 1: Desconexión Total entre Mensaje y Cliente Objetivo (Síndrome de "Portafolio Hacker")
* **Lo que transmitía el sitio anterior:** Una terminal negra con código Python simulado (`ppv_automation_engine.py`), flujos de n8n, hashes SHA-256, Ley 21.459 de delitos informáticos y servicios de ciberseguridad vendidos en **dólares estadounidenses ($200 USD y $450 USD)**.
* **El impacto en el cliente:** Un dueño de pyme, una clínica dental, un productor agrícola o un gerente de transporte en San Antonio/Santiago que busca sistematizar su negocio, al entrar ve código crudo y precios en dólares para "hardening de servidores". Concluye erróneamente que PPV Soluciones es un servicio para programadores o empresas de ciberdefensa gringas, y abandona la página en menos de 5 segundos.

### Falla 2: Muro de Fricción Técnica y Cero Vía de Contacto Rápida
* En lugar de canalizar al prospecto hacia una conversación ejecutiva inmediata por WhatsApp, el sitio anterior saturaba al visitante con:
  - Un generador de vCard digital QR interactivo.
  - Múltiples modales emergentes y animaciones continuas de un canvas de "culebra autónoma" (`snake-bg`).
  - Formularios de cotización largos con selectores poco intuitivos.
* **Regla de oro de conversión en Chile:** El 85% de las ventas B2B y cotizaciones de servicios tecnológicos en Chile se cierran a través de **WhatsApp directo con el ingeniero responsable**. Si el usuario tiene que rellenar un formulario complejo, la tasa de rebote supera el 90%.

### Falla 3: Invisibilidad Absoluta en Google (0 Páginas Indexadas)
* El HTML anterior era un bloque monolítico masivo con lógica JavaScript embebida, enlaces vacíos (`href="#"`), dropdowns complejos y recursos externos bloqueantes (FontAwesome CDN, Google Fonts sin preconnect optimizado, librerías JS no minificadas).
* Googlebot descarta o posterga el renderizado de páginas pesadas con alto costo de CPU. Además, los metadatos y el schema JSON-LD estaban desactualizados y enfocados en "auditoría pasiva de vulnerabilidades", sin atacar las verdaderas palabras clave de intención comercial transaccional en Chile.

### Falla 4: Desperdicio de las Verdaderas "Joyas" de PPV (Ausencia de Prueba Social Real)
* PPV Soluciones posee activos tecnológicos de calibre industrial operando en el mundo real:
  - **Timbrapp:** Ecosistema SaaS con hardware físico NFC funcionando en comercios.
  - **Origen Canino:** ERP con trazabilidad de lotes FIFO, etiquetas regulatorias SAG/AAFCO calculadas con IA, mermas de producción, costeo de recetas y e-commerce con checkout blindado.
  - **Legrand Petit / Aura Design:** Plataformas de alta fidelidad estética y posicionamiento SEO.
* En el sitio anterior, **estas soluciones ni siquiera figuraban de forma protagónica**. El sitio mostraba ejemplos teóricos genéricos en vez de exhibir software real con tráfico, transacciones y clientes operando todos los días en servidores Linux propios.

### Falla 5: Violación del Principio de "Caja Negra"
* El sitio anterior explicaba el "cómo" técnico interno (normas, librerías, flujos de base de datos), lo que permite que competidores copien la receta y no genera urgencia comercial en el cliente.
* Lo que compra un tomador de decisiones es el **resultado financiero y operativo** (ahorrar 20 horas de trabajo manual a la semana, eliminar errores de stock, vender en automático), no el nombre de la librería o framework empleado.

---

## 2. PROPUESTAS DE VALOR POTENCIADAS & NUEVAS IDEAS DE ALTO IMPACTO

Para transformar `ppvsoluciones.cl` en una máquina de atracción y conversión de clientes B2B de alto ticket, se incorporan las siguientes propuestas estratégicas e ideas de innovación:

### Idea 1: El Concepto de "Ingeniería en Producción Real" (La Garantía de Combate)
* **El Diferenciador Radical:** El 95% de las agencias de software y freelancers venden servicios sobre plataformas que ellos mismos nunca han tenido que mantener bajo fuego real.
* **El Argumento de PPV:** *"No te vendemos código experimental ni plantillas de vitrina. En PPV Soluciones creamos y operamos nuestras propias empresas y plataformas comerciales en Chile (Timbrapp, Origen Canino, Legrand Petit). Sabemos lo que significa pagar servidores, lidiar con boletas electrónicas del SII, procesar transferencias bancarias y controlar stock por lotes porque lo vivimos a diario. Esa es tu mayor garantía técnica."*

### Idea 2: Enfoque Geográfico Estratégico (El Corredor Logístico San Antonio – Valparaíso – RM)
* PPV Soluciones tiene presencia y arraigo operativo directo en el Litoral Central (Algarrobo, El Quisco, San Antonio) y la Región Metropolitana.
* San Antonio es el principal puerto marítimo de Chile; Valparaíso concentra el polo portuario e industrial; Santiago es el núcleo de distribución.
* Existe una demanda desatendida gigantesca en empresas de transporte, patios de contenedores, frigoríficos, bodegas y distribuidores locales que **aún operan con carpetas físicas, planillas Excel desincronizadas y llamadas telefónicas interminables**. Posicionar una línea específica de soluciones para este corredor genera contratos de alto valor recurrente.

### Idea 3: El "Lanzador Interactivo de Proyectos" a WhatsApp (Cero Fricción)
* En vez de un formulario aburrido, un configurador interactivo de 2 pasos en la propia landing:
  - **Paso 1 (Área a potenciar):** Web/E-commerce, App a Medida, Inventario/Lotes/SII, Logística/Patio.
  - **Paso 2 (Prioridad):** Aumentar ventas, Eliminar planillas y errores, Crear software desde cero.
* Al hacer clic en *"Iniciar Conversación Técnica por WhatsApp"*, JavaScript concatena un mensaje formal y pulcro que abre la app de WhatsApp del cliente con el texto listo:
  > *"Hola Patricio, estuve revisando ppvsoluciones.cl. Mi empresa necesita [Área seleccionada] enfocado en [Prioridad seleccionada]. Me gustaría agendar una sesión privada para revisar mi caso."*

### Idea 4: Demostraciones Exclusivas bajo Sesión Privada (Misticismo Comercial)
* Siguiendo la estrategia de "Caja Negra", se establece explícitamente en el sitio:
  > *"Por motivos de confidencialidad y protección de la ventaja competitiva de nuestros clientes, los paneles de control avanzados, arquitecturas internas y dashboards operativos se exhiben exclusivamente mediante demostración en vivo (remota o presencial) en sesión técnica privada."*
* Esto despierta curiosidad ejecutiva, posiciona a PPV Soluciones como una firma de alto nivel y filtra a curiosos sin presupuesto.

---

## 3. ARQUITECTURA TÉCNICA Y SISTEMA DE DISEÑO V4.1 (OBSIDIAN HIGH-TECH)

### 3.1. Stack Tecnológico de Rendimiento Extremo
* **Frontend:** HTML5 Semántico nativo + Tailwind CSS (vía CDN optimizado o clases utilitarias puras) + Vanilla JavaScript modular (sin frameworks pesados tipo React o Flutter Web en la landing pública).
* **Meta de Rendimiento:** 100/100 en Google PageSpeed Desktop y >95 en Mobile. Carga total en menos de 0.8 segundos.
* **Canvas Hero (60 FPS):** Red de nodos interactivos interconectados mediante líneas gaussianas tenues que responden sutilmente a la posición del cursor (simbolizando nodos de datos, logística y sincronización empresarial).
* **Tarjetas Glassmorphism con Spotlight Hover:** Detección de coordenadas `mousemove` en tarjetas Bento Grid para iluminar bordes dinámicos con gradientes radiales (efecto Linear / Stripe).

### 3.2. Paleta de Colores Corporativa
* **Fondo Principal:** `#07090E` (Obsidian Deep — Modo oscuro ejecutivo).
* **Fondo Secciones Secundarias:** `#0F172A` (Slate Dark profundo).
* **Superficies Glassmorphism:** `rgba(15, 23, 42, 0.65)` con `backdrop-filter: blur(16px)` y borde `1px solid rgba(255, 255, 255, 0.08)`.
* **Acento Primario:** Azul Cobalto Eléctrico (`#3B82F6` a `#2563EB`).
* **Acento Secundario (Éxito & Operación):** Esmeralda Cian (`#10B981`).
* **Acento de Alerta / Estado Activo:** Cyan Neón (`#06B6D4`).

### 3.3. Tipografía
* **Titulares (H1, H2, H3):** `'Plus Jakarta Sans'` o `'Space Grotesk'` (700/800, tracking -0.02em).
* **Cuerpo de Texto:** `'Inter'` (400/500).
* **Badges & Datos Técnicos:** `'JetBrains Mono'`.

### 3.4. MOTOR VISUAL Y EFECTOS CAUTIVADORES (EXPERIENCIA "ANTIGRAVITY / SILICON VALLEY")
Para que el sitio no sea estático, plano ni aburrido, y transmita al instante la sensación de ingeniería de software de élite mundial, se integran 5 mecanismos visuales hipnóticos y ultra fluidos:

1. **Interactive Node & Gravity Network (Hero Canvas a 60 FPS):**
   - Un elemento `<canvas>` que cubre el fondo del Hero.
   - Nodos (partículas luminosas en cobalto y esmeralda) interconectados mediante líneas tenues de datos que calculan distancias euclidianas dinámicas.
   - **Física de atracción/repulsión elástica:** Al mover el mouse, los nodos cercanos se curvan suavemente hacia el cursor o se repelen como un campo de fuerza gravitatorio (idéntico a la experiencia inmersiva de sitios como *Antigravity, Stripe Press o GitHub Next*).
   - **Modo Móvil Autónomo:** En pantallas táctiles sin puntero, las partículas no se quedan quietas: ejecutan un patrón cinético de deriva orgánica continua con pulsos de luz que viajan a lo largo de las conexiones como paquetes de datos en una red de fibra óptica.

2. **Spotlight Radial Glow en Bento Cards (Efecto Linear):**
   - Las tarjetas del Bento Grid tienen un fondo de cristal oscuro mate (`rgba(15, 23, 42, 0.65)`).
   - Mediante un listener ultraliviano de `mousemove`, cada tarjeta calcula las coordenadas relativas `(e.clientX, e.clientY)`.
   - Se proyecta un gradiente radial invisible que solo se ilumina en la posición exacta del cursor:
     `radial-gradient(400px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.18), transparent 80%)`.
   - El borde exterior de 1px reacciona con una máscara de gradiente idéntica, dando la ilusión óptica de que el cursor sostiene una linterna azulada detrás del cristal.

3. **Los 4 Micro-Visualizadores Vivos (Interactive Live Widgets en Tarjetas):**
   - En lugar de tarjetas con texto plano estático, cada bloque Bento incorpora un widget vivo en CSS/SVG acelerado por hardware:
     * **Widget 1 (Desarrollo Multiplataforma):** Mini-interfaz abstracta con switch táctil *"Desktop ⇄ Móvil"* y un indicador de latencia en vivo que oscila suavemente: `🟢 Sincronización en Nube: 12ms`.
     * **Widget 2 (Web & E-Commerce):** Indicador velocímetro circular animado que se llena al 100% al entrar en pantalla con el sello `Google PageSpeed 100/100` y una curva SVG de conversión ascendente con gradiente verde esmeralda.
     * **Widget 3 (ERP, Lotes & Fidelización NFC):** Simulador de onda de radiofrecuencia (tres anillos concéntricos en pulso) simulando el toque de un chip físico en 0.4s, junto con una barra de stock FIFO que descuenta un insumo en vivo.
     * **Widget 4 (Logística & Patio Eje San Antonio – RM):** Línea de tiempo luminosa continua con 3 hitos en vivo: `[Patio / Origen] ──▶ [Ruta 78 / 68 Activa] ──▶ [Liquidación Digital Inmediata]`.

4. **Tipografía con Resplandor y Badges de Telemetría:**
   - El titular H1 lleva un gradiente fluido de texto que refleja la luz ambiental (`linear-gradient(135deg, #FFFFFF 40%, #93C5FD 70%, #6EE7B7 100%)`).
   - Todos los badges de estado llevan un punto verde esmeralda con animación `animate-ping` intermitente (`<span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>`), comunicando que las plataformas están activas y monitoreadas en tiempo real 24/7.

5. **Cero Penalización de Carga (100/100 PageSpeed Garantizado):**
   - **Regla Estricta:** Cero librerías externas de animación 3D pesadas (prohibido Three.js o dependencias de 600 KB).
   - Todo se construye con la API nativa de **HTML5 Canvas 2D**, `requestAnimationFrame` con limitador de refresco a pantalla, y CSS moderno (`transform`, `opacity`, `backdrop-filter`) que la GPU del celular y computador procesa a 60 FPS sin gastar batería ni retrasar la carga del DOM.

---

## 4. ESTRUCTURA COMPLETA DEL SITIO WEB (LAS 5 SECCIONES)

### NAVBAR (Fijo con Blur y Navegación Rápida)
* **Logo:** PPV Soluciones (con punto luminoso esmeralda/azul interactivo).
* **Enlaces:** Soluciones | Rubros | Casos en Producción | Diagnóstico.
* **CTA Principal:** Botón *"Hablar con Ingeniería ->"* (Directo a WhatsApp).

### SECCIÓN 1: HERO PRINCIPAL (Impacto en 3 Segundos)
* **Badge Superior (con animación `animate-ping` verde):**
  `DESARROLLO DE SOFTWARE, APPS Y PLATAFORMAS COMERCIALES | V REGIÓN & SANTIAGO`
* **H1 Principal:**
  *"Creamos el Software, la Aplicación o la Web que tu negocio necesita para crecer y automatizarse."*
* **Subtítulo:**
  *"Desde páginas web comerciales que captan clientes todos los días, hasta aplicaciones a medida, sistemas de inventario y plataformas operativas complejas. Transformamos tus procesos manuales en tecnología propia, rápida y rentable."*
* **Botones de Acción:**
  - Primario: *"Cotizar mi Proyecto por WhatsApp ->"*
  - Secundario: *"Explorar Soluciones"* (Scroll suave a la Sección 2).
* **Barra de Autoridad (4 Columnas de Rendimiento):**
  1. **100% A Medida:** Adaptado a las reglas de tu negocio, sin ataduras a licencias mensuales.
  2. **Menos de 1 Segundo:** Velocidad extrema de respuesta y carga web optimizada.
  3. **Integración Total:** Ventas, Inventario, Facturación y Boletas SII automáticas.
  4. **Presencia Directa:** Litoral Central, Valparaíso, San Antonio y Región Metropolitana.

### SECCIÓN 2: BENTO GRID DE SOLUCIONES (Las 4 Líneas de Acción)
1. **Bloque 1: Aplicaciones Web y Móviles a Medida (Cualquier Idea o Proceso)**
   - Badge: `DESARROLLO MULTIPLATAFORMA`
   - Micro-Visualizador: Mockup abstracto de sincronización móvil-desktop en tiempo real.
2. **Bloque 2: Páginas Web de Alta Conversión & E-Commerce Automatizado**
   - Badge: `VENTAS & POSICIONAMIENTO GOOGLE`
   - Micro-Visualizador: Pulso de conversión + Score Google PageSpeed 100/100.
3. **Bloque 3: Sistemas de Gestión (ERP), Inventario Crítico y Fidelización Física**
   - Badge: `CONTROL OPERATIVO & RETENCIÓN`
   - Micro-Visualizador: Onda NFC sin contacto (0.4s) y barra de precisión de stock al 99.9%.
4. **Bloque 4: Operaciones en Terreno, Flotas y Logística (Eje V Región – RM)**
   - Badge: `TRAZABILIDAD EN TIEMPO REAL`
   - Micro-Visualizador: Línea de tiempo luminosa Patio/Origen -> Ruta Activa -> Liquidación Sincronizada.

### SECCIÓN 3: SELECTOR INTERACTIVO POR RUBROS ("¿Cuál es tu sector?")
Pestañas interactivas (Tabs en JavaScript) con renderizado dinámico de dolores y soluciones:
* **Tab 1: Comercio, Gastronomía y Retail (Activo por defecto):**
  - Fidelización física con tótems NFC sin apps ni códigos QR.
  - E-commerce con stock real sincronizado y boletas SII automáticas.
  - Alertas predictivas de recompra de clientes habituales.
* **Tab 2: Servicios, Clínicas y Profesionales:**
  - Sitios web de alta estética para capturar búsquedas en Google.
  - Embudos de agendamiento y cotización directa a WhatsApp.
  - Portales privados para clientes y gestión documental en la nube.
* **Tab 3: Productores, Distribuidoras y Bodegas:**
  - Control de producción por lotes, fechas de vencimiento y recetas.
  - Alertas preventivas de quiebre de stock y protección de margen.
  - Sincronización directa con facturación y guías electrónicas.
* **Tab 4: Transporte, Patio y Logística Portuaria (San Antonio – Valparaíso – RM):**
  - Control de portería y patio sin papeles (acreditación y fotos de carga).
  - Eliminación de llamadas telefónicas de clientes con links de seguimiento en vivo.
  - Liquidación digital acelerada de rutas en segundos.

### SECCIÓN 4: ECOSISTEMA EN PRODUCCIÓN (Casos Reales de Ingeniería PPV)
Tarjetas de lujo con enlace directo y validación de producción:
1. **Timbrapp (`https://timbrapp.cl`):** Plataforma SaaS & Hardware NFC de fidelización física.
2. **Origen Canino (`https://origencanino.cl`):** ERP industrial con cálculo de lotes FIFO, etiquetado SAG/AAFCO por IA y e-commerce.
3. **Legrand Petit & Aura Design (`https://legrandpetit.cl` / `https://auradesign.cl`):** Arquitectura web de ultra velocidad y autoridad SEO en Chile.

### SECCIÓN 5: LANZADOR INTERACTIVO DE PROYECTOS (Captación WhatsApp)
* Selector visual de requerimientos en dos pasos (Área + Prioridad) + Input de Nombre o Empresa.
* Botón de enlace dinámico a WhatsApp (`+56947609070`) con texto precargado y profesional.
* Aviso de confidencialidad y sesiones privadas para demostración de software.

### FOOTER CORPORATIVO & SELLO TÉCNICO
* Razón social, cobertura en V Región y RM.
* Sello de ciberseguridad: servidores Linux endurecidos, TLS 1.3 y alta disponibilidad.
* Enlaces limpios a todas las plataformas del ecosistema PPV.

---

## 5. MATRIZ DE ASIGNACIÓN DE MODELOS (OPTIMIZACIÓN DE TOKENS)

| Fase / Tarea Específica | Modelo Asignado | Justificación Estratégica | Modelos Prohibidos |
| :--- | :--- | :--- | :--- |
| **FASE 1: Construcción Base UI/UX + Motor JS (`index.html`)**<br>Maquetación completa de las 5 secciones, Tailwind CSS, animación `<canvas>` 60 FPS, Spotlight Hover y lógica de Tabs/WhatsApp. | **4 HydroGen** | Máxima capacidad de contexto y flujo continuo para generar código completo de producción sin truncar CSS ni omitir bloques. | ❌ NO usar *Opus*, *Sonnet* ni *Gemini 4 Argon* (costo innecesario al estar el diseño 100% definido). |
| **FASE 2: Archivos Técnicos, SEO y Seguridad**<br>Generación de `robots.txt`, `sitemap.xml`, `nginx-security.conf` y Schema JSON-LD `ProfessionalService`. | **Gemini 3.8 Flash** | Archivos estructurados, deterministas y cortos. Se generan en segundos con consumo marginal de tokens. | ❌ NO gastar *HydroGen*, *Argon* ni *Sonnet* en archivos planos. |
| **FASE 3: Iteración Fina, Copywriting y Ajustes**<br>Afinación de teléfonos, números de contacto, márgenes responsive y pulido de enlaces. | **Gemini 3.8 Flash** | Ideal para ediciones quirúrgicas directas sobre el archivo generado. | ❌ NO usar *Orchestrator* (multiplica llamadas innecesarias). |
| **FASE 4: Debug Complejo (Solo Emergencias)**<br>Solo si una animación de Canvas o cálculo trigonométrico falla y Flash no lo resuelve a la primera. | **Sonnet (Sonis)** | Uso quirúrgico exclusivo para resolver algoritmos JS matemáticos complejos si fuera estrictamente indispensable. | ❌ NO usar para reescribir archivos completos. |

---

## 6. ESPECIFICACIÓN TÉCNICA DE ENTREGABLES (FASE 2)

### 6.1. Schema.org JSON-LD (`ProfessionalService`)
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "PPV Soluciones Informáticas",
  "url": "https://ppvsoluciones.cl",
  "logo": "https://ppvsoluciones.cl/assets/ppv_logo.jpg",
  "image": "https://ppvsoluciones.cl/assets/og-preview.png",
  "description": "Desarrollo de software a medida, aplicaciones web y móviles, páginas web de alta conversión, sistemas de inventario ERP con integración SII y soluciones logísticas en Chile.",
  "founder": {
    "@type": "Person",
    "name": "Patricio Padilla",
    "jobTitle": "Director de Ingeniería de Software"
  },
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "Valparaíso & Metropolitana",
    "addressCountry": "CL"
  },
  "areaServed": [
    "Santiago",
    "Valparaíso",
    "Viña del Mar",
    "San Antonio",
    "Algarrobo",
    "El Quisco",
    "Chile"
  ],
  "knowsAbout": [
    "Desarrollo de Software a Medida",
    "Diseño de Páginas Web Comerciales y E-commerce",
    "Sistemas de Inventario y Control de Lotes ERP",
    "Integración Facturación y Boleta Electrónica SII",
    "Software de Logística, Transporte y Control de Patio",
    "Sistemas de Fidelización con Tecnología NFC"
  ],
  "priceRange": "$$"
}
```

### 6.2. `robots.txt`
```txt
User-agent: *
Allow: /

Sitemap: https://ppvsoluciones.cl/sitemap.xml
```

### 6.3. `sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ppvsoluciones.cl/</loc>
    <lastmod>2026-11-16</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### 6.4. `nginx-security.conf`
```nginx
# Configuración de Seguridad y Rendimiento Nginx para PPV Soluciones
# Dominio: ppvsoluciones.cl

# Redirección permanente HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ppvsoluciones.cl www.ppvsoluciones.cl;
    return 301 https://ppvsoluciones.cl$request_uri;
}

# Redirección WWW a non-WWW en HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.ppvsoluciones.cl;
    
    # Certificados SSL gestionados por Traefik / Certbot
    return 301 https://ppvsoluciones.cl$request_uri;
}

# Servidor Principal
server {
    listen 80; # Puerto interno detrás del reverse proxy
    server_name ppvsoluciones.cl;
    root /usr/share/nginx/html;
    index index.html;

    # Ocultar versión de Nginx
    server_tokens off;

    # Cabeceras de Seguridad Avanzada (OWASP / Hardening)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data:; font-src 'self' https: data: fonts.gstatic.com;" always;

    # Compresión Gzip de Alto Rendimiento
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Manejo de Rutas y Fallback
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    # Caché Agresivo para Assets Estáticos
    location ~* \.(ico|css|js|gif|jpe?g|png|webp|woff2?|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        access_log off;
    }

    # Denegar acceso a archivos ocultos (.git, .env)
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

---

## 7. PROTOCOLO DE DESPLIEGUE EN SERVIDOR DE PRODUCCIÓN (HETZNER VPS)

El despliegue del nuevo sitio web se ejecuta siguiendo el flujo automatizado:
1. **Compromiso en Git:** Commit y push en la rama `main` del repositorio `https://github.com/legrandpetit-source/ppv-soluciones.git` desde `/home/patricio/Documentos/portfolio-ia`.
2. **Actualización en el VPS:**
   ```bash
   ssh root@167.233.122.18 "cd /var/www/ppvsoluciones && git pull origin main"
   ```
3. **Reinicio Seguro del Contenedor Nginx:**
   ```bash
   ssh root@167.233.122.18 "docker restart ppv-soluciones"
   ```
4. **Validación Inmediata con cURL:**
   - Verificación de HTTP 200 en `https://ppvsoluciones.cl/`.
   - Verificación de Schema.org y metadatos con `curl -s https://ppvsoluciones.cl/ | grep -i "ProfessionalService"`.
   - Verificación de `robots.txt` y `sitemap.xml`.


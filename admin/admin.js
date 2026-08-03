/* ==========================================================================
   CONSOLA DE ADMINISTRACIÓN /ADMIN - LÓGICA DE MANTENEDORES
   ========================================================================== */

const DEFAULT_ADMIN_HASHES = {
  emailHash: 'dbcba288f24a1d8b77274a31adba1b6ae7c5744e7b9e99776e556a816a5e4bb1',
  passHash: '2bea8efab55e996f89e4804280208da9711e6a2a693a30bc77355abed3c2ccdc'
};

function getAdminHashes() {
  const custom = localStorage.getItem('ppv_admin_custom_hashes');
  if (custom) {
    try { return JSON.parse(custom); } catch(e){}
  }
  return DEFAULT_ADMIN_HASHES;
}

function getAdminEmail() {
  return localStorage.getItem('ppv_admin_custom_email') || 'admin@ppvsoluciones.cl';
}

async function hashString(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  if (window.portfolioDB) {
    await window.portfolioDB.init();
  }

  initAuth();
  initSidebar();
  initStatusPillCRUD();
  initServicesCRUD();
  initSkillsCRUD();
  initBlockedCRUD();
  initAdminMeetingsMaintainer();
  initUserMaintainer();
  initPdfGeneratorMaintainer();
  initSecAuditWorkflowMaintainer();
  initClientsCRUD();
});

/* --------------------------------------------------------------------------
   1. AUTENTICACIÓN & CONTROL DE SESIÓN
   -------------------------------------------------------------------------- */
function initAuth() {
  const loginOverlay = document.getElementById('admin-login-screen');
  const loginForm = document.getElementById('form-admin-portal-login');
  const loginError = document.getElementById('admin-login-error');
  const btnLogout = document.getElementById('btn-portal-logout');
  const userDisplay = document.getElementById('admin-user-display');
  const btnTogglePass = document.getElementById('btn-toggle-portal-pass');
  const passInput = document.getElementById('portal-password');

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

  function isAuthorized() {
    return sessionStorage.getItem('ppv_admin_logged') === 'true';
  }

  function checkSession() {
    if (isAuthorized()) {
      loginOverlay.style.display = 'none';
      if (userDisplay) {
        userDisplay.textContent = sessionStorage.getItem('ppv_admin_email') || getAdminEmail();
      }
      refreshAllData();
    } else {
      loginOverlay.style.display = 'flex';
    }
  }

  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('portal-email').value.trim();
      const pass = document.getElementById('portal-password').value.trim();
      const currentHashes = getAdminHashes();

      Promise.all([hashString(email), hashString(pass)]).then(([eHash, pHash]) => {
        if (eHash === currentHashes.emailHash && pHash === currentHashes.passHash) {
          sessionStorage.setItem('ppv_admin_logged', 'true');
          sessionStorage.setItem('ppv_admin_email', email);
          if (loginError) loginError.style.display = 'none';
          showToast('¡Bienvenido al Panel de Administración!');
          checkSession();
        } else {
          if (loginError) loginError.style.display = 'flex';
        }
      });
    };
  }

  if (btnLogout) {
    btnLogout.onclick = () => {
      sessionStorage.removeItem('ppv_admin_logged');
      sessionStorage.removeItem('ppv_admin_email');
      showToast('Sesión de administración cerrada.');
      checkSession();
    };
  }

  checkSession();
}

/* --------------------------------------------------------------------------
   2. REFRESCAR DATOS Y CONTADORES
   -------------------------------------------------------------------------- */
async function refreshAllData() {
  if (window.portfolioDB) {
    try { await window.portfolioDB.init(); } catch(e) {}
  }
  try { await loadMessagesTable(); } catch(e) { console.error('Error cargando mensajes:', e); }
  try { await loadServicesTable(); } catch(e) { console.error('Error cargando servicios:', e); }
  try { await loadSkillsTable(); } catch(e) { console.error('Error cargando habilidades:', e); }
  try { await loadBlockedTable(); } catch(e) { console.error('Error cargando bloqueados:', e); }
  try { await updateCounters(); } catch(e) { console.error('Error actualizando contadores:', e); }
}

async function updateCounters() {
  if (!window.portfolioDB) return;
  const messages = await window.portfolioDB.getAllMessages();
  const services = await window.portfolioDB.getAll('services');
  const skills = await window.portfolioDB.getAll('skills');
  const blocked = await window.portfolioDB.getAll('blocked');

  document.getElementById('stat-count-messages').textContent = messages.length;
  document.getElementById('stat-count-services').textContent = services.length;
  document.getElementById('stat-count-skills').textContent = skills.length;
  document.getElementById('stat-count-blocked').textContent = blocked.length;
}

/* --------------------------------------------------------------------------
   3. NAVEGACIÓN SIDEBAR (CAMBIO DE VISTAS)
   -------------------------------------------------------------------------- */
function initSidebar() {
  const sidebarBtns = document.querySelectorAll('.sidebar-btn');

  sidebarBtns.forEach(btn => {
    btn.onclick = (e) => {
      if (e) e.preventDefault();
      sidebarBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-panel-view').forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const viewId = btn.getAttribute('data-view') || (btn.dataset ? btn.dataset.view : null);
      if (viewId) {
        const targetView = document.getElementById(viewId);
        if (targetView) {
          targetView.classList.add('active');
          refreshAllData();
        }
      }
    };
  });
}

/* --------------------------------------------------------------------------
   4. MANTENEDOR DE MENSAJES DE CONTACTO
   -------------------------------------------------------------------------- */
async function loadMessagesTable() {
  const tbody = document.getElementById('portal-messages-tbody');
  const btnExport = document.getElementById('btn-portal-export-json');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">Cargando mensajes...</td></tr>';
  
  let messages = [];
  try {
    const res = await fetch('/tg-messages');
    const data = await res.json();
    if (data.ok && Array.isArray(data.messages)) {
      messages = data.messages.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        website: m.website,
        budget: m.budget,
        message: m.message,
        phone: m.phone || '',
        contact_pref: m.contact_pref || '',
        status: m.status || 'Nuevo',
        timestampFormatted: m.created_at || 'Reciente'
      }));
    }
  } catch(err) {
    console.warn('Backend API /tg-messages no accesible, usando fallback local:', err);
  }

  if (!messages.length && window.portfolioDB) {
    messages = await window.portfolioDB.getAllMessages();
  }

  const statCounter = document.getElementById('stat-count-messages');
  if (statCounter) statCounter.textContent = messages.length;

  if (!messages.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">No hay mensajes registrados aún.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  messages.forEach(msg => {
    const tr = document.createElement('tr');
    const badgeClass = msg.status === 'Nuevo' ? 'badge-new' : (msg.status === 'Leído' ? 'badge-read' : 'badge-replied');
    const websiteInfo = msg.website ? `<br><small style="color: var(--neon-pink);"><i class="fa-solid fa-globe"></i> ${escapeHtml(msg.website)}</small>` : '';
    const phoneInfo = msg.phone ? `<br><small style="color: var(--neon-cyan);"><i class="fa-solid fa-phone"></i> ${escapeHtml(msg.phone)} (${escapeHtml(msg.contact_pref || 'WhatsApp')})</small>` : '';

    tr.innerHTML = `
      <td style="font-family: var(--font-code); color: var(--neon-cyan);">#${msg.id}</td>
      <td style="color: var(--text-muted); font-size: 0.8rem;">${msg.timestampFormatted}</td>
      <td><strong>${escapeHtml(msg.name)}</strong>${websiteInfo}</td>
      <td style="color: var(--neon-violet);">${escapeHtml(msg.email)}${phoneInfo}</td>
      <td style="color: var(--neon-emerald); font-weight: 600;">${escapeHtml(msg.budget || msg.subject)}</td>
      <td><span class="badge-status ${badgeClass}">${msg.status}</span></td>
      <td>
        <button class="btn btn-outline btn-msg-read" data-id="${msg.id}" style="padding: 2px 6px; font-size: 0.75rem;">
          <i class="fa-solid fa-check"></i>
        </button>
        <button class="btn btn-outline btn-msg-del" data-id="${msg.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-msg-read').forEach(btn => {
    btn.onclick = async () => {
      await window.portfolioDB.updateMessageStatus(parseInt(btn.dataset.id, 10), 'Respondido');
      await refreshAllData();
    };
  });

  tbody.querySelectorAll('.btn-msg-del').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Eliminar este mensaje de la base de datos?')) {
        await window.portfolioDB.deleteMessage(parseInt(btn.dataset.id, 10));
        await refreshAllData();
      }
    };
  });

  if (btnExport) {
    btnExport.onclick = async () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ppv_mensajes_db_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };
  }
}

/* --------------------------------------------------------------------------
   5. MANTENEDOR DE SERVICIOS & PRECIOS (CALCULADORA)
   -------------------------------------------------------------------------- */
function initServicesCRUD() {
  const form = document.getElementById('form-portal-service');
  const btnCancel = document.getElementById('btn-p-cancel-service');

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const idInput = document.getElementById('p-service-id').value;

    const serviceData = {
      title: document.getElementById('p-service-title').value.trim(),
      priceUSD: parseInt(document.getElementById('p-service-price').value, 10) || 0,
      timeDays: document.getElementById('p-service-time').value.trim(),
      desc: document.getElementById('p-service-desc').value.trim(),
      icon: 'fa-check'
    };

    if (idInput) {
      serviceData.id = parseInt(idInput, 10);
    }

    await window.portfolioDB.saveService(serviceData);
    showToast(idInput ? 'Servicio actualizado correctamente.' : 'Nuevo servicio agregado.');
    resetServiceForm();
    await refreshAllData();
  };

  if (btnCancel) btnCancel.onclick = () => resetServiceForm();

  function resetServiceForm() {
    form.reset();
    document.getElementById('p-service-id').value = '';
    document.getElementById('p-service-form-title').innerHTML = '<i class="fa-solid fa-plus"></i> Agregar / Editar Servicio';
  }
}

async function loadServicesTable() {
  const tbody = document.getElementById('portal-services-tbody');
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
        <button class="btn btn-outline btn-edit-srv" data-id="${s.id}" style="padding: 2px 6px; font-size: 0.75rem;">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-outline btn-del-srv" data-id="${s.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-edit-srv').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id, 10);
      const all = await window.portfolioDB.getAll('services');
      const target = all.find(x => x.id === id);
      if (target) {
        document.getElementById('p-service-id').value = target.id;
        document.getElementById('p-service-title').value = target.title;
        document.getElementById('p-service-price').value = target.priceUSD;
        document.getElementById('p-service-time').value = target.timeDays;
        document.getElementById('p-service-desc').value = target.desc;
        document.getElementById('p-service-form-title').innerHTML = `<i class="fa-solid fa-pen"></i> Editando Servicio #${target.id}`;
      }
    };
  });

  tbody.querySelectorAll('.btn-del-srv').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Eliminar este servicio de la calculadora pública?')) {
        await window.portfolioDB.deleteService(parseInt(btn.dataset.id, 10));
        await refreshAllData();
        showToast('Servicio eliminado.');
      }
    };
  });
}

/* --------------------------------------------------------------------------
   6. MANTENEDOR DE HABILIDADES TÉCNICAS
   -------------------------------------------------------------------------- */
function initSkillsCRUD() {
  const form = document.getElementById('form-portal-skill');
  const btnCancel = document.getElementById('btn-p-cancel-skill');

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const idInput = document.getElementById('p-skill-id').value;

    const skillData = {
      name: document.getElementById('p-skill-name').value.trim(),
      category: document.getElementById('p-skill-category').value,
      level: document.getElementById('p-skill-level').value.trim(),
      levelText: document.getElementById('p-skill-text').value.trim(),
      desc: document.getElementById('p-skill-desc').value.trim()
    };

    if (idInput) {
      skillData.id = parseInt(idInput, 10);
    }

    await window.portfolioDB.saveSkill(skillData);
    showToast(idInput ? 'Habilidad actualizada correctamente.' : 'Nueva habilidad agregada.');
    resetSkillForm();
    await refreshAllData();
  };

  if (btnCancel) btnCancel.onclick = () => resetSkillForm();

  function resetSkillForm() {
    form.reset();
    document.getElementById('p-skill-id').value = '';
    document.getElementById('p-skill-form-title').innerHTML = '<i class="fa-solid fa-plus"></i> Agregar / Editar Habilidad Técnica';
  }
}

async function loadSkillsTable() {
  const tbody = document.getElementById('portal-skills-tbody');
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
        <button class="btn btn-outline btn-edit-sk" data-id="${sk.id}" style="padding: 2px 6px; font-size: 0.75rem;">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-outline btn-del-sk" data-id="${sk.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-edit-sk').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id, 10);
      const all = await window.portfolioDB.getAll('skills');
      const target = all.find(x => x.id === id);
      if (target) {
        document.getElementById('p-skill-id').value = target.id;
        document.getElementById('p-skill-name').value = target.name;
        document.getElementById('p-skill-category').value = target.category;
        document.getElementById('p-skill-level').value = target.level;
        document.getElementById('p-skill-text').value = target.levelText || target.level;
        document.getElementById('p-skill-desc').value = target.desc;
        document.getElementById('p-skill-form-title').innerHTML = `<i class="fa-solid fa-pen"></i> Editando Habilidad #${target.id}`;
      }
    };
  });

  tbody.querySelectorAll('.btn-del-sk').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Eliminar esta habilidad de la matriz pública?')) {
        await window.portfolioDB.deleteSkill(parseInt(btn.dataset.id, 10));
        await refreshAllData();
        showToast('Habilidad eliminada.');
      }
    };
  });
}

/* --------------------------------------------------------------------------
   7. MANTENEDOR DE PALABRAS / RUBROS BLOQUEADOS
   -------------------------------------------------------------------------- */
function initBlockedCRUD() {
  const form = document.getElementById('form-portal-blocked');
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const wordInput = document.getElementById('p-blocked-word').value.trim();
    if (!wordInput) return;

    try {
      await window.portfolioDB.addBlockedWord(wordInput);
      showToast(`Término "${wordInput}" agregado a la lista negra.`);
      form.reset();
      await refreshAllData();
    } catch (err) {
      showToast('Ese término ya existe en la lista negra.', true);
    }
  };
}

async function loadBlockedTable() {
  const tbody = document.getElementById('portal-blocked-tbody');
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
        <button class="btn btn-outline btn-del-blk" data-id="${r.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
          <i class="fa-solid fa-trash"></i> Quitar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-del-blk').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('¿Quitar esta palabra de la lista negra?')) {
        await window.portfolioDB.deleteBlockedWord(parseInt(btn.dataset.id, 10));
        await refreshAllData();
        showToast('Término eliminado de la lista negra.');
      }
    };
  });
}

/* --------------------------------------------------------------------------
   7.5 MANTENEDOR DE ESTADO & DISPONIBILIDAD (STATUS PILL)
   -------------------------------------------------------------------------- */
async function initStatusPillCRUD() {
  const form = document.getElementById('form-status-pill-config');
  const textInput = document.getElementById('cfg-status-text');
  const themeSelect = document.getElementById('cfg-status-theme');
  const visibleSelect = document.getElementById('cfg-status-visible');
  const previewPill = document.getElementById('preview-status-pill');
  const previewText = document.getElementById('preview-status-text');
  const presetBtns = document.querySelectorAll('.status-preset-btn');

  if (!form || !window.portfolioDB) return;

  // Cargar configuración existente
  const currentCfg = await window.portfolioDB.getConfig('status_pill') || {
    text: 'Disponible para Proyectos',
    theme: 'emerald',
    visible: true
  };

  textInput.value = currentCfg.text;
  themeSelect.value = currentCfg.theme;
  visibleSelect.value = String(currentCfg.visible);

  updatePreview();

  // Escuchar cambios en vivo para la vista previa
  textInput.oninput = () => updatePreview();
  themeSelect.onchange = () => updatePreview();
  visibleSelect.onchange = () => updatePreview();

  // Presets rápidos
  presetBtns.forEach(btn => {
    btn.onclick = () => {
      textInput.value = btn.dataset.text;
      themeSelect.value = btn.dataset.theme;
      updatePreview();
    };
  });

  function updatePreview() {
    const text = textInput.value.trim() || 'Disponible para Proyectos';
    const theme = themeSelect.value;
    const isVisible = visibleSelect.value === 'true';

    previewText.textContent = text;
    previewPill.className = `status-pill ${theme !== 'emerald' ? 'theme-' + theme : ''}`;
    previewPill.style.display = isVisible ? 'inline-flex' : 'none';
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const newCfg = {
      text: textInput.value.trim() || 'Disponible para Proyectos',
      theme: themeSelect.value,
      visible: visibleSelect.value === 'true'
    };

    await window.portfolioDB.saveConfig('status_pill', newCfg);
    showToast('¡Estado y Disponibilidad actualizados en la web pública!');
  };
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

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* --------------------------------------------------------------------------
   8. MANTENEDOR DE SALAS VIRTUALES & LINKS DIRECTOS DE INVITACIÓN
   -------------------------------------------------------------------------- */
function initAdminMeetingsMaintainer() {
  const btnGenKey = document.getElementById('btn-adm-gen-key');
  const roomKeyInput = document.getElementById('adm-room-key');
  const formGenerate = document.getElementById('form-admin-generate-meeting');
  const roomNameInput = document.getElementById('adm-room-name');
  const linkBox = document.getElementById('adm-generated-link-box');
  const inviteUrlInput = document.getElementById('adm-direct-invite-url');
  const btnCopyUrl = document.getElementById('btn-copy-direct-invite-url');

  function generateRandomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'MEET-';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    code += '-';
    for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  }

  if (btnGenKey && roomKeyInput) {
    btnGenKey.onclick = () => {
      roomKeyInput.value = generateRandomCode();
      showToast('🔑 Clave aleatoria generada.');
    };
  }

  if (formGenerate) {
    formGenerate.onsubmit = (e) => {
      e.preventDefault();
      const room = roomNameInput.value.trim() || 'PPV-MEET-8942';
      const key = roomKeyInput.value.trim() || generateRandomCode();

      const fullUrl = `${window.location.origin}/#join-room?room=${encodeURIComponent(room)}&key=${encodeURIComponent(key)}`;
      
      if (inviteUrlInput) inviteUrlInput.value = fullUrl;
      if (linkBox) linkBox.style.display = 'block';

      showToast('¡Enlace de invitación directo generado con éxito!');
    };
  }

  if (btnCopyUrl && inviteUrlInput) {
    btnCopyUrl.onclick = () => {
      if (inviteUrlInput.value) {
        navigator.clipboard.writeText(inviteUrlInput.value);
        showToast('📋 Enlace de invitación copiado al portapapeles.');
      }
    };
  }
}

/* --------------------------------------------------------------------------
   8. MANTENEDOR DE USUARIOS & CREDENCIALES ADMINISTRATIVAS
   -------------------------------------------------------------------------- */
function initUserMaintainer() {
  const form = document.getElementById('form-update-admin-credentials');
  const emailInput = document.getElementById('edit-admin-email');
  const passInput = document.getElementById('edit-admin-password');
  const confirmInput = document.getElementById('edit-admin-password-confirm');

  if (emailInput) {
    emailInput.value = getAdminEmail();
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const newEmail = emailInput.value.trim();
      const newPass = passInput.value.trim();
      const confirmPass = confirmInput.value.trim();

      if (!newEmail || !newEmail.includes('@')) {
        showToast('Por favor ingresa un correo electrónico válido.');
        return;
      }

      if (newPass.length < 8) {
        showToast('La contraseña debe tener al menos 8 caracteres.');
        return;
      }

      if (newPass !== confirmPass) {
        showToast('Las contraseñas no coinciden. Por favor verifica.');
        return;
      }

      const eHash = await hashString(newEmail);
      const pHash = await hashString(newPass);

      const newHashes = { emailHash: eHash, passHash: pHash };
      localStorage.setItem('ppv_admin_custom_hashes', JSON.stringify(newHashes));
      localStorage.setItem('ppv_admin_custom_email', newEmail);
      sessionStorage.setItem('ppv_admin_email', newEmail);

      const userDisplay = document.getElementById('admin-user-display');
      if (userDisplay) userDisplay.textContent = newEmail;

      passInput.value = '';
      confirmInput.value = '';

      showToast('¡Credenciales administrativas actualizadas con éxito! Usa tus nuevos datos en el próximo inicio de sesión.');
    };
  }
}

/* --------------------------------------------------------------------------
   9. GENERADOR DE CARTAS LEGALES & DOCUMENTOS PDF
   -------------------------------------------------------------------------- */
function initPdfGeneratorMaintainer() {
  const form = document.getElementById('form-admin-generate-pdf-docs');
  const resultBox = document.getElementById('gen-pdf-result-box');
  const resultMsg = document.getElementById('gen-pdf-result-msg');

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        client_name: document.getElementById('gen-pdf-name').value.trim(),
        rut: document.getElementById('gen-pdf-rut').value.trim(),
        domain: document.getElementById('gen-pdf-domain').value.trim(),
        contact_person: document.getElementById('gen-pdf-person').value.trim(),
        email: document.getElementById('gen-pdf-email').value.trim(),
        plan_tier: document.getElementById('gen-pdf-tier').value
      };

      showToast('⏳ Compilando y generando documentos PDF...');
      if (resultBox) resultBox.style.display = 'none';

      try {
        const res = await fetch('/tg-generate-docs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.ok) {
          showToast('✅ ¡Documentos PDF generados con éxito!');
          if (resultBox) resultBox.style.display = 'block';
          if (resultMsg) {
            resultMsg.innerHTML = `Se crearon la <strong>Carta de Autorización Legal</strong> y el <strong>Informe de Diagnóstico</strong> en la carpeta:<br><code style="color: var(--neon-cyan); font-size: 0.85rem;">${data.folder}</code>`;
          }
        } else {
          showToast('❌ Error al generar PDFs: ' + (data.error || 'Desconocido'), true);
        }
      } catch (err) {
        console.error('Error enviando petición /tg-generate-docs:', err);
        showToast('❌ Error de conexión al generar documentos PDF.', true);
      }
    };
  }
}

/* --------------------------------------------------------------------------
   9. CENTRO DE CIBERSEGURIDAD, RESGUARDO LEGAL & HARDENING WORKFLOW
   -------------------------------------------------------------------------- */
function initSecAuditWorkflowMaintainer() {
  // Pestañas internas
  const tabBtns = document.querySelectorAll('.sec-flow-tab-btn');
  const tabContents = document.querySelectorAll('.sec-flow-tab-content');

  tabBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = 'rgba(255,255,255,0.2)';
        b.style.color = 'var(--text-muted)';
      });
      tabContents.forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      btn.style.borderColor = 'var(--neon-cyan)';
      btn.style.color = 'var(--neon-cyan)';

      const targetId = btn.getAttribute('data-tab');
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.style.display = 'block';
    };
  });

  // 1. Subida de Carta Firmada (Resguardo Legal)
  const formUpload = document.getElementById('form-upload-signed-letter');
  if (formUpload) {
    formUpload.onsubmit = async (e) => {
      e.preventDefault();
      const domain = document.getElementById('upload-letter-domain').value.trim();
      const msgId = document.getElementById('upload-letter-msg-id').value.trim();
      const fileInput = document.getElementById('upload-letter-file');
      const resultBox = document.getElementById('upload-letter-result-box');

      if (!fileInput.files || !fileInput.files[0]) {
        showToast('Selecciona un archivo PDF o imagen firmada.', true);
        return;
      }

      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const fileB64 = reader.result;
        try {
          const res = await fetch('/tg-upload-signed-letter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              domain: domain,
              filename: file.name,
              file_b64: fileB64,
              message_id: msgId ? parseInt(msgId, 10) : null
            })
          });
          const data = await res.json();
          if (data.ok) {
            showToast('✅ ¡Resguardo Legal Almacenado Exitosamente!');
            if (resultBox) {
              resultBox.style.display = 'block';
              resultBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>Documento Guardado:</strong> <code>${data.saved_path}</code><br>Estado de solicitud actualizado a 🟢 Resguardo Legal Verificado.`;
            }
            formUpload.reset();
            refreshAllData();
          } else {
            showToast('❌ Error al guardar resguardo: ' + (data.error || 'Error'), true);
          }
        } catch (err) {
          console.error('Error subiendo carta firmada:', err);
          showToast('❌ Error de conexión al guardar resguardo legal.', true);
        }
      };
      reader.readAsDataURL(file);
    };
  }

  // 2. Escáner de Ciberseguridad Nivel 1
  const formScan = document.getElementById('form-run-security-scan');
  if (formScan) {
    formScan.onsubmit = async (e) => {
      e.preventDefault();
      const targetUrl = document.getElementById('scan-target-url').value.trim();
      const resBox = document.getElementById('scan-results-box');
      const domainEl = document.getElementById('scan-res-domain');
      const dateEl = document.getElementById('scan-res-date');
      const scoreEl = document.getElementById('scan-res-score');
      const ratingEl = document.getElementById('scan-res-rating');
      const findingsList = document.getElementById('scan-findings-list');
      const passedList = document.getElementById('scan-passed-list');

      showToast('🔍 Ejecutando análisis técnico en tiempo real...');

      try {
        const res = await fetch('/tg-run-security-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl })
        });
        const data = await res.json();
        if (data.ok && data.scan) {
          const s = data.scan;
          showToast(`Análisis completado. Puntaje: ${s.score}%`);
          if (resBox) resBox.style.display = 'block';
          if (domainEl) domainEl.textContent = s.domain;
          if (dateEl) dateEl.textContent = s.scan_date;
          if (scoreEl) {
            scoreEl.textContent = `${s.score}%`;
            scoreEl.style.color = s.score >= 85 ? 'var(--neon-emerald)' : (s.score >= 60 ? 'var(--neon-amber)' : 'var(--neon-pink)');
          }
          if (ratingEl) {
            ratingEl.textContent = s.status_rating;
            ratingEl.className = `badge-status ${s.score >= 85 ? 'badge-read' : (s.score >= 60 ? 'badge-new' : 'badge-replied')}`;
          }

          // Renderizar hallazgos
          if (findingsList) {
            findingsList.innerHTML = '';
            if (s.findings.length === 0) {
              findingsList.innerHTML = '<div style="font-size: 0.8rem; color: var(--neon-emerald);"><i class="fa-solid fa-check"></i> No se encontraron hallazgos críticos de gravedad.</div>';
            } else {
              s.findings.forEach(f => {
                const item = document.createElement('div');
                item.style.cssText = 'background: rgba(255,0,127,0.06); border: 1px solid rgba(255,0,127,0.3); padding: 0.6rem; border-radius: 6px; font-size: 0.8rem;';
                item.innerHTML = `<strong style="color: var(--neon-pink);">[${f.severity}] ${escapeHtml(f.item)}</strong><br><span style="color: var(--text-muted);">${escapeHtml(f.detail)}</span><br><em style="color: var(--neon-cyan);">💡 Recomendación: ${escapeHtml(f.recommendation)}</em>`;
                findingsList.appendChild(item);
              });
            }
          }

          // Renderizar pruebas superadas
          if (passedList) {
            passedList.innerHTML = '';
            s.passed.forEach(p => {
              const pItem = document.createElement('div');
              pItem.innerHTML = `<i class="fa-solid fa-check text-emerald"></i> <strong>${escapeHtml(p.item)}:</strong> ${escapeHtml(p.detail)}`;
              passedList.appendChild(pItem);
            });
          }
        } else {
          showToast('❌ Error en escaneo: ' + (data.error || 'Desconocido'), true);
        }
      } catch (err) {
        console.error('Error ejecutando escaneo:', err);
        showToast('❌ Error de conexión al escanear sitio.', true);
      }
    };
  }

  // 3. Formulario Hardening Nivel 2
  const formHard = document.getElementById('form-hardening-log');
  if (formHard) {
    formHard.onsubmit = async (e) => {
      e.preventDefault();
      const domain = document.getElementById('hard-domain').value.trim();
      const serverType = document.getElementById('hard-server-type').value.trim();

      const payload = {
        client_name: domain,
        rut: 'Resguardo N° 21.459',
        domain: domain,
        contact_person: 'Cliente',
        email: 'contacto@ppvsoluciones.cl',
        plan_tier: `Hardening Completado (${serverType || 'Nginx/Ubuntu'})`
      };

      try {
        const res = await fetch('/tg-generate-docs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.ok) {
          showToast('✅ ¡Certificado de Hardening y Reporte Final emitidos con éxito!');
        } else {
          showToast('❌ Error al emitir certificado: ' + (data.error || 'Error'), true);
        }
      } catch (err) {
        console.error('Error emitir certificado hardening:', err);
        showToast('❌ Error de conexión al generar certificado.', true);
      }
    };
  }
/* --------------------------------------------------------------------------
   10. MANTENEDOR DE CLIENTES & CASOS DE ÉXITO (CRUD)
   -------------------------------------------------------------------------- */
function initClientsCRUD() {
  const form = document.getElementById('form-portal-client');
  const tbody = document.getElementById('portal-clients-tbody');
  const btnCancel = document.getElementById('btn-cancel-edit-client');
  const titleEl = document.getElementById('client-form-title');

  loadClientsTable();

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('p-client-id').value;
      const name = document.getElementById('p-client-name').value.trim();
      const rubro = document.getElementById('p-client-rubro').value.trim();
      const category = document.getElementById('p-client-category').value;
      const website = document.getElementById('p-client-website').value.trim();
      const solution = document.getElementById('p-client-solution').value.trim();

      const clientData = {
        name,
        rubro,
        category,
        website,
        solution,
        badge: category === 'Ciberseguridad' ? '🛡️ Ciberseguridad Ley 21.459' : (category === 'Desarrollo Web' ? '💻 Web App & Automatización' : '🤖 Automatización IA')
      };

      if (id) {
        clientData.id = parseInt(id, 10);
      }

      await window.portfolioDB.saveClient(clientData);
      showToast(id ? '✅ Cliente actualizado con éxito' : '✅ Nuevo caso de éxito agregado');
      resetForm();
      await loadClientsTable();
    };
  }

  if (btnCancel) {
    btnCancel.onclick = () => resetForm();
  }

  function resetForm() {
    if (form) form.reset();
    document.getElementById('p-client-id').value = '';
    if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-user-plus"></i> Agregar Nuevo Cliente / Caso de Éxito';
    if (btnCancel) btnCancel.style.display = 'none';
  }

  async function loadClientsTable() {
    if (!tbody || !window.portfolioDB) return;
    const clients = await window.portfolioDB.getAllClients();
    tbody.innerHTML = '';

    if (!clients || clients.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No hay clientes ni casos de éxito registrados.</td></tr>';
      return;
    }

    clients.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${c.id}</td>
        <td><strong style="color: #fff;">${escapeHtml(c.name)}</strong></td>
        <td><span style="font-size: 0.8rem; color: var(--neon-cyan);">${escapeHtml(c.rubro)}</span></td>
        <td><span class="badge-status badge-new">${escapeHtml(c.category)}</span></td>
        <td style="font-size: 0.8rem; max-width: 250px;">${escapeHtml(c.solution)}</td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-outline btn-edit-client" data-id="${c.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-cyan); color: var(--neon-cyan);">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-outline btn-delete-client" data-id="${c.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit-client').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.id, 10);
        const client = clients.find(item => item.id === id);
        if (client) {
          document.getElementById('p-client-id').value = client.id;
          document.getElementById('p-client-name').value = client.name || '';
          document.getElementById('p-client-rubro').value = client.rubro || '';
          document.getElementById('p-client-category').value = client.category || 'Ciberseguridad';
          document.getElementById('p-client-website').value = client.website || '';
          document.getElementById('p-client-solution').value = client.solution || '';

          if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editando Cliente #${client.id}: ${escapeHtml(client.name)}`;
          if (btnCancel) btnCancel.style.display = 'inline-block';
          window.scrollTo({ top: document.querySelector('.maintainer-form-box').offsetTop - 80, behavior: 'smooth' });
        }
      };
    });

    tbody.querySelectorAll('.btn-delete-client').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('¿Eliminar este caso de éxito de la lista?')) {
          await window.portfolioDB.deleteClient(parseInt(btn.dataset.id, 10));
          await loadClientsTable();
          showToast('Cliente eliminado de los casos de éxito.');
        }
      };
    });
  }
}



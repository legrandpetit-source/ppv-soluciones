/* ==========================================================================
   CONSOLA DE ADMINISTRACIÓN /ADMIN - LÓGICA DE MANTENEDORES
   ========================================================================== */

const ADMIN_HASHES = {
  emailHash: 'dbcba288f24a1d8b77274a31adba1b6ae7c5744e7b9e99776e556a816a5e4bb1',
  passHash: '2bea8efab55e996f89e4804280208da9711e6a2a693a30bc77355abed3c2ccdc'
};

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
        userDisplay.textContent = sessionStorage.getItem('ppv_admin_email') || 'admin@ppvsoluciones.cl';
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

      Promise.all([hashString(email), hashString(pass)]).then(([eHash, pHash]) => {
        if (eHash === ADMIN_HASHES.emailHash && pHash === ADMIN_HASHES.passHash) {
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
  await loadMessagesTable();
  await loadServicesTable();
  await loadSkillsTable();
  await loadBlockedTable();
  await updateCounters();
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
  const views = document.querySelectorAll('.admin-panel-view');

  sidebarBtns.forEach(btn => {
    btn.onclick = () => {
      sidebarBtns.forEach(b => b.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const targetView = document.getElementById(btn.dataset.view);
      if (targetView) targetView.classList.add('active');
    };
  });
}

/* --------------------------------------------------------------------------
   4. MANTENEDOR DE MENSAJES DE CONTACTO
   -------------------------------------------------------------------------- */
async function loadMessagesTable() {
  const tbody = document.getElementById('portal-messages-tbody');
  const btnExport = document.getElementById('btn-portal-export-json');
  if (!tbody || !window.portfolioDB) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">Cargando mensajes...</td></tr>';
  const messages = await window.portfolioDB.getAllMessages();

  if (!messages.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">No hay mensajes registrados.</td></tr>';
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



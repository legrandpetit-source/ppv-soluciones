/**
 * MessageDB - Gestor de Base de Datos IndexedDB Completo (Mantenedores CRUD)
 * Soporta Mensajes, Servicios (Calculadora), Habilidades Técnicas, Palabras Bloqueadas y Configuración.
 */
class MessageDB {
  constructor() {
    this.dbName = 'PPVSolutionsDB';
    this.dbVersion = 3;
    this.stores = {
      messages: 'contact_messages',
      services: 'services',
      skills: 'skills',
      config: 'config',
      blocked: 'blocked_words'
    };
    this.db = null;
    this.init();
  }

  init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        
        // Store: Mensajes de Contacto
        if (!db.objectStoreNames.contains(this.stores.messages)) {
          const mStore = db.createObjectStore(this.stores.messages, { keyPath: 'id', autoIncrement: true });
          mStore.createIndex('createdAt', 'createdAt', { unique: false });
          mStore.createIndex('status', 'status', { unique: false });
        }

        // Store: Servicios & Precios (Calculadora)
        if (!db.objectStoreNames.contains(this.stores.services)) {
          const sStore = db.createObjectStore(this.stores.services, { keyPath: 'id', autoIncrement: true });
          sStore.createIndex('title', 'title', { unique: false });
        }

        // Store: Habilidades Técnicas
        if (!db.objectStoreNames.contains(this.stores.skills)) {
          const skStore = db.createObjectStore(this.stores.skills, { keyPath: 'id', autoIncrement: true });
          skStore.createIndex('category', 'category', { unique: false });
        }

        // Store: Palabras & Rubros Bloqueados
        if (!db.objectStoreNames.contains(this.stores.blocked)) {
          const bStore = db.createObjectStore(this.stores.blocked, { keyPath: 'id', autoIncrement: true });
          bStore.createIndex('word', 'word', { unique: true });
        }

        // Store: Configuración General
        if (!db.objectStoreNames.contains(this.stores.config)) {
          db.createObjectStore(this.stores.config, { keyPath: 'key' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        this.seedDefaultsIfEmpty().then(() => resolve(this.db));
      };

      request.onerror = (e) => {
        console.error('IndexedDB Error:', e.target.error);
        reject(e.target.error);
      };
    });

    return this.initPromise;
  }

  // Datos semilla por defecto si la base de datos está vacía
  async seedDefaultsIfEmpty() {
    const services = await this.getAll('services');
    if (!services || services.length === 0) {
      const defaultServices = [
        { title: 'Sistema de Automatización & Bot Básico', desc: 'Asistente web inteligente conectado a tus datos y servicios.', priceUSD: 350, timeDays: '3 días', icon: 'fa-robot', selected: true },
        { title: 'Flujo de Automatización n8n / Make', desc: 'Conexión de CRM, Email, Bases de datos y procesos en segundo plano.', priceUSD: 450, timeDays: '4 días', icon: 'fa-network-wired', selected: false },
        { title: 'Desarrollo Web App Completo', desc: 'Aplicación Frontend + Backend responsiva con diseño Cyberpunk/Glassmorphism.', priceUSD: 600, timeDays: '5 días', icon: 'fa-laptop-code', selected: false },
        { title: 'Diagnóstico de Ciberseguridad & Reporte PDF (Nivel 1)', desc: 'Auditoría de vulnerabilidades, chequeo de credenciales expuestas y entrega de informe PDF.', priceUSD: 200, timeDays: '2 días', icon: 'fa-file-pdf', selected: false },
        { title: 'Auditoría + Hardening & Parcheo Total (Nivel 2 Llave en Mano)', desc: 'Diagnóstico + Proxy backend seguro, hashes SHA-256, headers HTTP y carta legal Ley 21.459.', priceUSD: 450, timeDays: '4 días', icon: 'fa-shield-halved', selected: false },
        { title: 'Optimización & Evaluación de Código Automatizado', desc: 'Auditoría de rendimiento, refactorización y pruebas unitarias de código existente.', priceUSD: 250, timeDays: '2 días', icon: 'fa-code-compare', selected: false }
      ];
      for (const s of defaultServices) {
        await this.add('services', s);
      }
    }

    const skills = await this.getAll('skills');
    if (!skills || skills.length === 0) {
      const defaultSkills = [
        { name: 'APIs REST & Integración Webhooks', category: 'ai', level: '95%', levelText: 'Avanzado', desc: 'Conexión entre sistemas SaaS y estructuración JSON.' },
        { name: 'Python (FastAPI & Automation)', category: 'ai', level: '92%', levelText: 'Avanzado', desc: 'Desarrollo de scripts, automatizaciones y microservicios.' },
        { name: 'n8n & Make (Integromat)', category: 'auto', level: '94%', levelText: 'Avanzado', desc: 'Orquestación de flujos de trabajo automatizados.' },
        { name: 'JavaScript / Node.js', category: 'web', level: '95%', levelText: 'Avanzado', desc: 'Desarrollo Full-Stack y manipulación de APIs.' },
        { name: 'HTML5 & Vanilla CSS (Cyberpunk)', category: 'web', level: '98%', levelText: 'Experto', desc: 'Diseños responsive, Glassmorphism y animaciones.' },
        { name: 'React & Frontend Moderno', category: 'web', level: '88%', levelText: 'Intermedio-Alto', desc: 'Componentes reusables y Single Page Apps.' },
        { name: 'IndexedDB, SQL & NoSQL', category: 'db', level: '90%', levelText: 'Avanzado', desc: 'Esquemas relacionales y almacenamiento local.' }
      ];
      for (const sk of defaultSkills) {
        await this.add('skills', sk);
      }
    }

    const blocked = await this.getAll('blocked');
    if (!blocked || blocked.length === 0) {
      const defaultBlocked = [
        'delincuente', 'delincuencia', 'robo', 'ladron', 'ladrón', 'narcotrafico', 'narcotráfico',
        'droga', 'drogas', 'arma', 'armas', 'sicario', 'estafador', 'estafa', 'hack', 'hacker',
        'ilegal', 'ilícito', 'ilicito', 'matar', 'asesinato', 'prostitucion', 'prostitución',
        'puta', 'mierda', 'basura', 'asdf', 'qwerty', '1234', 'test', 'xxx', 'porno', 'sexo'
      ];
      for (const word of defaultBlocked) {
        try {
          await this.add('blocked', { word: word.toLowerCase().trim() });
        } catch (e) {
          // Ignorar duplicados
        }
      }
    }

    // Configuración por defecto de la insignia de estado
    const statusCfg = await this.getConfig('status_pill');
    if (!statusCfg) {
      await this.saveConfig('status_pill', {
        text: 'Disponible para Proyectos',
        theme: 'emerald', // emerald, amber, pink, cyan
        visible: true
      });
    }
  }

  // --- Métodos de Configuración Key-Value ---
  async getConfig(key) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.stores.config, 'readonly');
      const store = tx.objectStore(this.stores.config);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async saveConfig(key, value) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.stores.config, 'readwrite');
      const store = tx.objectStore(this.stores.config);
      const req = store.put({ key, value });
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // --- Métodos Genéricos CRUD ---
  async getAll(storeName) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.stores[storeName] || storeName, 'readonly');
      const store = tx.objectStore(this.stores[storeName] || storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async add(storeName, record) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.stores[storeName] || storeName, 'readwrite');
      const store = tx.objectStore(this.stores[storeName] || storeName);
      const req = store.add(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async update(storeName, record) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.stores[storeName] || storeName, 'readwrite');
      const store = tx.objectStore(this.stores[storeName] || storeName);
      const req = store.put(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async delete(storeName, id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.stores[storeName] || storeName, 'readwrite');
      const store = tx.objectStore(this.stores[storeName] || storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // --- Métodos de Mensajes ---
  async saveMessage(data) {
    const record = {
      name: data.name,
      email: data.email,
      subject: data.subject || 'Consulta General',
      budget: data.budget || 'Por definir',
      message: data.message,
      createdAt: new Date().toISOString(),
      timestampFormatted: new Date().toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Nuevo'
    };
    return await this.add('messages', record);
  }

  async getAllMessages() {
    const messages = await this.getAll('messages');
    return messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async updateMessageStatus(id, newStatus) {
    const messages = await this.getAll('messages');
    const target = messages.find(m => m.id === id);
    if (!target) throw new Error('Mensaje no encontrado');
    target.status = newStatus;
    return await this.update('messages', target);
  }

  async deleteMessage(id) {
    return await this.delete('messages', id);
  }

  // --- Métodos de Servicios (Calculadora) ---
  async saveService(serviceData) {
    if (serviceData.id) {
      return await this.update('services', serviceData);
    } else {
      return await this.add('services', serviceData);
    }
  }

  async deleteService(id) {
    return await this.delete('services', id);
  }

  // --- Métodos de Habilidades ---
  async saveSkill(skillData) {
    if (skillData.id) {
      return await this.update('skills', skillData);
    } else {
      return await this.add('skills', skillData);
    }
  }

  async deleteSkill(id) {
    return await this.delete('skills', id);
  }

  // --- Métodos de Palabras Bloqueadas ---
  async addBlockedWord(word) {
    const cleanWord = word.toLowerCase().trim();
    if (!cleanWord) return;
    return await this.add('blocked', { word: cleanWord });
  }

  async deleteBlockedWord(id) {
    return await this.delete('blocked', id);
  }
}

window.portfolioDB = new MessageDB();

/**
 * MessageDB - Gestor de Base de Datos Cliente-Servidor (SQLite Backend API)
 * Soporta Mensajes, Servicios (Calculadora), Habilidades Técnicas, Palabras Bloqueadas y Configuración.
 */
class MessageDB {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    // Ya no se requiere IndexedDB local
    // Todas las operaciones van contra la API de Python/SQLite.
    return Promise.resolve();
  }

  // --- Métodos de Usuarios Administradores (Multi-Usuario) ---
  async saveAdminUser(userData) {
    try {
      const res = await fetch('/tg-save-admin-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await res.json();
        return data.id;
      }
    } catch(e) {
      console.warn("Failed to save admin user to backend", e);
    }
    return null;
  }

  async getAllAdminUsers() {
    try {
      const res = await fetch('/tg-admin-users');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) return data.admin_users;
      }
    } catch(e) {
      console.warn("Failed to get admin users from backend", e);
    }
    return [];
  }

  async deleteAdminUser(id) {
    try {
      const res = await fetch('/tg-delete-admin-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      });
      if (res.ok) {
        const data = await res.json();
        return data.ok;
      }
    } catch(e) {
      console.warn("Failed to delete admin user from backend", e);
    }
    return false;
  }

  // --- Métodos de Clientes & Casos de Éxito ---
  async saveClient(clientData) {
    try {
      const res = await fetch('/tg-save-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (res.ok) {
        const data = await res.json();
        return data.id;
      }
    } catch(e) {
      console.warn("Failed to save client to backend", e);
    }
    return null;
  }

  async getAllClients() {
    try {
      const res = await fetch('/tg-clients');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) return data.clients;
      }
    } catch(e) {
      console.warn("Failed to get clients from backend", e);
    }
    return [];
  }

  async deleteClient(id) {
    try {
      const res = await fetch('/tg-delete-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      });
      if (res.ok) {
        const data = await res.json();
        return data.ok;
      }
    } catch(e) {
      console.warn("Failed to delete client from backend", e);
    }
    return false;
  }

  // --- Métodos de Configuración Key-Value ---
  async getConfig(key) {
    try {
      const res = await fetch(`/tg-get-config?key=${key}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.value !== null) {
          return data.value;
        }
      }
    } catch(e) {
      console.warn("Failed to getConfig from backend", e);
    }
    return null;
  }

  async saveConfig(key, value) {
    try {
      const res = await fetch('/tg-set-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key, value: value })
      });
      return res.ok;
    } catch(e) {
      console.warn("Failed to saveConfig to backend", e);
      return false;
    }
  }

  // --- Métodos de Mensajes ---
  async saveMessage(data) {
    // The main contact form handles saving via /tg-notify normally, 
    // this function is mostly for consistency if used locally.
    console.warn("saveMessage called via db.js, expected to use /tg-notify in submit form.");
    return true; 
  }

  async getAllMessages() {
    try {
      const res = await fetch('/tg-messages');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) return data.messages.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
      }
    } catch(e) {
      console.warn("Failed to get messages from backend", e);
    }
    return [];
  }

  async updateMessageStatus(id, newStatus) {
    try {
      const res = await fetch('/tg-update-message-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        return data.ok;
      }
    } catch(e) {
      console.warn("Failed to update status on backend", e);
    }
    return false;
  }

  async deleteMessage(id) {
    try {
      const res = await fetch('/tg-delete-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      });
      if (res.ok) {
        const data = await res.json();
        return data.ok;
      }
    } catch(e) {
      console.warn("Failed to delete message on backend", e);
    }
    return false;
  }

  // --- Métodos de Servicios (Calculadora) ---
  async saveService(serviceData) {
    try {
      const res = await fetch('/tg-save-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
      if (res.ok) {
        const data = await res.json();
        return data.id;
      }
    } catch(e) {
      console.warn("Failed to save service to backend", e);
    }
    return null;
  }

  async getAllServices() {
    try {
      const res = await fetch('/tg-services');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) return data.services;
      }
    } catch(e) {
      console.warn("Failed to get services from backend", e);
    }
    return [];
  }

  async deleteService(id) {
    try {
      const res = await fetch('/tg-delete-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      });
      if (res.ok) {
        const data = await res.json();
        return data.ok;
      }
    } catch(e) {
      console.warn("Failed to delete service from backend", e);
    }
    return false;
  }

  // --- Métodos de Habilidades ---
  async saveSkill(skillData) {
    try {
      const res = await fetch('/tg-save-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillData)
      });
      if (res.ok) {
        const data = await res.json();
        return data.id;
      }
    } catch(e) {
      console.warn("Failed to save skill to backend", e);
    }
    return null;
  }

  async getAllSkills() {
    try {
      const res = await fetch('/tg-skills');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) return data.skills;
      }
    } catch(e) {
      console.warn("Failed to get skills from backend", e);
    }
    return [];
  }

  async deleteSkill(id) {
    try {
      const res = await fetch('/tg-delete-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      });
      if (res.ok) {
        const data = await res.json();
        return data.ok;
      }
    } catch(e) {
      console.warn("Failed to delete skill from backend", e);
    }
    return false;
  }

  // --- Métodos de Palabras Bloqueadas ---
  async addBlockedWord(word) {
    const cleanWord = word.toLowerCase().trim();
    if (!cleanWord) return;
    try {
      const res = await fetch('/tg-add-blocked-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: cleanWord })
      });
      if (res.ok) {
        const data = await res.json();
        return data.id;
      }
    } catch(e) {
      console.warn("Failed to save blocked word to backend", e);
    }
    return null;
  }

  async getAllBlockedWords() {
    try {
      const res = await fetch('/tg-blocked-words');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) return data.blocked_words;
      }
    } catch(e) {
      console.warn("Failed to get blocked words from backend", e);
    }
    return [];
  }

  async deleteBlockedWord(id) {
    try {
      const res = await fetch('/tg-delete-blocked-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      });
      if (res.ok) {
        const data = await res.json();
        return data.ok;
      }
    } catch(e) {
      console.warn("Failed to delete blocked word from backend", e);
    }
    return false;
  }
  
  // Generic fallback for compatibility with existing UI code
  async getAll(storeName) {
    switch(storeName) {
      case 'services': return await this.getAllServices();
      case 'skills': return await this.getAllSkills();
      case 'blocked_words': 
      case 'blocked': return await this.getAllBlockedWords();
      case 'admin_users': return await this.getAllAdminUsers();
      case 'clients': return await this.getAllClients();
      case 'messages':
      case 'contact_messages': return await this.getAllMessages();
    }
    return [];
  }

  // Compatibility fallback for specific components that might use add/update/delete 
  // without calling the specific methods above.
  async delete(storeName, id) {
    switch(storeName) {
      case 'services': return await this.deleteService(id);
      case 'skills': return await this.deleteSkill(id);
      case 'blocked_words': 
      case 'blocked': return await this.deleteBlockedWord(id);
      case 'admin_users': return await this.deleteAdminUser(id);
      case 'clients': return await this.deleteClient(id);
      case 'messages':
      case 'contact_messages': return await this.deleteMessage(id);
    }
    return false;
  }
}

window.portfolioDB = new MessageDB();

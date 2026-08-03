#!/usr/bin/env python3
"""
==============================================================================
PPV SOLUCIONES - MOTOR DE BASE DE DATOS ROBUSTO Y PERSISTENCIA EN SERVIDOR
==============================================================================
Este módulo implementa la arquitectura de almacenamiento persistente en servidor
para PPV Soluciones (http://localhost:3000 y /admin).

Características Principales:
1. Almacenamiento Relacional SQLite3 con modo WAL (Write-Ahead Logging) para alta concurrencia.
2. Migraciones automáticas de esquemas e índices óptimos.
3. Copias de Seguridad Automáticas (Backups JSON / SQL).
4. Sincronización transparente con IndexedDB (Navegador).
5. Tablas de Auditoría de Firmas Digitales y Salas de Videollamadas.
"""

import sqlite3
import json
import os
import sys
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ppv_database.sqlite')
BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backups')

def get_connection():
    """Conexión robusta a la base de datos con modo WAL e integridad referencial."""
    conn = sqlite3.connect(DB_FILE, timeout=10)
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Inicializa el esquema relacional completo con índices y datos semilla."""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Tabla de Mensajes de Contacto
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT DEFAULT 'Consulta General',
                budget TEXT DEFAULT 'Por definir',
                message TEXT NOT NULL,
                status TEXT DEFAULT 'Nuevo',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_msg_status ON contact_messages(status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_msg_date ON contact_messages(created_at);")

        # 2. Tabla de Servicios & Precios (Calculadora Cotizadora)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                price_usd INTEGER NOT NULL,
                time_days TEXT NOT NULL,
                icon TEXT DEFAULT 'fa-check',
                selected INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 3. Tabla de Habilidades Técnicas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                level TEXT NOT NULL,
                level_text TEXT NOT NULL,
                description TEXT NOT NULL
            );
        """)

        # 4. Tabla de Palabras & Rubros Bloqueados (Lista Negra)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS blocked_words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT UNIQUE NOT NULL
            );
        """)

        # 5. Tabla de Configuración Global (Key-Value)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_config (
                config_key TEXT PRIMARY KEY,
                config_value TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 6. Tabla de Auditoría de Salas de Videollamadas & Enlaces Directos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS meeting_rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_code TEXT UNIQUE NOT NULL,
                access_key TEXT NOT NULL,
                host_email TEXT DEFAULT 'patricio@ppvsoluciones.cl',
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 7. Tabla de Registro de Minutas & Firmas Digitales (SHA-256 Stamp)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS signature_audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meeting_code TEXT NOT NULL,
                signatory_name TEXT NOT NULL,
                signatory_email TEXT NOT NULL,
                document_hash TEXT NOT NULL,
                signature_png_base64 TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Cargar datos semilla iniciales si la base de datos es nueva
        cursor.execute("SELECT COUNT(*) FROM services")
        if cursor.fetchone()[0] == 0:
            default_services = [
                ('Sistema de Automatización & Bot Básico', 'Asistente web inteligente conectado a tus datos y servicios.', 350, '3 días', 'fa-robot', 1),
                ('Flujo de Automatización n8n / Make', 'Conexión de CRM, Email, Bases de datos y procesos en segundo plano.', 450, '4 días', 'fa-network-wired', 0),
                ('Desarrollo Web App Completo', 'Aplicación Frontend + Backend responsiva con diseño Cyberpunk/Glassmorphism.', 600, '5 días', 'fa-laptop-code', 0),
                ('Auditoría de Seguridad, Hardening & Ciberprotección Web', 'Análisis de vulnerabilidades, proxy backend seguro para APIs, hashes SHA-256 y headers HTTP.', 350, '3 días', 'fa-shield-halved', 0),
                ('Optimización & Evaluación de Código Automatizado', 'Auditoría de rendimiento, refactorización y pruebas unitarias de código existente.', 250, '2 días', 'fa-code-compare', 0)
            ]
            cursor.executemany("""
                INSERT INTO services (title, description, price_usd, time_days, icon, selected)
                VALUES (?, ?, ?, ?, ?, ?);
            """, default_services)

        cursor.execute("SELECT COUNT(*) FROM blocked_words")
        if cursor.fetchone()[0] == 0:
            default_blocked = [
                'delincuente', 'delincuencia', 'robo', 'ladron', 'ladrón', 'narcotrafico', 'narcotráfico',
                'droga', 'drogas', 'arma', 'armas', 'sicario', 'estafador', 'estafa', 'hack', 'hacker',
                'ilegal', 'ilícito', 'ilicito', 'matar', 'asesinato', 'prostitucion', 'prostitución',
                'puta', 'mierda', 'basura', 'asdf', 'qwerty', '1234', 'test', 'xxx', 'porno', 'sexo'
            ]
            for word in default_blocked:
                cursor.execute("INSERT OR IGNORE INTO blocked_words (word) VALUES (?);", (word.lower().trim() if hasattr(word, 'trim') else word.lower().strip(),))

        # Configuración por defecto de la insignia de estado
        cursor.execute("""
            INSERT OR IGNORE INTO system_config (config_key, config_value)
            VALUES ('status_pill', ?);
        """, (json.dumps({"text": "Disponible para Proyectos", "theme": "emerald", "visible": True}),))

        conn.commit()
    print("✅ Base de datos SQLite3 persistente inicializada con éxito.")

def export_backup_json():
    """Genera un respaldo JSON completo de toda la base de datos."""
    init_database()
    backup_data = {}
    with get_connection() as conn:
        for table in ['contact_messages', 'services', 'skills', 'blocked_words', 'system_config', 'meeting_rooms', 'signature_audit_logs']:
            cursor = conn.execute(f"SELECT * FROM {table}")
            backup_data[table] = [dict(row) for row in cursor.fetchall()]

    filename = f"ppv_db_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = os.path.join(BACKUP_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, indent=2, ensure_ascii=False)
    print(f"📦 Backup exportado en: {filepath}")
    return filepath

if __name__ == '__main__':
    init_database()
    export_backup_json()

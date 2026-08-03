#!/usr/bin/env python3
"""
PPV SOLUCIONES - TELEGRAM NOTIFICATION PROXY & BACKEND PERSISTENCIA
Recibe datos del formulario de contacto/ciberseguridad, notifica via Telegram y guarda en SQLite3.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import os
import sqlite3
from datetime import datetime

# ── Configuración segura (solo en el servidor) ────────────────────────────────
TELEGRAM_BOT_TOKEN = '8623970624:AAEA5GQPNOJE53751yIir5PDCJglBbfFCMM'
TELEGRAM_CHAT_ID   = '1468481915'
PORT               = 9001
DB_PATH            = '/var/www/ppvsoluciones/ppv_database.sqlite'

def escape_html(text):
    if not text:
        return ''
    return str(text).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def save_to_db(name, email, subject, website, budget, message):
    try:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT DEFAULT 'Consulta General',
                website TEXT DEFAULT '',
                budget TEXT DEFAULT 'Por definir',
                message TEXT NOT NULL,
                status TEXT DEFAULT 'Nuevo',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        try:
            cursor.execute("ALTER TABLE contact_messages ADD COLUMN website TEXT DEFAULT '';")
        except Exception:
            pass

        cursor.execute('''
            INSERT INTO contact_messages (name, email, subject, website, budget, message)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (name, email, subject or 'Consulta General', website or '', budget or 'Por definir', message))
        conn.commit()
        conn.close()
        print(f"[TG-PROXY] ✅ Mensaje guardado exitosamente en SQLite DB ({email})")
    except Exception as e:
        print(f"[TG-PROXY] ❌ Error guardando en DB: {e}")

def get_all_messages_from_db():
    try:
        if not os.path.exists(DB_PATH):
            return []
        conn = sqlite3.connect(DB_PATH, timeout=5)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, subject, website, budget, message, status, created_at FROM contact_messages ORDER BY id DESC")
        rows = cursor.fetchall()
        result = [dict(row) for row in rows]
        conn.close()
        return result
    except Exception as e:
        print(f"[TG-PROXY] ❌ Error leyendo DB: {e}")
        return []

def send_telegram(name, email, subject, website, budget_text, message):
    now = datetime.now().strftime('%d-%m-%Y %H:%M')
    site_info = f"🌐 <b>Sitio Web / URL:</b> {escape_html(website)}\n" if website else ""
    text = (
        f"🚀 <b>NUEVO MENSAJE - PPV SOLUCIONES</b>\n\n"
        f"👤 <b>Nombre:</b> {escape_html(name)}\n"
        f"📧 <b>Email:</b> {escape_html(email)}\n"
        f"📌 <b>Asunto:</b> {escape_html(subject or 'Consulta General')}\n"
        f"{site_info}"
        f"💰 <b>Presupuesto/Plan:</b> {escape_html(budget_text or 'Por definir')}\n"
        f"⚖️ <b>Autorización Legal:</b> Aceptada (Ley 21.459)\n\n"
        f"💬 <b>Mensaje:</b>\n<i>\"{escape_html(message)}\"</i>\n\n"
        f"📅 <i>{now}</i>\n"
        f"🔒 <i>Origen: ppvsoluciones.cl</i>"
    )
    payload = json.dumps({
        'chat_id': TELEGRAM_CHAT_ID,
        'text': text,
        'parse_mode': 'HTML'
    }).encode('utf-8')
    req = urllib.request.Request(
        f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage',
        data=payload,
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=10) as res:
        return json.loads(res.read())

class TelegramProxyHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[TG-PROXY] {self.address_string()} - {format % args}")

    def send_cors_headers(self):
        origin = self.headers.get('Origin', '')
        if 'ppvsoluciones.cl' in origin or 'localhost' in origin or '127.0.0.1' in origin:
            self.send_header('Access-Control-Allow-Origin', origin)
        else:
            self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path in ['/tg-messages', '/api/messages']:
            messages = get_all_messages_from_db()
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True, 'messages': messages}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path not in ['/tg-notify', '/api/notify']:
            self.send_response(404)
            self.end_headers()
            return

        try:
            length = int(self.headers.get('Content-Length', 0))
            if length > 20_000:
                self.send_response(413)
                self.end_headers()
                return

            body = self.rfile.read(length)
            data = json.loads(body.decode('utf-8'))

            name       = str(data.get('name', ''))[:120]
            email      = str(data.get('email', ''))[:180]
            subject    = str(data.get('subject', ''))[:200]
            website    = str(data.get('website', ''))[:150]
            budget     = str(data.get('budgetText', ''))[:100]
            message    = str(data.get('message', ''))[:2000]

            if not name or not email or not message:
                self.send_response(400)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': 'Faltan campos requeridos'}).encode())
                return

            # 1. Guardar en SQLite en el servidor
            save_to_db(name, email, subject, website, budget, message)

            # 2. Notificar a Telegram
            tg_result = send_telegram(name, email, subject, website, budget, message)

            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True, 'telegram': tg_result.get('ok', False)}).encode())

        except Exception as e:
            print(f"[TG-PROXY] Error: {e}")
            self.send_response(500)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())

def run():
    server = HTTPServer(('0.0.0.0', PORT), TelegramProxyHandler)
    print(f"🔐 Telegram Proxy & Server DB API escuchando en 0.0.0.0:{PORT}...")
    server.serve_forever()

if __name__ == '__main__':
    run()

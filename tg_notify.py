#!/usr/bin/env python3
"""
PPV SOLUCIONES - TELEGRAM NOTIFICATION PROXY
Recibe datos del formulario de contacto y notifica via Telegram.
El token del bot NUNCA se expone al navegador.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import os
import re
from datetime import datetime

# ── Configuración segura (solo en el servidor) ────────────────────────────────
TELEGRAM_BOT_TOKEN = '8623970624:AAEA5GQPNOJE53751yIir5PDCJglBbfFCMM'
TELEGRAM_CHAT_ID   = '1468481915'
PORT               = 9001
ALLOWED_ORIGIN     = 'https://ppvsoluciones.cl'

def escape_html(text):
    if not text:
        return ''
    return str(text).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def send_telegram(name, email, subject, budget_text, message):
    now = datetime.now().strftime('%d-%m-%Y %H:%M')
    text = (
        f"🚀 <b>NUEVO MENSAJE - PPV SOLUCIONES</b>\n\n"
        f"👤 <b>Nombre:</b> {escape_html(name)}\n"
        f"📧 <b>Email:</b> {escape_html(email)}\n"
        f"📌 <b>Asunto:</b> {escape_html(subject or 'Consulta General')}\n"
        f"💰 <b>Presupuesto:</b> {escape_html(budget_text or 'Por definir')}\n\n"
        f"💬 <b>Mensaje:</b>\n<i>\"{escape_html(message)}\"</i>\n\n"
        f"📅 <i>{now}</i>\n"
        f"🌐 <i>Origen: ppvsoluciones.cl</i>"
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
        self.send_header('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        if self.path != '/tg-notify':
            self.send_response(404)
            self.end_headers()
            return

        try:
            length = int(self.headers.get('Content-Length', 0))
            if length > 10_000:  # Max 10KB
                self.send_response(413)
                self.end_headers()
                return

            body = self.rfile.read(length)
            data = json.loads(body.decode('utf-8'))

            name       = str(data.get('name', ''))[:120]
            email      = str(data.get('email', ''))[:180]
            subject    = str(data.get('subject', ''))[:200]
            budget     = str(data.get('budgetText', ''))[:100]
            message    = str(data.get('message', ''))[:2000]

            # Validación básica
            if not name or not email or not message:
                self.send_response(400)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': 'Faltan campos requeridos'}).encode())
                return

            result = send_telegram(name, email, subject, budget, message)

            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': result.get('ok', False)}).encode())

        except Exception as e:
            print(f"[TG-PROXY] Error: {e}")
            self.send_response(500)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())

def run():
    server = HTTPServer(('0.0.0.0', PORT), TelegramProxyHandler)
    print(f"🔐 Telegram Proxy escuchando en 0.0.0.0:{PORT}...")
    server.serve_forever()

if __name__ == '__main__':
    run()

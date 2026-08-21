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
try:
    from zoneinfo import ZoneInfo
except ImportError:
    ZoneInfo = None

def load_env():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ[k.strip()] = v.strip().strip("'\"")

load_env()

# ── Configuración segura (desde .env o variables de entorno) ──────────────────
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '8623970624:AAHpuDjIr5gvSiSEAwdapx99EKZZzXEgD1c')
TELEGRAM_CHAT_ID   = os.environ.get('TELEGRAM_CHAT_ID', '1468481915')
PORT               = int(os.environ.get('PORT', 9001))
DB_PATH            = os.environ.get('DB_PATH', '/var/www/ppvsoluciones/ppv_database.sqlite')

def get_chile_now_str():
    """Retorna fecha y hora exacta en zona horaria de Chile (America/Santiago)."""
    try:
        if ZoneInfo:
            return datetime.now(ZoneInfo('America/Santiago')).strftime('%d-%m-%Y %H:%M hrs')
    except Exception as e:
        print(f"[TG-PROXY] ZoneInfo error: {e}")
    return datetime.now().strftime('%d-%m-%Y %H:%M hrs')

def escape_html(text):
    if not text:
        return ''
    return str(text).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def save_to_db(name, email, subject, website, budget, message, phone='', contact_pref=''):
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
                created_at TEXT
            )
        ''')
        try:
            cursor.execute("ALTER TABLE contact_messages ADD COLUMN website TEXT DEFAULT '';")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE contact_messages ADD COLUMN phone TEXT DEFAULT '';")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE contact_messages ADD COLUMN contact_pref TEXT DEFAULT '';")
        except Exception:
            pass

        now_chile = get_chile_now_str()
        cursor.execute('''
            INSERT INTO contact_messages (name, email, subject, website, budget, message, phone, contact_pref, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (name, email, subject or 'Consulta General', website or '', budget or 'Por definir', message, phone or '', contact_pref or '', now_chile))
        conn.commit()
        conn.close()
        print(f"[TG-PROXY] ✅ Mensaje guardado exitosamente en SQLite DB ({email}) a las {now_chile}")
    except Exception as e:
        print(f"[TG-PROXY] ❌ Error guardando en DB: {e}")

def get_all_messages_from_db():
    try:
        if not os.path.exists(DB_PATH):
            return []
        conn = sqlite3.connect(DB_PATH, timeout=5)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, subject, website, budget, message, status, created_at, phone, contact_pref FROM contact_messages ORDER BY id DESC")
        rows = cursor.fetchall()
        result = [dict(row) for row in rows]
        conn.close()
        return result
    except Exception as e:
        print(f"[TG-PROXY] ❌ Error leyendo DB: {e}")
        return []

def get_all_clients_from_db():
    try:
        if not os.path.exists(DB_PATH):
            return []
        conn = sqlite3.connect(DB_PATH, timeout=5)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, rubro, solution, category, website, badge FROM portfolio_clients ORDER BY id DESC")
        rows = cursor.fetchall()
        result = [dict(row) for row in rows]
        conn.close()
        return result
    except Exception as e:
        print("Error reading clients from DB:", e)
        return []

def save_client_to_db(data):
    try:
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()
        if 'id' in data and data['id']:
            cursor.execute('''
                UPDATE portfolio_clients 
                SET name=?, rubro=?, solution=?, category=?, website=?, badge=?
                WHERE id=?
            ''', (data.get('name'), data.get('rubro'), data.get('solution'), data.get('category'), data.get('website'), data.get('badge'), data['id']))
            client_id = data['id']
        else:
            cursor.execute('''
                INSERT INTO portfolio_clients (name, rubro, solution, category, website, badge)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (data.get('name'), data.get('rubro'), data.get('solution'), data.get('category'), data.get('website'), data.get('badge')))
            client_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return client_id
    except Exception as e:
        print("Error saving client to DB:", e)
        return None

def delete_client_from_db(client_id):
    try:
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM portfolio_clients WHERE id=?", (client_id,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print("Error deleting client from DB:", e)
        return False

def init_uf_db():
    try:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS uf_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT UNIQUE,
                uf_value REAL NOT NULL,
                clp_formatted TEXT,
                fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[TG-PROXY] DB UF Init Error: {e}")

def fetch_and_save_uf():
    init_uf_db()
    today_str = datetime.now().strftime('%Y-%m-%d')
    uf_val = None
    
    # 1. Consultar API de Mindicador.cl
    try:
        req = urllib.request.Request('https://mindicador.cl/api/uf', headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if 'serie' in data and len(data['serie']) > 0:
                uf_val = float(data['serie'][0]['valor'])
                raw_fecha = data['serie'][0]['fecha'][:10]
                if raw_fecha:
                    today_str = raw_fecha
    except Exception as e:
        print(f"[TG-PROXY] Warning mindicador.cl: {e}")

    try:
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()

        if uf_val:
            clp_fmt = f"${uf_val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            
            # Compatible Upsert for older SQLite versions
            cursor.execute("SELECT id FROM uf_history WHERE date = ?", (today_str,))
            if cursor.fetchone():
                cursor.execute('''
                    UPDATE uf_history SET uf_value=?, clp_formatted=?, fetched_at=datetime('now', 'localtime')
                    WHERE date=?
                ''', (uf_val, clp_fmt, today_str))
            else:
                cursor.execute('''
                    INSERT INTO uf_history (date, uf_value, clp_formatted, fetched_at)
                    VALUES (?, ?, ?, datetime('now', 'localtime'))
                ''', (today_str, uf_val, clp_fmt))
            conn.commit()
        else:
            cursor.execute("SELECT date, uf_value FROM uf_history ORDER BY id DESC LIMIT 1")
            row = cursor.fetchone()
            if row:
                today_str, uf_val = row[0], row[1]
            else:
                uf_val = 40844.79 # Valor base de respaldo

        cursor.execute("SELECT id, date, uf_value, clp_formatted, fetched_at FROM uf_history ORDER BY id DESC LIMIT 30")
        history_rows = cursor.fetchall()
        conn.close()
    except Exception as e:
        print(f"[TG-PROXY] Error UF DB: {e}")
        if not uf_val:
            uf_val = 40844.79
        history_rows = []

    history_list = []
    for r in history_rows:
        history_list.append({
            'id': r[0],
            'date': r[1],
            'uf_value': r[2],
            'clp_formatted': f"${r[2]:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'),
            'fetched_at': r[4]
        })

    clp_formatted_current = f"${uf_val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

    return {
        'ok': True,
        'date': today_str,
        'uf_value': uf_val,
        'clp_formatted': clp_formatted_current,
        'prices': {
            'audit_level_1_uf': 5.0,
            'audit_level_1_clp': round(5.0 * uf_val),
            'audit_level_2_uf': 11.0,
            'audit_level_2_clp': round(11.0 * uf_val),
            'basic_bot_uf': 8.5,
            'basic_bot_clp': round(8.5 * uf_val),
            'workflow_n8n_uf': 11.0,
            'workflow_n8n_clp': round(11.0 * uf_val),
            'full_webapp_uf': 15.0,
            'full_webapp_clp': round(15.0 * uf_val),
            'code_opt_uf': 6.0,
            'code_opt_clp': round(6.0 * uf_val)
        },
        'history': history_list
    }

def get_issuer_config():
    try:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS issuer_config (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                issuer_name TEXT DEFAULT 'Patricio Padilla',
                issuer_role TEXT DEFAULT 'CEO & Fundador',
                issuer_phone TEXT DEFAULT '+56 9 5704 0679',
                issuer_email TEXT DEFAULT 'contacto@ppvsoluciones.cl',
                issuer_website TEXT DEFAULT 'https://ppvsoluciones.cl',
                updated_at TEXT
            )
        ''')
        cursor.execute("SELECT issuer_name, issuer_role, issuer_phone, issuer_email, issuer_website FROM issuer_config WHERE id = 1")
        row = cursor.fetchone()
        if not row:
            now_str = get_chile_now_str()
            cursor.execute('''
                INSERT INTO issuer_config (id, issuer_name, issuer_role, issuer_phone, issuer_email, issuer_website, updated_at)
                VALUES (1, 'Patricio Padilla', 'CEO & Fundador', '+56 9 5704 0679', 'contacto@ppvsoluciones.cl', 'https://ppvsoluciones.cl', ?)
            ''', (now_str,))
            conn.commit()
            row = ('Patricio Padilla', 'CEO & Fundador', '+56 9 5704 0679', 'contacto@ppvsoluciones.cl', 'https://ppvsoluciones.cl')
        conn.close()
        return {
            'issuer_name': row[0],
            'issuer_role': row[1],
            'issuer_phone': row[2],
            'issuer_email': row[3],
            'issuer_website': row[4]
        }
    except Exception as e:
        print(f"[TG-PROXY] Error leyendo issuer_config: {e}")
        return {
            'issuer_name': 'Patricio Padilla',
            'issuer_role': 'CEO & Fundador',
            'issuer_phone': '+56 9 5704 0679',
            'issuer_email': 'contacto@ppvsoluciones.cl',
            'issuer_website': 'https://ppvsoluciones.cl'
        }

def save_issuer_config(name, role, phone, email, website):
    try:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS issuer_config (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                issuer_name TEXT DEFAULT 'Patricio Padilla',
                issuer_role TEXT DEFAULT 'CEO & Fundador',
                issuer_phone TEXT DEFAULT '+56 9 5704 0679',
                issuer_email TEXT DEFAULT 'contacto@ppvsoluciones.cl',
                issuer_website TEXT DEFAULT 'https://ppvsoluciones.cl',
                updated_at TEXT
            )
        ''')
        now_str = get_chile_now_str()
        
        cursor.execute("SELECT id FROM issuer_config WHERE id = 1")
        if cursor.fetchone():
            cursor.execute('''
                UPDATE issuer_config SET 
                    issuer_name=?, issuer_role=?, issuer_phone=?, 
                    issuer_email=?, issuer_website=?, updated_at=?
                WHERE id = 1
            ''', (name or 'Patricio Padilla', role or 'CEO & Fundador', phone or '+56 9 5704 0679', email or 'contacto@ppvsoluciones.cl', website or 'https://ppvsoluciones.cl', now_str))
        else:
            cursor.execute('''
                INSERT INTO issuer_config (id, issuer_name, issuer_role, issuer_phone, issuer_email, issuer_website, updated_at)
                VALUES (1, ?, ?, ?, ?, ?, ?)
            ''', (name or 'Patricio Padilla', role or 'CEO & Fundador', phone or '+56 9 5704 0679', email or 'contacto@ppvsoluciones.cl', website or 'https://ppvsoluciones.cl', now_str))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"[TG-PROXY] Error guardando issuer_config: {e}")
        return False

def init_config_kv():
    try:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS config_kv (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        ''')
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[TG-PROXY] Error init config_kv: {e}")

def get_config_kv(key):
    init_config_kv()
    try:
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM config_kv WHERE key = ?", (key,))
        row = cursor.fetchone()
        conn.close()
        return json.loads(row[0]) if row else None
    except Exception:
        return None

def set_config_kv(key, value):
    init_config_kv()
    try:
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT key FROM config_kv WHERE key = ?", (key,))
        if cursor.fetchone():
            cursor.execute("UPDATE config_kv SET value = ? WHERE key = ?", (json.dumps(value), key))
        else:
            cursor.execute("INSERT INTO config_kv (key, value) VALUES (?, ?)", (key, json.dumps(value)))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"[TG-PROXY] Error guardando config_kv: {e}")
        return False

def send_telegram(name, email, subject, website, budget_text, message, phone='', contact_pref=''):
    now = get_chile_now_str()
    site_info = f"🌐 <b>Sitio Web / URL:</b> {escape_html(website)}\n" if website else ""
    phone_info = f"📱 <b>Teléfono:</b> {escape_html(phone)}\n" if phone else ""
    pref_info = f"💬 <b>Preferencia de Contacto:</b> {escape_html(contact_pref)}\n" if contact_pref else ""

    text = (
        f"🚀 <b>NUEVO MENSAJE - PPV SOLUCIONES</b>\n\n"
        f"👤 <b>Nombre:</b> {escape_html(name)}\n"
        f"📧 <b>Email:</b> {escape_html(email)}\n"
        f"{phone_info}"
        f"{pref_info}"
        f"📌 <b>Asunto:</b> {escape_html(subject or 'Consulta General')}\n"
        f"{site_info}"
        f"💰 <b>Presupuesto/Plan:</b> {escape_html(budget_text or 'Por definir')}\n"
        f"⚖️ <b>Autorización Legal:</b> Aceptada (Ley 21.459)\n\n"
        f"💬 <b>Mensaje:</b>\n<i>\"{escape_html(message)}\"</i>\n\n"
        f"📅 <b>Fecha & Hora (Chile):</b> <i>{now}</i>\n"
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

        if self.path in ['/tg-clients', '/api/clients']:
            clients = get_all_clients_from_db()
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True, 'clients': clients}).encode('utf-8'))
            return

        if self.path in ['/tg-uf-rate', '/api/uf-rate']:
            uf_data = fetch_and_save_uf()
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(uf_data).encode('utf-8'))
            return

        if self.path.startswith('/tg-get-config') or self.path.startswith('/api/get-config'):
            import urllib.parse
            parsed_path = urllib.parse.urlparse(self.path)
            query = urllib.parse.parse_qs(parsed_path.query)
            key = query.get('key', [None])[0]
            if key:
                val = get_config_kv(key)
                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True, 'value': val}).encode('utf-8'))
            else:
                self.send_response(400)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': 'Missing key'}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):

        if self.path in ['/tg-generate-docs', '/api/generate-docs']:
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body.decode('utf-8'))

                client_name = str(data.get('client_name', ''))[:150]
                rut = str(data.get('rut', ''))[:50]
                domain = str(data.get('domain', ''))[:150]
                contact_person = str(data.get('contact_person', ''))[:150]
                email = str(data.get('email', ''))[:180]
                plan_tier = str(data.get('plan_tier', '$450 USD'))[:100]

                if not domain:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'ok': False, 'error': 'Falta el dominio o URL'}).encode())
                    return

                import generate_pdf
                db_cfg = get_issuer_config()
                issuer_cfg = {
                    'issuer_name': str(data.get('issuer_name') or db_cfg.get('issuer_name') or 'Patricio Padilla').strip(),
                    'issuer_role': str(data.get('issuer_role') or db_cfg.get('issuer_role') or 'CEO & Fundador').strip(),
                    'issuer_phone': str(data.get('issuer_phone') or db_cfg.get('issuer_phone') or '+56 9 5704 0679').strip(),
                    'issuer_email': str(data.get('issuer_email') or db_cfg.get('issuer_email') or 'contacto@ppvsoluciones.cl').strip(),
                    'issuer_website': str(data.get('issuer_website') or db_cfg.get('issuer_website') or 'https://ppvsoluciones.cl').strip()
                }
                pdf1_paths = generate_pdf.generate_client_authorization_pdf(client_name, rut, domain, contact_person, email, plan_tier, issuer_config=issuer_cfg)
                pdf2_paths = generate_pdf.generate_client_audit_report_pdf(client_name, domain, plan_tier, issuer_config=issuer_cfg)

                clean_dom = domain.replace('https://', '').replace('http://', '').replace('www.', '').strip('/')
                local_folder_display = f"Escritorio/Auditoría/{clean_dom}/"

                # Leer archivos en base64 para envío al navegador y posterior descarga directa en la computadora del usuario
                download_files = []
                all_generated_paths = []
                if isinstance(pdf1_paths, list): all_generated_paths.extend(pdf1_paths)
                if isinstance(pdf2_paths, list): all_generated_paths.extend(pdf2_paths)

                seen_names = set()
                for p_path in all_generated_paths:
                    if p_path and os.path.exists(p_path):
                        fname = os.path.basename(p_path)
                        if fname not in seen_names:
                            seen_names.add(fname)
                            with open(p_path, 'rb') as f:
                                b64_pdf = base64.b64encode(f.read()).decode('utf-8')
                                download_files.append({
                                    'name': fname,
                                    'b64': b64_pdf
                                })
                            # ELIMINAR del servidor inmediatamente para no consumir espacio en disco en la nube
                            try:
                                os.remove(p_path)
                            except Exception:
                                pass

                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True, 'folder': local_folder_display, 'files': list(seen_names), 'downloads': download_files}).encode('utf-8'))
                return
            except Exception as e:
                print(f"[TG-PROXY] Error generando PDFs: {e}")
                self.send_response(500)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())
                return

        if self.path in ['/tg-generate-executive-summary', '/api/generate-executive-summary']:
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body.decode('utf-8'))

                action = str(data.get('action', 'pdf'))
                doc_type = str(data.get('doc_type', 'presentation'))
                client_name = str(data.get('client_name', ''))[:150]
                company_name = str(data.get('company_name', ''))[:150]
                phone = str(data.get('phone', ''))[:50]
                email = str(data.get('email', ''))[:180]
                domain = str(data.get('domain', ''))[:150]
                plan_tier = str(data.get('plan_tier', '$450 USD'))[:100]
                custom_markdown = data.get('custom_markdown')

                import generate_pdf
                issuer_cfg = {
                    'issuer_name': str(data.get('issuer_name') or 'Patricio Padilla').strip(),
                    'issuer_role': str(data.get('issuer_role') or 'CEO & Fundador').strip(),
                    'issuer_phone': str(data.get('issuer_phone') or '+56 9 5704 0679').strip(),
                    'issuer_email': str(data.get('issuer_email') or 'contacto@ppvsoluciones.cl').strip(),
                    'issuer_website': str(data.get('issuer_website') or 'https://ppvsoluciones.cl').strip()
                }

                if action == 'preview':
                    if custom_markdown and custom_markdown.strip():
                        md_preview = custom_markdown
                    elif doc_type == 'executive':
                        md_preview = generate_pdf.get_executive_summary_markdown(client_name, company_name, phone, email, domain, plan_tier, issuer_config=issuer_cfg)
                    else:
                        md_preview = generate_pdf.get_ppv_company_presentation_markdown(client_name, company_name, phone, email, domain, plan_tier, issuer_config=issuer_cfg)
                        
                    doc_title = "Presentación Institucional PPV Soluciones" if doc_type == 'presentation' else f"Resumen Ejecutivo - {company_name or client_name}"
                    html_preview = generate_pdf.markdown_to_html(md_preview, doc_title)
                    
                    self.send_response(200)
                    self.send_cors_headers()
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'ok': True, 'markdown': md_preview, 'html': html_preview}).encode('utf-8'))
                    return

                if doc_type == 'executive':
                    pdf_paths = generate_pdf.generate_executive_summary_pdf(
                        client_name=client_name,
                        company_name=company_name,
                        phone=phone,
                        email=email,
                        domain=domain,
                        plan_tier=plan_tier,
                        custom_markdown=custom_markdown,
                        issuer_config=issuer_cfg
                    )
                else:
                    pdf_paths = generate_pdf.generate_ppv_company_presentation_pdf(
                        client_name=client_name,
                        company_name=company_name,
                        phone=phone,
                        email=email,
                        domain=domain,
                        plan_tier=plan_tier,
                        custom_markdown=custom_markdown,
                        issuer_config=issuer_cfg
                    )

                download_files = []
                seen_names = set()
                if isinstance(pdf_paths, list):
                    for p_path in pdf_paths:
                        if p_path and os.path.exists(p_path):
                            fname = os.path.basename(p_path)
                            if fname not in seen_names:
                                seen_names.add(fname)
                                with open(p_path, 'rb') as f:
                                    b64_pdf = base64.b64encode(f.read()).decode('utf-8')
                                    download_files.append({
                                        'name': fname,
                                        'b64': b64_pdf
                                    })
                                try:
                                    os.remove(p_path)
                                except Exception:
                                    pass

                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True, 'files': list(seen_names), 'downloads': download_files}).encode('utf-8'))
                return
            except Exception as e:
                print(f"[TG-PROXY] Error generando Resumen Ejecutivo PDF: {e}")
                self.send_response(500)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode('utf-8'))
                return

        if self.path in ['/tg-run-security-scan', '/api/run-security-scan']:
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body.decode('utf-8'))
                url_to_scan = data.get('url', '').strip()
                if not url_to_scan:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'ok': False, 'error': 'URL requerida'}).encode())
                    return

                scan_result = run_defensive_security_scan(url_to_scan)
                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True, 'scan': scan_result}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())
                return

        if self.path in ['/tg-upload-signed-letter', '/api/upload-signed-letter']:
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body.decode('utf-8'))
                
                domain = data.get('domain', 'cliente').replace('https://', '').replace('http://', '').strip('/')
                filename = data.get('filename', 'carta_firmada.pdf')
                base64_data = data.get('file_b64', '')
                msg_id = data.get('message_id')

                if not base64_data:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'ok': False, 'error': 'Contenido del archivo no recibido'}).encode())
                    return

                clean_b64 = base64_data.split(',')[-1]
                file_bytes = base64.b64decode(clean_b64)
                
                out_dir = f"/home/patricio/Escritorio/Auditoría/{domain}/resguardo_legal/"
                os.makedirs(out_dir, exist_ok=True)
                save_file_path = os.path.join(out_dir, filename)

                with open(save_file_path, 'wb') as f:
                    f.write(file_bytes)

                if msg_id:
                    update_message_field(msg_id, 'status', 'Resguardo Legal Verificado 🟢')

                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True, 'saved_path': save_file_path}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())
                return

        if self.path in ['/tg-update-uf-rate', '/api/update-uf-rate']:
            try:
                uf_data = fetch_and_save_uf()
                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(uf_data).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())
                return

        if self.path in ['/tg-delete-message', '/api/delete-message']:
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body.decode('utf-8'))
                msg_id = data.get('id')
                
                if msg_id:
                    conn = sqlite3.connect(DB_PATH, timeout=5)
                    cursor = conn.cursor()
                    cursor.execute("DELETE FROM contact_messages WHERE id = ?", (msg_id,))
                    conn.commit()
                    conn.close()
                    
                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())
                return

        if self.path in ['/tg-save-client', '/api/save-client']:
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body.decode('utf-8'))
                
                client_id = save_client_to_db(data)
                if client_id is not None:
                    self.send_response(200)
                    self.send_cors_headers()
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'ok': True, 'id': client_id}).encode())
                else:
                    raise ValueError("Error al guardar en DB")
            except Exception as e:
                self.send_response(400)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())
            return

        if self.path in ['/tg-delete-client', '/api/delete-client']:
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body.decode('utf-8'))
                client_id = data.get('id')
                
                if client_id and delete_client_from_db(client_id):
                    self.send_response(200)
                    self.send_cors_headers()
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'ok': True}).encode())
                else:
                    raise ValueError("Error al eliminar en DB o falta ID")
            except Exception as e:
                self.send_response(400)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())
            return

        if self.path in ['/tg-update-message-status', '/api/update-message-status']:
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body.decode('utf-8'))
                msg_id = data.get('id')
                status = data.get('status')
                
                if msg_id and status:
                    update_message_field(msg_id, 'status', status)
                    
                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())
                return

        if self.path in ['/tg-set-config', '/api/set-config']:
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body.decode('utf-8'))
                key = data.get('key')
                value = data.get('value')
                
                if key and value is not None:
                    set_config_kv(key, value)
                    
                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())
                return

        if self.path in ['/tg-deploy', '/api/deploy']:
            try:
                import subprocess, threading, time, sys, os
                
                project_dir = os.path.dirname(os.path.abspath(__file__))
                result = subprocess.run(['git', 'pull', 'origin', 'main'], cwd=project_dir, capture_output=True, text=True)
                
                if result.returncode != 0:
                    raise Exception(f"Git pull falló: {result.stderr}")
                
                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'ok': True, 
                    'msg': 'Despliegue exitoso, reiniciando servidor...',
                    'output': result.stdout
                }).encode('utf-8'))
                
                def restart_server(server_instance):
                    time.sleep(1)
                    server_instance.server_close()
                    print("[TG-PROXY] Reiniciando servidor para aplicar cambios del webhook...")
                    os.execv(sys.executable, ['python3', sys.argv[0]] + sys.argv[1:])
                
                threading.Thread(target=restart_server, args=(self.server,)).start()
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())
                return

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
            phone      = str(data.get('phone', ''))[:50]
            contact_pref = str(data.get('contact_pref', ''))[:50]
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
            save_to_db(name, email, subject, website, budget, message, phone, contact_pref)

            # 2. Notificar a Telegram
            tg_result = send_telegram(name, email, subject, website, budget, message, phone, contact_pref)

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

import ssl
import socket
import urllib.parse
import base64

def run_defensive_security_scan(url_str):
    if not url_str.startswith(('http://', 'https://')):
        url_str = 'https://' + url_str
    
    try:
        parsed = urllib.parse.urlparse(url_str)
        domain = parsed.netloc or parsed.path
        domain = domain.split(':')[0]
    except Exception:
        domain = url_str

    findings = []
    passed = []
    score = 100

    # 1. SSL/TLS Certificate Check
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                ssl_version = ssock.version()
                passed.append({
                    'item': 'Certificado SSL/TLS Válido',
                    'detail': f'Conexión segura activa ({ssl_version})'
                })
    except Exception as e:
        score -= 25
        findings.append({
            'severity': 'ALTA',
            'item': 'Error o Certificado SSL/TLS No Encontrado',
            'detail': f'No se pudo verificar SSL en puerto 443: {str(e)}',
            'recommendation': 'Instalar certificado TLS/SSL e implementar HTTPS forzoso.'
        })

    # 2. HTTP Security Headers Check
    try:
        req = urllib.request.Request(url_str, headers={'User-Agent': 'PPV-Security-Audit-Bot/1.0'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            headers = {k.lower(): v for k, v in resp.headers.items()}
            
            # HSTS
            if 'strict-transport-security' in headers:
                passed.append({'item': 'Header HSTS Presente', 'detail': headers['strict-transport-security']})
            else:
                score -= 15
                findings.append({
                    'severity': 'MEDIO',
                    'item': 'Falta Header Strict-Transport-Security (HSTS)',
                    'detail': 'El sitio no envía la cabecera HSTS.',
                    'recommendation': 'Agregar "Strict-Transport-Security: max-age=31536000; includeSubDomains" en la configuración del servidor web.'
                })
            
            # X-Frame-Options
            if 'x-frame-options' in headers:
                passed.append({'item': 'Protección Clickjacking (X-Frame-Options)', 'detail': headers['x-frame-options']})
            else:
                score -= 10
                findings.append({
                    'severity': 'MEDIO',
                    'item': 'Falta Header X-Frame-Options',
                    'detail': 'Riesgo de incrustación de la web en iFrames de terceros (Clickjacking).',
                    'recommendation': 'Configurar "X-Frame-Options: SAMEORIGIN" o DENY en Nginx/Apache.'
                })

            # X-Content-Type-Options
            if 'x-content-type-options' in headers:
                passed.append({'item': 'Protección MIME Sniffing', 'detail': headers['x-content-type-options']})
            else:
                score -= 10
                findings.append({
                    'severity': 'BAJO',
                    'item': 'Falta Header X-Content-Type-Options',
                    'detail': 'Los navegadores pueden intentar inferir tipos MIME no declarados.',
                    'recommendation': 'Agregar "X-Content-Type-Options: nosniff".'
                })

            # CSP
            if 'content-security-policy' in headers:
                passed.append({'item': 'Content-Security-Policy (CSP)', 'detail': 'Directiva CSP activa'})
            else:
                score -= 15
                findings.append({
                    'severity': 'MEDIO',
                    'item': 'Falta Content-Security-Policy (CSP)',
                    'detail': 'No hay política declarada para mitigar inyecciones XSS y scripts no autorizados.',
                    'recommendation': 'Definir una cabecera CSP restrictiva alineada a las fuentes de recursos permitidas.'
                })

            # Server Version Exposure
            server_hdr = headers.get('server', '')
            if any(char.isdigit() for char in server_hdr):
                score -= 10
                findings.append({
                    'severity': 'MEDIO',
                    'item': 'Exposición de Versión del Servidor Web',
                    'detail': f'Cabecera Server expone información detallada: "{server_hdr}"',
                    'recommendation': 'Deshabilitar firmas de versión en el servidor (ej. "server_tokens off;" en Nginx).'
                })
            else:
                passed.append({'item': 'Servidor Oculta Versión', 'detail': server_hdr or 'Sin versión expuesta'})

            # X-Powered-By
            if 'x-powered-by' in headers:
                score -= 10
                findings.append({
                    'severity': 'BAJO',
                    'item': 'Exposición de Lenguaje/Framework (X-Powered-By)',
                    'detail': f'Cabecera expone la tecnología: "{headers["x-powered-by"]}"',
                    'recommendation': 'Eliminar la cabecera X-Powered-By para mitigar fingerprinting de atacantes.'
                })
            else:
                passed.append({'item': 'Tecnología Oculta (No X-Powered-By)', 'detail': 'Limpio'})

    except Exception as e:
        score -= 20
        findings.append({
            'severity': 'ALTA',
            'item': 'Error en Verificación de Cabeceras HTTP',
            'detail': str(e),
            'recommendation': 'Verificar la accesibilidad pública de la URL y configuración DNS.'
        })

    score = max(0, min(100, score))
    return {
        'url': url_str,
        'domain': domain,
        'score': score,
        'status_rating': 'EXCELENTE' if score >= 85 else ('REGULAR' if score >= 60 else 'CRÍTICO'),
        'findings': findings,
        'passed': passed,
        'scan_date': get_chile_now_str()
    }

def update_message_field(msg_id, field_name, value):
    try:
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()
        cursor.execute(f"UPDATE contact_messages SET {field_name} = ? WHERE id = ?", (value, msg_id))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"[TG-PROXY] Error actualizando {field_name}: {e}")
        return False

def run():
    server = HTTPServer(('0.0.0.0', PORT), TelegramProxyHandler)
    print(f"🔐 Telegram Proxy & Server DB API escuchando en 0.0.0.0:{PORT}...")
    server.serve_forever()

if __name__ == '__main__':
    run()

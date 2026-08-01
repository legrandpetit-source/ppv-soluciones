#!/usr/bin/env python3
"""
==============================================================================
PPV SOLUCIONES - AUTOMATIC DEPLOYMENT WEBHOOK LISTENER
==============================================================================
Servidor de auto-despliegue en segundo plano para Hetzner.
Escucha las notificaciones de GitHub (Webhook) y ejecuta `git pull origin main`
automáticamente al detectar cualquier cambio.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess
import os

PORT = 9000
REPO_DIR = '/var/www/ppvsoluciones'

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        print("🔔 Notificación de actualización recibida de GitHub.")
        try:
            # Ejecutar git pull automáticamente
            result = subprocess.run(
                ["git", "pull", "origin", "main"],
                cwd=REPO_DIR if os.path.exists(REPO_DIR) else '.',
                capture_output=True,
                text=True
            )
            print("Output Git Pull:\n", result.stdout)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "success", "message": "Auto-deploy completed successfully"}')
        except Exception as e:
            print("Error en auto-deploy:", str(e))
            self.send_response(500)
            self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b'<h1>PPV Soluciones - Auto Deploy Webhook Status: ACTIVE 🚀</h1>')

def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, WebhookHandler)
    print(f"🚀 Servidor de Auto-Despliegue escuchando en el puerto {PORT}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()

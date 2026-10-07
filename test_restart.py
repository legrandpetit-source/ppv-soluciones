import sys, os, time, threading
from http.server import HTTPServer, BaseHTTPRequestHandler

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"OK")
        
        def restart(server):
            time.sleep(1)
            server.server_close()
            print("Restarting...")
            os.execv(sys.executable, ['python3', sys.argv[0]])
            
        threading.Thread(target=restart, args=(self.server,)).start()

if __name__ == '__main__':
    print("Started!")
    server = HTTPServer(('0.0.0.0', 8081), Handler)
    server.serve_forever()

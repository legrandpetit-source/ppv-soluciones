import subprocess

nginx_conf = """server {
    listen 80;
    listen [::]:80;
    server_name localhost;
    server_tokens off;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:;" always;

    location ~ ^/tg- {
        proxy_pass http://10.0.0.1:9001;
        proxy_read_timeout 30s;
        client_max_body_size 25M;
    }

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html { root /usr/share/nginx/html; }
}
"""

with open('/tmp/nginx_default.conf', 'w') as f:
    f.write(nginx_conf)

subprocess.run(['docker', 'cp', '/tmp/nginx_default.conf', 'ppv-soluciones:/etc/nginx/conf.d/default.conf'])
res = subprocess.run(['docker', 'exec', 'ppv-soluciones', 'nginx', '-s', 'reload'], capture_output=True, text=True)
print("NGINX RELOAD RESULT:", res.stdout, res.stderr)

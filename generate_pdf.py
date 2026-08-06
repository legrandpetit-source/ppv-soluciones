#!/usr/bin/env python3
"""
PPV SOLUCIONES - DOCUMENT & PDF GENERATOR
Convierte reportes Markdown y cartas legales a archivos PDF de alta calidad
y los guarda en /home/patricio/Documentos/informes_ppv y /home/patricio/Escritorio.
"""

import os
import subprocess
import html
import re

OUTPUT_DIRS = [
    '/home/patricio/Documentos/informes_ppv',
    '/home/patricio/Escritorio'
]

def markdown_to_html(md_content, title="Informe PPV Soluciones"):
    # Convert basic markdown formatting to HTML
    lines = md_content.split('\n')
    html_lines = []
    in_table = False
    table_rows = []

    for line in lines:
        line_str = line.strip()
        if line_str.startswith('# '):
            html_lines.append(f'<h1>{html.escape(line_str[2:])}</h1>')
        elif line_str.startswith('## '):
            html_lines.append(f'<h2>{html.escape(line_str[3:])}</h2>')
        elif line_str.startswith('### '):
            html_lines.append(f'<h3>{html.escape(line_str[4:])}</h3>')
        elif line_str.startswith('#### '):
            html_lines.append(f'<h4>{html.escape(line_str[5:])}</h4>')
        elif line_str.startswith('- '):
            html_lines.append(f'<li>{html.escape(line_str[2:])}</li>')
        elif line_str.startswith('|'):
            # Table row
            cells = [c.strip() for c in line_str.split('|')[1:-1]]
            if not cells or all(c.startswith('-') for c in cells):
                continue
            table_rows.append(cells)
        else:
            if table_rows:
                # Render accumulated table
                table_html = '<table class="pdf-table"><thead><tr>'
                table_html += ''.join(f'<th>{html.escape(c)}</th>' for c in table_rows[0])
                table_html += '</tr></thead><tbody>'
                for row in table_rows[1:]:
                    table_html += '<tr>' + ''.join(f'<td>{html.escape(c)}</td>' for c in row) + '</tr>'
                table_html += 'tbody></table>'
                html_lines.append(table_html)
                table_rows = []
            
            if line_str == '---':
                html_lines.append('<hr>')
            elif line_str:
                # Inline bold & code
                txt = html.escape(line_str)
                txt = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', txt)
                txt = re.sub(r'\*(.*?)\*', r'<em>\1</em>', txt)
                txt = re.sub(r'`(.*?)`', r'<code>\1</code>', txt)
                html_lines.append(f'<p>{txt}</p>')

    if table_rows:
        table_html = '<table class="pdf-table"><thead><tr>'
        table_html += ''.join(f'<th>{html.escape(c)}</th>' for c in table_rows[0])
        table_html += '</tr></thead><tbody>'
        for row in table_rows[1:]:
            table_html += '<tr>' + ''.join(f'<td>{html.escape(c)}</td>' for c in row) + '</tr>'
        table_html += '</tbody></table>'
        html_lines.append(table_html)

    body_content = '\n'.join(html_lines)

    html_document = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{html.escape(title)}</title>
    <style>
        @page {{
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
        }}
        body {{
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1a1e29;
            background: #ffffff;
            line-height: 1.6;
            font-size: 13px;
            margin: 0;
            padding: 20px;
        }}
        .header-bar {{
            border-bottom: 3px solid #00f3ff;
            padding-bottom: 12px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .header-title {{
            font-size: 20px;
            font-weight: bold;
            color: #07090e;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .header-subtitle {{
            font-size: 11px;
            color: #666;
            text-align: right;
        }}
        h1 {{
            font-size: 22px;
            color: #0d111a;
            border-bottom: 2px solid #00f3ff;
            padding-bottom: 6px;
            margin-top: 15px;
            margin-bottom: 15px;
        }}
        h2 {{
            font-size: 16px;
            color: #7000ff;
            margin-top: 20px;
            margin-bottom: 10px;
        }}
        h3 {{
            font-size: 14px;
            color: #0088cc;
            margin-top: 15px;
            margin-bottom: 8px;
        }}
        p {{
            margin-bottom: 10px;
            color: #333333;
        }}
        ul, ol {{
            margin-top: 5px;
            margin-bottom: 15px;
            padding-left: 20px;
        }}
        li {{
            margin-bottom: 4px;
        }}
        code {{
            background: #f4f5f8;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            color: #d63384;
        }}
        .pdf-table {{
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 12px;
        }}
        .pdf-table th {{
            background: #0d111a;
            color: #00f3ff;
            text-align: left;
            padding: 8px 12px;
            font-weight: 600;
        }}
        .pdf-table td {{
            border: 1px solid #e1e4eb;
            padding: 8px 12px;
        }}
        .pdf-table tr:nth-child(even) {{
            background: #f8f9fa;
        }}
        .footer-bar {{
            margin-top: 40px;
            border-top: 1px solid #e1e4eb;
            padding-top: 12px;
            font-size: 10px;
            color: #888;
            text-align: center;
        }}
        hr {{
            border: none;
            border-top: 1px solid #e1e4eb;
            margin: 20px 0;
        }}
    </style>
</head>
<body>
    <div class="header-bar">
        <div>
            <div class="header-title">PPV SOLUCIONES</div>
            <div style="font-size: 11px; color: #555; font-weight: 600;">Patricio Padilla — CEO & Fundador</div>
        </div>
        <div class="header-subtitle">
            <strong>Contacto:</strong> contacto@ppvsoluciones.cl<br>
            <strong>Web:</strong> https://ppvsoluciones.cl
        </div>
    </div>

    {body_content}

    <div class="footer-bar">
        PPV Soluciones — Automatización, Ciberseguridad & Resguardo Digital | Patricio Padilla (CEO & Fundador)
    </div>
</body>
</html>"""
    return html_document

import shutil

def find_chrome_executable():
    candidates = [
        'google-chrome',
        'google-chrome-stable',
        'chromium-browser',
        'chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome'
    ]
    for candidate in candidates:
        path = shutil.which(candidate) or (candidate if os.path.exists(candidate) else None)
        if path:
            return path
    raise FileNotFoundError("No se encontró ejecutable de Chrome/Chromium para compilar PDF.")

def save_pdf(md_content, filename_base, title="Documento PPV", domain=None):
    html_content = markdown_to_html(md_content, title)
    
    # Detect if we are inside the Docker container
    is_container = os.path.exists('/.dockerenv')
    
    output_base_dirs = [
        '/home/patricio/Escritorio/Auditoría',
        '/home/patricio/Desktop/Auditoría',
        '/home/patricio/Documentos/informes_ppv'
    ]
    
    created_pdfs = []
    
    if is_container:
        tmp_html = f"/tmp/{filename_base}.html"
        with open(tmp_html, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        chrome_bin = find_chrome_executable()
        for base_dir in output_base_dirs:
            target_dir = os.path.join(base_dir, domain) if domain else base_dir
            os.makedirs(target_dir, exist_ok=True)
            pdf_path = os.path.join(target_dir, f"{filename_base}.pdf")
            
            cmd = [
                chrome_bin,
                '--headless',
                '--disable-gpu',
                '--no-sandbox',
                f'--print-to-pdf={pdf_path}',
                f'file://{tmp_html}'
            ]
            res = subprocess.run(cmd, capture_output=True, text=True)
            if os.path.exists(pdf_path):
                created_pdfs.append(pdf_path)
                print(f"✅ PDF Creado con {chrome_bin}: {pdf_path} ({os.path.getsize(pdf_path)} bytes)")
            else:
                print(f"❌ Error creando PDF en {pdf_path}: {res.stderr}")
    else:
        # We are on the host VPS.
        # Write the HTML inside the shared folder (/var/www/ppvsoluciones/)
        shared_html_path = f"/var/www/ppvsoluciones/{filename_base}.html"
        shared_pdf_path = f"/var/www/ppvsoluciones/{filename_base}.pdf"
        
        with open(shared_html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        # Compile it inside the container 'ppv-soluciones' where Chromium works perfectly
        # The container reads the file at /usr/share/nginx/html/{filename_base}.html
        # and writes the PDF output to /usr/share/nginx/html/{filename_base}.pdf
        cmd = [
            'docker', 'exec', 'ppv-soluciones',
            '/usr/bin/chromium',
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            f'--print-to-pdf=/usr/share/nginx/html/{filename_base}.pdf',
            f'file:///usr/share/nginx/html/{filename_base}.html'
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        
        # Once compiled inside the container, the PDF is visible on the host at shared_pdf_path
        if os.path.exists(shared_pdf_path):
            for base_dir in output_base_dirs:
                target_dir = os.path.join(base_dir, domain) if domain else base_dir
                os.makedirs(target_dir, exist_ok=True)
                pdf_path = os.path.join(target_dir, f"{filename_base}.pdf")
                
                # Copy from the shared folder to the target directory
                shutil.copy2(shared_pdf_path, pdf_path)
                if os.path.exists(pdf_path):
                    created_pdfs.append(pdf_path)
                    print(f"✅ PDF Creado (vía docker container): {pdf_path} ({os.path.getsize(pdf_path)} bytes)")
            
            # Clean up the temporary shared files
            try:
                os.remove(shared_html_path)
                os.remove(shared_pdf_path)
            except Exception:
                pass
        else:
            print(f"❌ Error compilando PDF vía docker exec: {res.stderr}")
            
    return created_pdfs

def generate_client_authorization_pdf(client_name, rut, domain, contact_person, email, plan_tier="$450 USD"):
    from datetime import datetime
    date_str = datetime.now().strftime('%d/%m/%Y')
    clean_domain = domain.replace('https://', '').replace('http://', '').strip('/')
    
    md_content = f"""# 📜 Carta de Autorización & Exención de Responsabilidad Legal
**Servicio de Auditoría de Ciberseguridad & Hardening Web**  
**PPV Soluciones** — https://ppvsoluciones.cl  

---

## 📄 ANTECEDENTES Y DECLARACIÓN JURADA

Por medio del presente documento, el Solicitante identificado a continuación declara bajo su exclusiva responsabilidad contar con las facultades legales, de propiedad o de representación sobre la infraestructura y dominio web indicado.

### 1. Identificación del Solicitante y Sitio Web
* **Nombre / Razón Social del Cliente:** {client_name}
* **RUT / Identificación Fiscal:** {rut}
* **Dominio / URL del Sitio Web a Auditar:** {clean_domain}
* **Representante Legal / Contacto Autorizado:** {contact_person}
* **Correo Electrónico de Contacto:** {email}
* **Servicio & Plan Requerido:** {plan_tier}
* **Fecha de Emisión:** {date_str}

---

## ⚖️ CLÁUSULAS DE AUTORIZACIÓN Y ALCANCE

### Primera: Autorización Explícita de Análisis y Hardening
El Solicitante autoriza de manera explícita e irrevocable al equipo técnico de **PPV Soluciones** (representado por Patricio Padilla, CEO & Fundador) a realizar pruebas de diagnóstico, evaluación de cabeceras, revisión de código fuente visible, mitigación de vulnerabilidades y hardening de servidor sobre la infraestructura del sitio web señalado, en conformidad con la **Ley N° 21.459 que Establece Normas sobre Delitos Informáticos en Chile**.

### Segunda: Propósito Exclusivo de Diagnóstico y Remediación
Las pruebas y correcciones realizadas tienen como único fin identificar fallos de configuración, exposición no autorizada de credenciales/tokens y brechas de seguridad para su posterior mitigación. En ningún caso se realizará extracción, alteración, filtración o destrucción de datos de la empresa o sus usuarios.

### Tercera: Declaración de Propiedad y Exención de Responsabilidad
El Solicitante declara formalmente ser el propietario legítimo del dominio o poseer el mandato escrito del titular para encomendar esta auditoría. En consecuencia, el Solicitante exime a **PPV Soluciones** de cualquier reclamo de terceros derivado de la falta de representatividad o autorización previa sobre la infraestructura evaluada.

### Cuarta: Confidencialidad de la Información
Toda la información obtenida durante la auditoría, incluidos los hallazgos técnicos, vectores de vulnerabilidad y datos de credenciales, será tratada con estricta reserva bajo secreto profesional y entregada únicamente al contacto autorizado designado en este documento.

### Quinta: Documentación Anexa Requerida (Cédula de Identidad / Pasaporte)
Para la plena efectividad jurídica de este resguardo en conformidad con la **Ley N° 21.459 (Delitos Informáticos)** y la **Ley N° 19.628 (Protección de Datos Personales)**, el Solicitante adjunta a este documento copia legible por ambos lados de la **Cédula de Identidad o Pasaporte vigente** del otorgante. Dicho respaldo se resguardará de forma encriptada y confidencial exclusivamente para verificación fehaciente de identidad y personería.

---

## ✍️ FIRMAS Y CONFORMIDAD DE LAS PARTES

| SOLICITANTE / CLIENTE | EMISOR / PPV SOLUCIONES |
|---|---|
| **{client_name}** | **Patricio Padilla** |
| **Firma Representante Autorizado:** {contact_person} | **CEO & Fundador — PPV Soluciones** |
| **RUT:** {rut} | **Correo:** contacto@ppvsoluciones.cl |
| **Adjunto:** Cédula de Identidad / Pasaporte Verificado | **Web:** https://ppvsoluciones.cl |
| **Dominio Autorizado:** {clean_domain} | **Fecha:** {date_str} |
"""
    return save_pdf(md_content, 'carta_autorizacion_seguridad', f'Carta de Autorización Legal - {clean_domain}', domain=clean_domain)

def generate_client_audit_report_pdf(client_name, domain, plan_tier="$450 USD"):
    from datetime import datetime
    date_str = datetime.now().strftime('%d/%m/%Y')
    clean_domain = domain.replace('https://', '').replace('http://', '').strip('/')
    
    md_content = f"""# 🛡️ Informe de Diagnóstico & Ciberseguridad Web
**Cliente / Dominio:** {clean_domain}  
**Fecha de Evaluación:** {date_str}  
**Plan:** {plan_tier}  
**Emisor:** PPV Soluciones (contacto@ppvsoluciones.cl)  

---

## 📊 RESUMEN EJECUTIVO

El presente informe consolida el diagnóstico de ciberseguridad, evaluación de vulnerabilidades y recomendaciones de *hardening* para la infraestructura web de **{client_name}** (`{clean_domain}`).

---

## 🔍 MATRIZ DE VERIFICACIÓN DE SEGURIDAD (CHECKLIST)

### 1. Protección de Credenciales & Tokens API (Crítico)
* **Estado:** Verificado / En Revisión
* **Evaluación:** Inspección de scripts clientes para garantizar el ocultamiento de tokens de WhatsApp, Telegram y claves de base de datos a través de proxies backend en servidor.

### 2. Cabeceras de Seguridad HTTP & Servidor (Alto)
* **Estado:** Verificado / En Configuración
* **Evaluación:** Implementación de `Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff` y `HSTS`.

### 3. Formularios, Anti-Spam & Rate Limiting (Alto)
* **Estado:** Protegido
* **Evaluación:** Validación de campos, límites de longitud (`maxlength`), cooldowns anti-flood y sanitización `escapeHtml`.

### 4. Autenticación & Hashes Criptográficos (Alto)
* **Estado:** SHA-256 Activo
* **Evaluación:** Sustitución de contraseñas plano por algoritmos de hash SHA-256.

### 5. Cifrado SSL/TLS & HTTPS (Medio)
* **Estado:** Activo 256-bit
* **Evaluación:** Redirección automática HTTPS y certificados SSL de alta resistencia.

---

## ✍️ APROBACIÓN Y EMISIÓN

**Patricio Padilla — CEO & Fundador**  
PPV Soluciones | contacto@ppvsoluciones.cl | https://ppvsoluciones.cl
"""
    file_prefix = clean_domain.replace(".", "_")
    return save_pdf(md_content, f'{file_prefix}_security_report', f'Informe de Seguridad - {clean_domain}', domain=clean_domain)

def get_executive_summary_markdown(client_name, company_name, phone, email="", domain="", plan_tier="$450 USD"):
    from datetime import datetime
    date_str = datetime.now().strftime('%d/%m/%Y')
    clean_domain = domain.replace('https://', '').replace('http://', '').strip('/') if domain else 'N/A'
    c_name = client_name or "Cliente Estimado"
    comp_name = company_name or "Empresa"
    p_phone = phone or "No especificado"
    e_mail = email or "contacto@empresa.cl"
    
    md_content = f"""# 🚀 RESUMEN EJECUTIVO & PRESENTACIÓN COMERCIAL
**PPV Soluciones — Servicios Profesionales de Ciberseguridad & Desarrollo Web**  
**Sitio Oficial:** https://ppvsoluciones.cl | **Contacto:** contacto@ppvsoluciones.cl | **Fecha:** {date_str}  

---

## 📋 FICHA DE PRESENTACIÓN PARA EL CLIENTE

* **Nombre de Contacto:** {c_name}
* **Empresa / Razón Social:** {comp_name}
* **Teléfono de Contacto:** {p_phone}
* **Correo Electrónico:** {e_mail}
* **Dominio / Infraestructura Evaluada:** {clean_domain}
* **Propuesta / Plan Seleccionado:** {plan_tier}

---

## 🎯 PROPUESTA DE VALOR & OBJETIVOS ESTRATÉGICOS

En **PPV Soluciones**, brindamos soluciones integrales de ciberseguridad, hardening de servidores, mitigación de vulnerabilidades y desarrollo web de alta performance. Nuestra misión es garantizar que la presencia digital e infraestructura de **{comp_name}** opere bajo los más altos estándares internacionales de disponibilidad, confidencialidad e integridad.

### 🛡️ 1. Auditoría & Ciberseguridad Defensiva (Ley 21.459)
* **Diagnóstico de Vulnerabilidades:** Análisis profundo contra inyecciones SQL/XSS, credenciales expuestas y fallos de lógica.
* **Hardening Servidores & Web:** Configuración de cabeceras HTTP defensivas (`CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`).
* **Protección Backend & Proxies:** Ocultamiento de tokens de API (Telegram/WhatsApp/Base de Datos) tras proxies seguros.
* **Mitigación Anti-Spam & Rate Limiting:** Control de concurrencia y prevención contra ataques de denegación de servicio (DDoS) o flood en formularios.

### ⚡ 2. Optimización de Performance & SEO Técnico
* **Tiempo de Carga & Core Web Vitals:** Optimización LCP e INP para maximizar la velocidad y experiencia de usuario.
* **Arquitectura Resiliente:** Infraestructura contenerizada y limpia de código redundante.
* **Monitoreo & Logs Activos:** Trazabilidad completa de accesos y eventos de seguridad.

---

## 📊 COMPARATIVA DE PLANES DE SERVICIO

| Característica / Cobertura | Nivel 1 — Diagnóstico PDF ($200 USD) | Nivel 2 — Hardening Total ($450 USD) [Recomendado] |
|---|---|---|
| **Escaneo de Vulnerabilidades** | ✅ Incluido | ✅ Incluido |
| **Informe Ejecutivo & Certificado** | ✅ Incluido | ✅ Incluido |
| **Implementación de Parches & Code Fixes** | ❌ No incluye | ✅ Incluido (Manos a la obra) |
| **Configuración de Headers HTTP & Proxy** | ❌ No incluye | ✅ Incluido |
| **Protección Anti-Spam & Rate Limiting** | ❌ No incluye | ✅ Incluido |
| **Garantía & Soporte Pos-Entrega** | 7 Días | 30 Días |
| **Tiempo de Entrega** | 48 Horas | 4 Días Hábiles |

---

## ✍️ ACEPTACIÓN Y CONTACTO DIRECTO

Para dar inicio a la auditoría e implementación de mejoras de ciberseguridad para **{comp_name}**, puede contactarnos directamente a través de nuestros canales oficiales:

* **Representante PPV Soluciones:** Patricio Padilla — CEO & Fundador
* **Correo Directo:** contacto@ppvsoluciones.cl
* **WhatsApp / Teléfono Directo:** +56 9 8623 9706
* **Sitio Web & Consola Admin:** https://ppvsoluciones.cl
"""
    return md_content

def generate_executive_summary_pdf(client_name, company_name, phone, email="", domain="", plan_tier="$450 USD", custom_markdown=None):
    if custom_markdown and custom_markdown.strip():
        md_content = custom_markdown
    else:
        md_content = get_executive_summary_markdown(client_name, company_name, phone, email, domain, plan_tier)
        
    comp_clean = (company_name or client_name or "cliente").replace(" ", "_").lower()
    clean_domain = domain.replace('https://', '').replace('http://', '').strip('/') if domain else None
    
    return save_pdf(
        md_content,
        f'resumen_ejecutivo_{comp_clean}',
        f'Resumen Ejecutivo - {company_name or client_name}',
        domain=clean_domain
    )

if __name__ == '__main__':
    print("PDF Generator Script Listo.")


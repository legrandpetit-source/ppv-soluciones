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

def save_pdf(md_content, filename_base, title="Documento PPV", domain=None):
    html_content = markdown_to_html(md_content, title)
    tmp_html = f"/tmp/{filename_base}.html"
    
    with open(tmp_html, 'w', encoding='utf-8') as f:
        f.write(html_content)

    output_base_dirs = [
        '/home/patricio/Escritorio/Auditoría',
        '/home/patricio/Desktop/Auditoría',
        '/home/patricio/Documentos/informes_ppv'
    ]

    created_pdfs = []
    for base_dir in output_base_dirs:
        target_dir = os.path.join(base_dir, domain) if domain else base_dir
        os.makedirs(target_dir, exist_ok=True)
        pdf_path = os.path.join(target_dir, f"{filename_base}.pdf")
        
        # Convert to PDF via headless Google Chrome
        cmd = [
            'google-chrome',
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            f'--print-to-pdf={pdf_path}',
            f'file://{tmp_html}'
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if os.path.exists(pdf_path):
            created_pdfs.append(pdf_path)
            print(f"✅ PDF Creado: {pdf_path} ({os.path.getsize(pdf_path)} bytes)")
        else:
            print(f"❌ Error creando PDF en {pdf_path}: {res.stderr}")

    return created_pdfs

if __name__ == '__main__':
    # Test script execution
    print("PDF Generator Script Listo.")

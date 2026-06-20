from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, unquote
from zipfile import ZipFile
from xml.etree import ElementTree as ET
import json
import os
import posixpath
import re

ROOT = Path(__file__).resolve().parent
UPLOADS = ROOT / "uploads"
UPLOADS.mkdir(exist_ok=True)

def local_name(tag):
    return tag.rsplit("}", 1)[-1]

def cell_text(cell, shared):
    cell_type = cell.attrib.get("t", "")
    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.iter() if local_name(node.tag) == "t")
    value = next((node.text or "" for node in cell if local_name(node.tag) == "v"), "")
    if cell_type == "s" and value:
        try:
            return shared[int(value)]
        except (ValueError, IndexError):
            return value
    if cell_type == "b":
        return value == "1"
    try:
        return float(value) if "." in value else int(value)
    except (ValueError, TypeError):
        return value

def column_index(reference):
    letters = "".join(ch for ch in reference if ch.isalpha())
    result = 0
    for char in letters:
        result = result * 26 + ord(char.upper()) - 64
    return result - 1

def parse_xlsx(data):
    from io import BytesIO
    with ZipFile(BytesIO(data)) as book:
        shared = []
        if "xl/sharedStrings.xml" in book.namelist():
            root = ET.fromstring(book.read("xl/sharedStrings.xml"))
            shared = ["".join(node.text or "" for node in item.iter() if local_name(node.tag) == "t")
                      for item in root if local_name(item.tag) == "si"]

        workbook = ET.fromstring(book.read("xl/workbook.xml"))
        sheet_node = next(node for node in workbook.iter() if local_name(node.tag) == "sheet")
        relation_id = next(value for key, value in sheet_node.attrib.items() if key.endswith("}id") or key == "r:id")
        rels = ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))
        target = next(node.attrib["Target"] for node in rels if node.attrib.get("Id") == relation_id)
        sheet_path = posixpath.normpath(posixpath.join("xl", target)).lstrip("/")
        sheet = ET.fromstring(book.read(sheet_path))

        matrix = []
        for row in (node for node in sheet.iter() if local_name(node.tag) == "row"):
            values = {}
            for cell in (node for node in row if local_name(node.tag) == "c"):
                values[column_index(cell.attrib.get("r", "A1"))] = cell_text(cell, shared)
            if values:
                width = max(values) + 1
                matrix.append([values.get(i, "") for i in range(width)])
        if not matrix:
            return []
        headers = [str(value).strip() for value in matrix[0]]
        return [{headers[i]: row[i] if i < len(row) else "" for i in range(len(headers))}
                for row in matrix[1:] if any(str(value).strip() for value in row)]

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Filename")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def translate_path(self, path):
        clean = urlparse(path).path.lstrip("/")
        return str(ROOT / clean)

    def do_POST(self):
        if self.path == "/api/upload-document":
            try:
                size = int(self.headers.get("Content-Length", "0"))
                if size <= 0:
                    raise ValueError("O arquivo está vazio.")
                if size > 50 * 1024 * 1024:
                    raise ValueError("O arquivo excede o limite de 50 MB.")
                original = unquote(self.headers.get("X-Filename", "documento"))
                safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", original).strip("._") or "documento"
                stem = Path(safe_name).stem[:80]
                suffix = Path(safe_name).suffix[:12]
                candidate = UPLOADS / f"{stem}{suffix}"
                counter = 1
                while candidate.exists():
                    candidate = UPLOADS / f"{stem}_{counter}{suffix}"
                    counter += 1
                candidate.write_bytes(self.rfile.read(size))
                payload = json.dumps({
                    "url": f"/uploads/{candidate.name}",
                    "name": original,
                }, ensure_ascii=False).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
            except Exception as exc:
                payload = json.dumps({"error": str(exc)}, ensure_ascii=False).encode("utf-8")
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
            return
        if self.path != "/api/import-xlsx":
            self.send_error(404)
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
            data = self.rfile.read(size)
            rows = parse_xlsx(data)
            payload = json.dumps({"rows": rows}, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except Exception as exc:
            payload = json.dumps({"error": str(exc)}, ensure_ascii=False).encode("utf-8")
            self.send_response(400)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

if __name__ == "__main__":
    os.chdir(ROOT)
    print("Dashboard disponível em http://127.0.0.1:4173")
    ThreadingHTTPServer(("127.0.0.1", 4173), Handler).serve_forever()

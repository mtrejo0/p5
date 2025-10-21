import http.server
import socketserver
import os

PORT = int(os.environ.get('PORT', 8000))

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()

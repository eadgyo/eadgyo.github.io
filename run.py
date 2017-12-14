#!/usr/bin/python
# -*- coding: latin-1 -*-
                    # Ces deux ensembles sont disponibles à l'installation de Python
## Python 3 :
import http.server
import socketserver

PORT=8888
# Serveur http de base delivrant le contenu du repertoire courant via le port indique.
## Python 3 :
Handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("",PORT), Handler)
print("à l'écoute sur le port :", PORT)
httpd.serve_forever()

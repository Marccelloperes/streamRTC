from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

# Rota para a página principal
@app.route('/')
def index():
    return render_template('index.html')  # Um arquivo HTML para a interface do usuário

# Evento de conexão de WebSocket
@socketio.on('connect')
def handle_connect():
    print('Client connected')

# Evento de sinalização
@socketio.on('signal')
def handle_signal(data):
    print('Signal data received:', data)
    # Reenviar a mensagem para todos os outros clientes conectados
    emit('signal', data, broadcast=True, include_self=False)

# Evento de desconexão
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

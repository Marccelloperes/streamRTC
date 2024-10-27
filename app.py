from flask import Flask, render_template
from flask_socketio import SocketIO, emit

# Inicializa o app Flask e o SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Rota principal para servir a página HTML
@app.route('/')
def index():
    return render_template('index.html')  # Certifique-se de que o arquivo index.html está na pasta 'templates'

# Evento de conexão do WebSocket
@socketio.on('connect')
def handle_connect():
    print('Cliente conectado')

# Evento para receber e repassar mensagens de sinalização
@socketio.on('signal')
def handle_signal(data):
    print('Dados de sinal recebidos:', data)
    # Reenviar os dados de sinalização para todos os outros clientes conectados
    emit('signal', data, broadcast=True, include_self=False)

# Evento para tratar desconexões de clientes
@socketio.on('disconnect')
def handle_disconnect():
    print('Cliente desconectado')

# Inicia o servidor
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

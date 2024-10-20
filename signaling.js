let socket = new WebSocket('ws://localhost:8080');

// Função para enviar mensagens de sinalização
function sendSignal(message) {
    socket.send(JSON.stringify(message));
}

socket.onmessage = function(event) {
    const message = JSON.parse(event.data);
    if (message.type === 'offer') {
        handleOffer(message.sdp);
    } else if (message.type === 'answer') {
        handleAnswer(message.sdp);
    } else if (message.type === 'candidate') {
        addIceCandidate(message.candidate);
    }
};

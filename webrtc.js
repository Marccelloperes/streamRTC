let peerConnection;

function createPeerConnection() {
    peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            {
                urls: 'turns:195.35.43.219:3478', // Utilize HTTPS com TURN para segurança
                username: 'turnUser123', // Substitua pelo usuário configurado no TURN
                credential: 'StrongP@ssw0rd!'  // Substitua pela senha configurada no TURN
            }
        ]
    });

    // Trocar candidatos ICE
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            sendSignal({
                type: 'candidate',
                candidate: event.candidate
            });
        }
    };

    // Receber o vídeo remoto
    peerConnection.ontrack = event => {
        const remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.srcObject = event.streams[0];
    };
}

async function makeOffer(localStream) {
    createPeerConnection();

    // Adicionar as trilhas de mídia local
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    sendSignal({
        type: 'offer',
        sdp: peerConnection.localDescription
    });
}

async function handleOffer(sdp) {
    createPeerConnection();
    await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    sendSignal({
        type: 'answer',
        sdp: peerConnection.localDescription
    });
}

async function handleAnswer(sdp) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
}

function addIceCandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

// Função para enviar sinalização via WebSocket (exemplo genérico)
function sendSignal(data) {
    const socket = io.connect('wss://makerlab.uno'); // Certifique-se de usar WebSocket seguro
    socket.emit('signal', data);
}

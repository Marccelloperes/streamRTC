let peerConnection;

function createPeerConnection() {
    peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            {
                urls: 'turn:195.35.43.219:3478', // Substitua pelo IP do seu servidor TURN
                username: 'seu_usuario', // Substitua pelo usuário configurado no TURN
                credential: 'sua_senha'  // Substitua pela senha configurada no TURN
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
        document.getElementById('remoteVideo').srcObject = event.streams[0];
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

async function startWebcam() {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        document.getElementById('localVideo').srcObject = mediaStream;
        return mediaStream;
    } catch (err) {
        console.error('Erro ao acessar a webcam: ', err);
    }
}

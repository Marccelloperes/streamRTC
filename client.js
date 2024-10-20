async function call() {
     const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
     pc = new RTCPeerConnection(config);
 
     localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
 
     pc.onicecandidate = event => {
         if (event.candidate) {
             console.log('ICE Candidate:', event.candidate);
         }
     };
 
     pc.ontrack = event => {
         remoteVideo.srcObject = event.streams[0];
     };
 
     const offer = await pc.createOffer();
     await pc.setLocalDescription(offer);
 
     const response = await fetch('/offer', {
         method: 'POST',
         body: JSON.stringify({
             sdp: pc.localDescription.sdp,
             type: pc.localDescription.type
         }),
         headers: { 'Content-Type': 'application/json' }
     });
 
     const answer = await response.json();
     await pc.setRemoteDescription(new RTCSessionDescription(answer));
 }
 
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const ws = new WebSocket("ws://localhost:8000");
const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
});

// Gérer les flux entrants/sortants
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    });

peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
};

// Échange des offres SDP et ICE
peerConnection.onicecandidate = event => {
    if (event.candidate) {
        ws.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
    }
};

ws.onmessage = async (message) => {
    const data = JSON.parse(message.data);

    if (data.type === "offer") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: "answer", answer }));
    } else if (data.type === "answer") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.type === "candidate") {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
};

// Émettre une offre SDP
async function makeCall() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: "offer", offer }));
}

// Démarrer l'appel après quelques secondes (simulé)
setTimeout(makeCall, 3000);

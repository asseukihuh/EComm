const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

// Créer la connexion WebRTC
const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]  // Serveur STUN
});

// Créer la connexion WebSocket
const ws = new WebSocket("ws://localhost:8000");

let s;

// Gérer la capture du flux vidéo local
function connection(){

    navigator.mediaDevices.getUserMedia({ 
        video: { width: 1024, height: 576 },
        audio: true 
    })
    .then(stream => {
        s = stream;
        // Afficher le flux local dans l'élément vidéo
        localVideo.srcObject = stream;

        // Ajouter les pistes à la connexion WebRTC .
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream)); 
    })
    .catch(error => {
        console.error("Erreur lors de la capture vidéo/audio :", error);
    });
}

function appeler(){
    makeCall();
}

function deconnect(){
    s.getTracks().forEach(function(track) {
        track.stop();
    });
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    ws.send(JSON.stringify({ type: "deconnect"}));
    console.log("fin de l'appel")
}

// Événement pour gérer le flux vidéo entrant
peerConnection.ontrack = event => {
    if (event.track.kind === "video") {
        remoteVideo.srcObject = event.streams[0];  // Affiche le flux vidéo distant dans l'élément vidéo distant
    }
};


peerConnection.onicecandidate = event => {
    if (event.candidate) {
        ws.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
    }
};

// Fonction pour gérer les messages WebSocket
ws.onmessage = async (message) => {

    let data;
    if (message.data instanceof Blob) {
        const text = await message.data.text();  // Convertir le Blob en texte
        data = JSON.parse(text);
    } else {
        data = JSON.parse(message.data);
    }


    console.log(data);

    if (data.type === "offer") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        ws.send(JSON.stringify({ type: "answer", answer }));
    } else if (data.type === "answer") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.type === "candidate") {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else if (data.type === "deconnect") {
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;
    }
};


// Fonction SDP
async function makeCall() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: "offer", offer }));
}

//setTimeout(makeCall, 3000);

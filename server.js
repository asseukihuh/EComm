const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocketServer({ server });

let clients = [];

wss.on("connection", (ws) => {
    // Ajouter le client à la liste des clients connectés 
    clients.push(ws);

    ws.on("message", (message) => {
        try {
            const parsedMessage = JSON.parse(message);

            clients.forEach(client => {
                if (client !== ws && client.readyState === client.OPEN) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        } catch (error) {
            console.error("Erreur lors du traitement du message WebSocket:", error);
        }
    });

    ws.on("close", () => {
        // Retirer client
        clients = clients.filter(client => client !== ws);
    });
});

app.use(express.static("public"));

server.listen(8000, () => {
    console.log("Serveur WebRTC en ligne sur http://localhost:8000");
});

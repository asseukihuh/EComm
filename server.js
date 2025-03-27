const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocketServer({ server });

let clients = [];

wss.on("connection", (ws) => {
    clients.push(ws);

    ws.on("message", (message) => {
        // Transmet le message à tous les autres clients
        clients.forEach(client => {
            if (client !== ws && client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on("close", () => {
        clients = clients.filter(client => client !== ws);
    });
});

app.use(express.static("public"));

server.listen(8000, () => {
    console.log("Serveur WebRTC en ligne sur http://localhost:8000");
});

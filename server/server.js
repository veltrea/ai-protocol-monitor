import { WebSocketServer } from 'ws';

const port = 5175;
const wss = new WebSocketServer({ port, host: '127.0.0.1' });

console.log(`AI Protocol WebSocket Server started on ws://localhost:${port}`);

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (data) => {
        // Broadcast to all connected clients
        const message = data.toString();
        // console.log('Received:', message);

        wss.clients.forEach((client) => {
            if (client.readyState === 1) { // 1 = OPEN
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

import * as net from 'net';
import { log } from './logging';

const HEALTH_CHECK_PORT = 8080;

// This enables fly.io to do health checks verifying that the bot is running
export function startHealthCheckServer() {
    const server = net.createServer((socket) => {
        socket.end('goodbye\n');
    });
    
    server.on('error', (err) => {
        log('health check server: error ', err);
    });
      
    server.listen(HEALTH_CHECK_PORT, () => {
        log('health check server: listening on', server.address());
    });

    server.on('connection', function(socket) {
        log('health check server: client opened connection');

        socket.write('Hello, fly.io!');

        socket.on('data', function(chunk) {
            log('health check server: received data:', chunk.toString());
        });

        socket.on('end', function() {
            log('health check server: client closed connection');
        });

        socket.on('error', function(err) {
            log('health check server: connection.error:', err);
        });
    });

    return server;
}

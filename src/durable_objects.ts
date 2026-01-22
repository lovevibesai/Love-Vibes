/**
 * Durable Objects: ChatRoom
 * Handles Real-time WebSocket Messaging for a Match
 */
import { Env } from './index';

export class ChatRoom {
    state: DurableObjectState;
    sessions: WebSocket[];
    env: Env;
    lastActive: number;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
        this.sessions = [];
        this.lastActive = Date.now();

        // Auto-hibernate after 30s of inactivity to save costs
        void (this.state as any).setAlarm(Date.now() + 30 * 1000);
    }

    async alarm() {
        if (Date.now() - this.lastActive >= 30 * 1000) {
            // Close all sessions and hibernate
            this.sessions.forEach(s => s.close(1001, "Hibernating due to inactivity"));
            this.sessions = [];
        } else {
            // Check again later
            void (this.state as any).setAlarm(Date.now() + 15 * 1000);
        }
    }

    async fetch(request: Request) {
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
            return new Response('Expected Upgrade: websocket', { status: 426 });
        }

        const userId = new URL(request.url).searchParams.get('user_id');
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        await this.handleSession(server, userId);

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    async handleSession(webSocket: WebSocket, userId: string | null) {
        webSocket.accept();
        this.sessions.push(webSocket);

        webSocket.addEventListener('message', async (event: MessageEvent) => {
            try {
                this.lastActive = Date.now();
                const data = JSON.parse(event.data as string);

                // Broadcast to all other sessions
                const message = {
                    sender_id: userId,
                    text: data.text,
                    timestamp: Date.now(),
                    type: data.type || 'text' // 'text', 'gift', 'image'
                };

                const msgString = JSON.stringify(message);

                // 1. Broadcast Real-time
                this.sessions.forEach(session => {
                    if (session.readyState === WebSocket.OPEN) {
                        session.send(msgString);
                    }
                });

                // 2. Persist Async (Don't block chat)
                // In real app, batch these or put in queue
                // this.state.storage.put(`msg_${Date.now()}`, message);

            } catch (err) {
                console.error(err);
            }
        });

        webSocket.addEventListener('close', () => {
            this.sessions = this.sessions.filter(s => s !== webSocket);
        });
    }
}

/**
 * Durable Objects: MatchLobby
 * Handles waiting room and matchmaking coordination
 */
export class MatchLobby {
    state: DurableObjectState;
    env: Env;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
    }

    async fetch(request: Request) {
        return new Response("Match Lobby Active");
    }
}

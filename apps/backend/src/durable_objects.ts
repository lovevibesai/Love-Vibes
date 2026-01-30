/**
 * Durable Objects: ChatRoom
 * Handles Real-time WebSocket Messaging for a Match
 */
import { Env } from './index';
import { logger } from './logger';

interface ChatMessage {
    id: string;
    sender_id: string;
    text: string;
    type: string;
    timestamp: number;
}

export class ChatRoom {
    state: DurableObjectState;
    sessions: Map<WebSocket, string>; // WebSocket -> userId
    env: Env;
    lastActive: number;
    matchId: string | null;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
        this.sessions = new Map();
        this.lastActive = Date.now();
        this.matchId = null;

        // Auto-hibernate after 5 minutes of inactivity (increased from 30s)
        void this.state.storage.setAlarm(Date.now() + 5 * 60 * 1000);
    }

    async alarm() {
        // Only hibernate if no active sessions
        if (this.sessions.size === 0 && Date.now() - this.lastActive >= 5 * 60 * 1000) {
            // Clean up and hibernate
            logger.info('chat_room_hibernating', undefined, { matchId: this.matchId });
        } else {
            // Check again later
            void this.state.storage.setAlarm(Date.now() + 60 * 1000);
        }
    }

    async fetch(request: Request) {
        const url = new URL(request.url);

        // Handle non-WebSocket requests (e.g., loading history)
        if (request.method === 'GET' && url.pathname.endsWith('/history')) {
            return this.getHistory(url);
        }

        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
            return new Response('Expected Upgrade: websocket', { status: 426 });
        }

        const userId = url.searchParams.get('user_id');
        this.matchId = url.searchParams.get('match_id') || this.matchId;

        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        await this.handleSession(server, userId);

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    async getHistory(url: URL): Promise<Response> {
        const limit = parseInt(url.searchParams.get('limit') || '50');

        try {
            // Get messages from Durable Object storage
            const messages: ChatMessage[] = [];
            const stored = await this.state.storage.list<ChatMessage>({ prefix: 'msg_' });

            for (const [, value] of stored) {
                messages.push(value);
            }

            // Sort by timestamp and limit
            messages.sort((a, b) => a.timestamp - b.timestamp);
            const limited = messages.slice(-limit);

            return new Response(JSON.stringify({ success: true, messages: limited }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (_err) {
            return new Response(JSON.stringify({ success: false, error: 'Failed to load history' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async handleSession(webSocket: WebSocket, userId: string | null) {
        webSocket.accept();
        this.sessions.set(webSocket, userId || 'anonymous');
        this.lastActive = Date.now();

        // Send connection confirmation
        webSocket.send(JSON.stringify({
            type: 'connected',
            user_count: this.sessions.size,
            timestamp: Date.now()
        }));

        webSocket.addEventListener('message', async (event: MessageEvent) => {
            try {
                this.lastActive = Date.now();
                const data = JSON.parse(event.data as string);

                // Create message object
                const messageId = crypto.randomUUID();
                const message: ChatMessage = {
                    id: messageId,
                    sender_id: userId || 'anonymous',
                    text: data.text,
                    timestamp: Date.now(),
                    type: data.type || 'text' // 'text', 'gift', 'image'
                };

                const msgString = JSON.stringify(message);

                // 1. Broadcast Real-time to all sessions
                for (const [session] of this.sessions) {
                    if (session.readyState === WebSocket.OPEN) {
                        session.send(msgString);
                    }
                }

                // 2. Persist to Durable Object storage (async, non-blocking)
                void this.persistMessage(message);

                // 3. Also persist to D1 for long-term storage (async, non-blocking)
                if (this.matchId) {
                    void this.persistToDatabase(message);
                }

            } catch (err) {
                logger.error('chat_message_error', err, { matchId: this.matchId });
            }
        });

        webSocket.addEventListener('close', () => {
            this.sessions.delete(webSocket);

            // Notify other users
            const notification = JSON.stringify({
                type: 'user_left',
                user_count: this.sessions.size,
                timestamp: Date.now()
            });

            for (const [session] of this.sessions) {
                if (session.readyState === WebSocket.OPEN) {
                    session.send(notification);
                }
            }
        });
    }

    async persistMessage(message: ChatMessage) {
        try {
            await this.state.storage.put(`msg_${message.timestamp}_${message.id}`, message);
        } catch (err) {
            logger.error('message_persist_error', err, { messageId: message.id });
        }
    }

    async persistToDatabase(message: ChatMessage) {
        try {
            await this.env.DB.prepare(
                'INSERT INTO ChatMessages (id, match_id, sender_id, message_text, message_type, created_at) VALUES (?, ?, ?, ?, ?, ?)'
            )
                .bind(message.id, this.matchId, message.sender_id, message.text, message.type, message.timestamp)
                .run();
        } catch (_err) {
            // Silent fail for database persistence - DO storage is primary
            logger.warn('chat_db_persist_failed', 'Failed to persist message to D1', { messageId: message.id });
        }
    }
}

/**
 * Durable Objects: MatchLobby
 * Handles waiting room and matchmaking coordination
 */
export class MatchLobby {
    state: DurableObjectState;
    env: Env;
    waitingUsers: Map<string, { userId: string; preferences: any; joinedAt: number }>;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
        this.waitingUsers = new Map();
    }

    async fetch(request: Request) {
        const url = new URL(request.url);
        const method = request.method;

        if (method === 'POST' && url.pathname.endsWith('/join')) {
            return this.joinLobby(request);
        }

        if (method === 'POST' && url.pathname.endsWith('/leave')) {
            return this.leaveLobby(request);
        }

        if (method === 'GET' && url.pathname.endsWith('/status')) {
            return new Response(JSON.stringify({
                success: true,
                waiting_count: this.waitingUsers.size
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: true, message: 'Match Lobby Active' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async joinLobby(request: Request): Promise<Response> {
        try {
            const body = await request.json() as { user_id: string; preferences?: any };
            const { user_id, preferences } = body;

            this.waitingUsers.set(user_id, {
                userId: user_id,
                preferences: preferences || {},
                joinedAt: Date.now()
            });

            return new Response(JSON.stringify({
                success: true,
                position: this.waitingUsers.size,
                message: 'Joined match lobby'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (_err) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async leaveLobby(request: Request): Promise<Response> {
        try {
            const body = await request.json() as { user_id: string };
            const { user_id } = body;

            this.waitingUsers.delete(user_id);

            return new Response(JSON.stringify({
                success: true,
                message: 'Left match lobby'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (_err) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}

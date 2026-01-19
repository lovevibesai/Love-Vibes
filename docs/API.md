# Love Vibes API Documentation

This document describes the core API endpoints for the Love Vibes backend.

## Base URL
The API is currently accessible at:
`https://api.lovevibes.ai/v1` (Production)
`http://localhost:8787` (Local Development)

## Authentication

Authentication is handled via JWT tokens in the `Authorization` header.

```http
Authorization: Bearer <your_token>
```

### Endpoints

#### 1. Identity & Auth
- `POST /auth/register`: Create a new user account.
- `POST /auth/login`: Authenticate and receive a token.
- `POST /auth/logout`: Invalidate a session.

#### 2. User Profiles
- `GET /user/profile`: Get current user info.
- `PATCH /user/profile`: Update profile details (bio, interests, etc.).
- `GET /user/:id`: View another user's public profile.
- `POST /user/verify`: Submit verification request (photos/ID).

#### 3. Discovery & Matching
- `GET /feed`: Get a list of suggested profiles based on preferences.
- `POST /swipe`: Record a 'LIKE', 'PASS', or 'SUPERLIKE'.
  - Body: `{ "target_id": "uuid", "type": "LIKE" }`
- `GET /matches`: Retrieve a list of mutual matches.

#### 4. Messaging
- `GET /chat/:match_id/history`: Get message history for a match.
- `POST /chat/:match_id/media`: Upload media to a specific chat.

#### 5. Real-time (WebSockets)
WebSocket connections are upgraded via:
`wss://api.lovevibes.ai/chat/:match_id`

**Events:**
- `message.send`: Client sending a text message.
- `message.receive`: Server broadcasting message to participants.
- `user.typing`: Indicating typing status.
- `user.status`: Online/Offline updates.

#### 6. Gifting & Credits
- `POST /gifts/send`: Send a virtual gift.
- `GET /credits/balance`: Check LV Coin balance.

## Safety & Reporting
- `POST /safety/report`: Report a user.
  - Body: `{ "reported_id": "uuid", "reason": "inappropriate_content", "details": "..." }`
- `POST /safety/block`: Block a user.

## Error Handling

The API uses standard HTTP status codes:
- `200 OK`: Success.
- `400 Bad Request`: Validation errors.
- `401 Unauthorized`: Missing or invalid token.
- `403 Forbidden`: Insufficient permissions.
- `404 Not Found`: Resource doesn't exist.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Server-side issues.

---

For detailed implementation examples, see the [CONTRIBUTING.md](../CONTRIBUTING.md) guide.

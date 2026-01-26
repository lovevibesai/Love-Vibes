export class AppError extends Error {
    constructor(
        public message: string,
        public status: number = 500,
        public code: string = 'INTERNAL_ERROR',
        public data?: any
    ) {
        super(message);
        this.name = this.constructor.name;
    }

    toJSON() {
        return {
            success: false,
            error: {
                message: this.message,
                code: this.code,
                data: this.data
            }
        };
    }
}

export class ValidationError extends AppError {
    constructor(message: string, data?: any) {
        super(message, 400, 'VALIDATION_ERROR', data);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'AUTH_ERROR');
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

export class ServerError extends AppError {
    constructor(message: string = 'Everything is broken', data?: any) {
        super(message, 500, 'SERVER_ERROR', data);
    }
}

export function handleApiError(e: any): Response {
    if (e instanceof AppError) {
        return new Response(JSON.stringify(e.toJSON()), {
            status: e.status,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Default 500 for unexpected errors
    return new Response(JSON.stringify({
        success: false,
        error: {
            message: e instanceof Error ? e.message : 'An unexpected error occurred',
            code: 'INTERNAL_ERROR'
        }
    }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
}

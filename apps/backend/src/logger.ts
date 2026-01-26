export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
    level: LogLevel;
    timestamp: string;
    event: string;
    message?: string;
    data?: Record<string, any>;
    requestId?: string;
    path?: string;
    userId?: string;
}

export const logger = {
    log(entry: Partial<LogEntry>) {
        const fullEntry: LogEntry = {
            level: 'INFO',
            timestamp: new Date().toISOString(),
            event: 'unknown',
            ...entry
        };

        console.log(JSON.stringify(fullEntry));
    },

    info(event: string, message?: string, data?: Record<string, any>) {
        this.log({ level: 'INFO', event, message, data });
    },

    debug(event: string, message?: string, data?: Record<string, any>) {
        this.log({ level: 'DEBUG', event, message, data });
    },

    warn(event: string, message?: string, data?: Record<string, any>) {
        this.log({ level: 'WARN', event, message, data });
    },

    error(event: string, error: any, data?: Record<string, any>) {
        this.log({
            level: 'ERROR',
            event,
            message: error instanceof Error ? error.message : String(error),
            data: {
                ...(data || {}),
                stack: error instanceof Error ? error.stack : undefined
            }
        });
    }
};

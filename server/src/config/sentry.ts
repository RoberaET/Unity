import * as Sentry from '@sentry/node';

/**
 * Initialize Sentry for production error tracking and monitoring
 * 
 * DESIGN DECISION: Sentry provides:
 * - Real-time error tracking across all server instances
 * - Performance monitoring (slow transactions, queries)
 * - Release tracking to correlate errors with deployments
 * - User context for debugging (which user hit the error)
 * 
 * Integration points:
 * - Automatic Express middleware integration
 * - Manual error capturing in try/catch blocks
 * - Performance transaction tracking for critical operations
 */

export const initSentry = () => {
    // Only initialize if DSN is provided (production/staging)
    const dsn = process.env.SENTRY_DSN;

    if (!dsn) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('⚠️  SENTRY_DSN not set. Error tracking disabled in production!');
        }
        return;
    }

    Sentry.init({
        dsn,
        environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

        // Performance Monitoring
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'), // 10% of requests

        // Release tracking (correlate errors with code versions)
        release: process.env.GIT_COMMIT_SHA || 'unknown',

        // Don't send errors in development
        enabled: process.env.NODE_ENV !== 'development',

        // Filter out sensitive data
        beforeSend(event: any, hint: any) {
            // Remove sensitive headers
            if (event.request?.headers) {
                delete event.request.headers['authorization'];
                delete event.request.headers['cookie'];
            }

            // Remove sensitive query params
            if (event.request?.query_string) {
                // Remove any params that might contain tokens or passwords
                event.request.query_string = event.request.query_string
                    .replace(/([?&])(token|password|secret)=[^&]*/gi, '$1$2=REDACTED');
            }

            return event;
        },
    });

    console.log('✅ Sentry initialized for error tracking');
};

/**
 * Capture exception with context
 * Use this in catch blocks for important operations
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
    Sentry.captureException(error, {
        extra: context,
    });
};

/**
 * Add user context to Sentry (call after authentication)
 */
export const setSentryUser = (user: { id: string; email: string }) => {
    Sentry.setUser({
        id: user.id,
        email: user.email,
    });
};

/**
 * Clear user context (call on logout)
 */
export const clearSentryUser = () => {
    Sentry.setUser(null);
};

/**
 * Create a performance transaction for monitoring slow operations
 * Usage:
 *   const transaction = startTransaction('data-export', 'csv');
 *   // ... perform export ...
 *   transaction.finish();
 */
export const startTransaction = (op: string, name: string) => {
    return Sentry.startTransaction({
        op,
        name,
    });
};

export default Sentry;

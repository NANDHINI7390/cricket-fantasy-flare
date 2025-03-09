
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Replace this with your actual Sentry DSN when you have it
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';

export const initSentry = () => {
  // Only initialize Sentry if we have a DSN
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not found. Sentry will not be initialized.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [new BrowserTracing()],
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    
    // Capture all authentication-related errors
    beforeSend(event) {
      // Add authentication context tags to help with filtering in Sentry
      if (event.tags && (
        event.tags.auth || 
        event.message?.includes('auth') || 
        event.exception?.values?.some(e => e.value?.includes('auth'))
      )) {
        event.tags.authentication = true;
      }
      return event;
    },
  });

  // Add a global error boundary hook for React errors
  Sentry.setTag('component', 'authentication');
};

// Helper function to capture authentication errors with appropriate context
export const captureAuthError = (error: Error | string, context: Record<string, any> = {}) => {
  Sentry.withScope((scope) => {
    scope.setTag('auth', 'true');
    scope.setTag('authentication', 'true');
    
    // Add helpful context for debugging
    Object.entries(context).forEach(([key, value]) => {
      scope.setContext(key, value);
    });
    
    if (typeof error === 'string') {
      Sentry.captureMessage(error, Sentry.Severity.Error);
    } else {
      Sentry.captureException(error);
    }
  });
};

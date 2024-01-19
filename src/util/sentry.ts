import { haveOCP } from './env';
import * as Sentry from '@sentry/react';
export function getSentry() {
  if (haveOCP()) {
    return Sentry;
  }
}

export function initSentry() {
  getSentry()?.init({
    dsn: 'https://98fb52ab508043bf94a763dc51d5a2e0@obc-sentry.oceanbase.com/6',
    debug: true,
    transport: Sentry.makeXHRTransport,
  });
}

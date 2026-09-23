// constants/session.ts

/**
 * How long a signed-in user can stay idle (no touches on screen, or the app
 * backgrounded) before they are automatically logged out.
 *
 * Kept as a single named constant so the timeout can be tuned in one place —
 * see components/InactivityGuard.tsx for how it's used.
 */
export const INACTIVITY_TIMEOUT_MS = 60 * 10000;

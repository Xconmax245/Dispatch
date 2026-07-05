// lib/session-store.ts
// In-memory conversation session store. Deliberately non-persistent:
// sessions exist for the lifetime of the server process only.
// No database. No disk writes. Restart = clean slate (intentional — documented in /docs).

export interface SessionMessage {
  text: string;
  timestamp: number;
  tier: string;
  riskScore: number;
}

export interface ConversationSession {
  senderId: string;
  messages: SessionMessage[];
  firstSeenAt: number;
  lastSeenAt: number;
}

// Max messages stored per session — keeps prompt size bounded.
const MAX_SESSION_MESSAGES = 5;

// Max context messages sent to the triage prompt — older messages dilute rather than inform.
export const CONTEXT_WINDOW = 3;

// Sessions are keyed by senderId.
const sessions = new Map<string, ConversationSession>();

/**
 * Returns the session for a given senderId, creating it if it doesn't exist.
 * Returns null if senderId is absent or "unknown" — anonymous calls skip session memory.
 */
export function getOrCreateSession(senderId: string): ConversationSession | null {
  if (!senderId || senderId === "unknown") return null;

  if (!sessions.has(senderId)) {
    sessions.set(senderId, {
      senderId,
      messages: [],
      firstSeenAt: Date.now(),
      lastSeenAt: Date.now(),
    });
  }

  return sessions.get(senderId)!;
}

/**
 * Appends a processed message to the sender's session.
 * Keeps only the last MAX_SESSION_MESSAGES entries to bound memory.
 */
export function appendMessage(
  senderId: string,
  text: string,
  tier: string,
  riskScore: number
): void {
  const session = getOrCreateSession(senderId);
  if (!session) return;

  session.messages.push({ text, timestamp: Date.now(), tier, riskScore });
  session.lastSeenAt = Date.now();

  // Trim to max window
  if (session.messages.length > MAX_SESSION_MESSAGES) {
    session.messages = session.messages.slice(-MAX_SESSION_MESSAGES);
  }
}

/**
 * Returns the prior messages for this sender (up to CONTEXT_WINDOW),
 * excluding the current message (which hasn't been appended yet).
 */
export function getPriorContext(senderId: string): SessionMessage[] {
  const session = getOrCreateSession(senderId);
  if (!session || session.messages.length === 0) return [];
  return session.messages.slice(-CONTEXT_WINDOW);
}

/**
 * Returns how many messages this sender has sent in the past `windowMs` milliseconds.
 * Used as a frequency signal independent of content.
 */
export function getMessageFrequency(senderId: string, windowMs = 10 * 60 * 1000): number {
  const session = getOrCreateSession(senderId);
  if (!session) return 0;
  const cutoff = Date.now() - windowMs;
  return session.messages.filter((m) => m.timestamp >= cutoff).length;
}

/**
 * Computes escalation trend: did the risk score increase compared to
 * the most recent prior message from this sender?
 */
export function computeEscalationTrend(senderId: string, currentRisk: number): boolean {
  const session = getOrCreateSession(senderId);
  if (!session || session.messages.length === 0) return false;
  const last = session.messages[session.messages.length - 1];
  return currentRisk > last.riskScore;
}

/**
 * Returns how many messages are in this sender's session.
 */
export function getConversationLength(senderId: string): number {
  const session = getOrCreateSession(senderId);
  if (!session) return 0;
  return session.messages.length;
}

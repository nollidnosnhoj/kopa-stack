import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import db from "./database";
import { sessionTable } from "./database/schema";
import { User } from "./user";

export interface Session {
  id: string;
  expiresAt: Date;
  userId: string;
}

type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export const SESSION_EXPIRY = 1000 * 60 * 60 * 24 * 30; // 30 days
export const SESSION_REFRESH_TIME = 1000 * 60 * 60 * 24 * 15; // 15 days

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = getSessionIdFromToken(token);
  const session = await db.query.sessionTable.findFirst({
    where: (table, ops) => ops.eq(table.id, sessionId),
    with: {
      user: true,
    },
  });
  if (!session) {
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime()) {
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.id, sessionId))
      .execute();
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - SESSION_REFRESH_TIME) {
    session.expiresAt = new Date(Date.now() + SESSION_REFRESH_TIME);
    await db
      .update(sessionTable)
      .set({ expiresAt: session.expiresAt })
      .where(eq(sessionTable.id, sessionId))
      .execute();
  }
  return { session, user: session.user };
}

export async function invalidateSession(session: Session) {
  await db
    .delete(sessionTable)
    .where(eq(sessionTable.id, session.id))
    .execute();
}

export async function invalidateUserSessions(userId: string) {
  await db
    .delete(sessionTable)
    .where(eq(sessionTable.userId, userId))
    .execute();
}

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32(tokenBytes).toLowerCase();
  return token;
}

export async function createSession(
  token: string,
  userId: string
): Promise<Session> {
  const sessionId = getSessionIdFromToken(token);
  const session: Session = {
    id: sessionId,
    expiresAt: new Date(Date.now() + SESSION_EXPIRY),
    userId,
  };
  await db.insert(sessionTable).values(session).execute();
  return session;
}

function getSessionIdFromToken(token: string): string {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  return sessionId;
}

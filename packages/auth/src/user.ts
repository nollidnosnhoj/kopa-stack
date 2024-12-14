import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "./database";
import { accountTable, userTable } from "./database/schema";
import { OAuthProvider } from "./oauth";

export interface User {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
}

export async function createUserFromOAuthAccount(
  provider: OAuthProvider,
  providerUserId: string,
  username: string,
  email: string
): Promise<User> {
  return await db.transaction(async (trx) => {
    const [insertedUser] = await trx
      .insert(userTable)
      .values({
        username,
        email,
        emailVerified: true, // TODO: Verify email
      })
      .returning();

    if (!insertedUser) {
      throw new Error("Failed to create user");
    }

    await trx
      .insert(accountTable)
      .values({
        providerId: provider,
        providerUserId,
        userId: insertedUser.id,
      })
      .execute();

    return insertedUser;
  });
}

export async function getUserFromOAuthAccount(
  provider: OAuthProvider,
  providerUserId: string
): Promise<User | null> {
  const accountWithUser = await db.query.accountTable.findFirst({
    where: (table, ops) =>
      ops.and(
        ops.eq(table.providerId, provider),
        ops.eq(table.providerUserId, providerUserId)
      ),
    with: {
      user: true,
    },
  });

  if (accountWithUser && accountWithUser.user) {
    return accountWithUser.user;
  }

  return null;
}

export async function findUserByEmail(email: string) {
  return await db.query.userTable.findFirst({
    where: (table, ops) => ops.eq(table.email, email),
  });
}

export async function getRandomUsername() {
  let username: string;
  let count = 0;
  do {
    const randomId = nanoid(6);
    username = `user${randomId}`;
    count = await db.$count(userTable, eq(userTable.username, username));
  } while (count > 0);

  return username;
}

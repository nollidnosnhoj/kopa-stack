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
): Promise<User | null> {
  return await db.transaction(async (trx) => {
    const insertUsers = await trx
      .insert(userTable)
      .values({
        username,
        email,
        emailVerified: true, // TODO: Verify email
      })
      .returning();

    if (insertUsers.length === 1) {
      const user = insertUsers[0]!;
      await trx
        .insert(accountTable)
        .values({
          providerId: provider,
          providerUserId,
          userId: user.id,
        })
        .execute();
      return user;
    }

    throw new Error("Failed to create user");
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

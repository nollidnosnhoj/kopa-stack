import db from "../database";
import { accountTable, providerEnum } from "../database/schema";

export const oauthProviders = providerEnum.enumValues;
export type OAuthProvider = (typeof oauthProviders)[number];

export async function getOAuthAccount(
  provider: OAuthProvider,
  providerUserId: string
) {
  return await db.query.accountTable.findFirst({
    where: (table, ops) =>
      ops.and(
        ops.eq(table.providerId, provider),
        ops.eq(table.providerUserId, providerUserId)
      ),
  });
}

export async function createOAuthAccount(
  provider: OAuthProvider,
  providerUserId: string,
  userId: string
) {
  await db
    .insert(accountTable)
    .values({ providerId: provider, providerUserId, userId })
    .execute();
}

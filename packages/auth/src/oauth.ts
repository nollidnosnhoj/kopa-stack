import { generateState } from "arctic";
import { AccountProvider, AccountType, OAuthProvider } from "./accounts";
import db from "./database";
import { accountTable } from "./database/schema";

export async function getAccountByProvider(
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

export async function createAccountFromProvider(
  type: AccountType,
  provider: AccountProvider,
  providerUserId: string,
  userId: string
) {
  await db
    .insert(accountTable)
    .values({ type, providerId: provider, providerUserId, userId })
    .execute();
}

export {
  Discord,
  generateState,
  generateCodeVerifier,
  OAuth2RequestError,
} from "arctic";

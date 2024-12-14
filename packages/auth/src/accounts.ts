export const accountTypes = ["oauth", "email"] as const;
export type AccountType = (typeof accountTypes)[number];

export const oauthProviders = ["discord"] as const;
export type OAuthProvider = (typeof oauthProviders)[number];

export const accountProviders = ["email", ...oauthProviders] as const;
export type AccountProvider = (typeof accountProviders)[number];

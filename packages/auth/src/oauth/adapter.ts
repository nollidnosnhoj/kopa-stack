import { OAuth2Tokens } from "arctic";

export interface IOAuthAdapter {
  createAuthorizationUrl(state: string, scopes: string[]): URL;
  validateAuthorizationCode(code: string): Promise<OAuth2Tokens>;
  refreshAccessToken(refreshToken: string): Promise<OAuth2Tokens>;
  revokeToken(token: string): Promise<void>;
  getUserProfile(tokens: OAuth2Tokens): Promise<OAuthProfile>;
}

export type OAuthProfile = {
  id: string;
  username: string;
  email: string;
  // Add more if needed by another OAuth provider.
};

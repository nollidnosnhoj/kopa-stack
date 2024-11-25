import { Discord, OAuth2Tokens } from "arctic";
import { IOAuthAdapter, OAuthProfile } from "./adapter";
import { z } from "zod";

const userProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  discriminator: z.string(),
  global_name: z.string().nullable(),
  avatar: z.string().nullable(),
  email: z.string().nullable(),
  verified: z.boolean().nullable(),
});

export class DiscordOAuth implements IOAuthAdapter {
  private client: Discord;

  constructor(options: {
    clientId?: string;
    clientSecret?: string;
    redirectUri: string;
  }) {
    this.client = new Discord(
      options.clientId ?? process.env.DISCORD_CLIENT_ID!,
      options.clientSecret ?? process.env.DISCORD_CLIENT_SECRET!,
      options.redirectUri
    );
  }
  createAuthorizationUrl(state: string, scopes: string[]): URL {
    return this.client.createAuthorizationURL(state, scopes);
  }
  validateAuthorizationCode(code: string): Promise<OAuth2Tokens> {
    return this.client.validateAuthorizationCode(code);
  }
  refreshAccessToken(refreshToken: string): Promise<OAuth2Tokens> {
    return this.client.refreshAccessToken(refreshToken);
  }
  revokeToken(token: string): Promise<void> {
    return this.client.revokeToken(token);
  }
  async getUserProfile(tokens: OAuth2Tokens): Promise<OAuthProfile> {
    const accessToken = tokens.accessToken();
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const json = await response.json();
    const discordProfile = userProfileSchema.parse(json);
    if (!discordProfile.email) {
      throw new Error("Email not found in profile. Add the email scope.");
    }
    return {
      id: discordProfile.id,
      username: discordProfile.username + discordProfile.discriminator,
      email: discordProfile.email,
    };
  }
}

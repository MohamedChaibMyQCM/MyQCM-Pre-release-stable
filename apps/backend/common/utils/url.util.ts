import { Logger } from "@nestjs/common";
import { getEnvOrFatal } from "./env.util";

function checkClientUrl(client_url?: string): URL | null {
  let final_client: string | undefined;

  if (client_url) {
    if (
      getEnvOrFatal("CLIENT_URL") &&
      getEnvOrFatal("CLIENT_URL") !== client_url
    ) {
      Logger.error(
        `Client URL is different from the one in the environment variable.`,
        "checkClientUrl",
      );
      final_client = getEnvOrFatal("CLIENT_URL");
    } else {
      final_client = client_url;
    }
  } else {
    final_client = getEnvOrFatal("CLIENT_URL");
  }

  if (!final_client) {
    return null;
  }

  try {
    return new URL(final_client);
  } catch (error) {
    Logger.error(`Invalid URL: ${final_client}`, "checkClientUrl");
    return null;
  }
}
function checkServerUrl(server_url?: string): URL | null {
  let final_server: string | undefined;

  if (server_url) {
    if (
      getEnvOrFatal("BACKEND_URL") &&
      getEnvOrFatal("BACKEND_URL") !== server_url
    ) {
      Logger.error(
        `Client URL is different from the one in the environment variable.`,
        "checkClientUrl",
      );
      final_server = getEnvOrFatal("BACKEND_URL");
    } else {
      final_server = server_url;
    }
  } else {
    final_server = getEnvOrFatal("BACKEND_URL");
  }

  if (!final_server) {
    return null;
  }

  try {
    return new URL(final_server);
  } catch (error) {
    Logger.error(`Invalid URL: ${final_server}`, "checkClientUrl");
    return null;
  }
}
export const createGoogleAuthRedirectLink = (params: {
  client_url?: string;
  token?: string;
}) => {
  return `${checkClientUrl(params.client_url)}/google-redirect?token=${params.token}`;
};
export const createEmailVerificationLink = (
  token: string,
  client_url?: string,
) => {
  return `${checkClientUrl(client_url)}/verify/verify-email?token=${token}`;
};
export const createResetPasswordLink = (token: string, client_url?: string) => {
  return `${checkClientUrl(client_url)}/reset/reset-password?token=${token}`;
};
export const createSessionLink = (sessionId: string, client_url?: string) => {
  return `${checkClientUrl(client_url)}/dashboard/question-bank/session/${sessionId}`;
};
export const createGoogleCallbackUrl = (server_url?: string) => {
  return `${checkServerUrl(server_url)}/auth/user/google/callback`;
};

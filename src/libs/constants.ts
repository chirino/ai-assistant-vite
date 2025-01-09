import ENV from "./env";

export const isAuthRequired = ENV.AUTH_REQUIRED !== "false";
export const isAnalyticsEnabled = ENV.ANALYTICS_ENABLED !== "false";
export const isAuthServerEmbedded = ENV.OIDC_SERVER_IS_EMBEDDED === "true";

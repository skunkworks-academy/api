import "dotenv/config";

const canonicalTenantId = "972e8de4-e365-43a3-99ec-c86a0cc249e8";
const canonicalApiClientId = "8b1e77b3-3017-4c54-8ab3-0e4864511b55";
const canonicalAudience = `api://${canonicalApiClientId}`;

function splitCsv(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8080),
  serviceName: "skunkworks-academy-api",
  apiBaseUrl: process.env.API_BASE_URL ?? "https://api.skunkworksacademy.com",
  tenantId: process.env.ENTRA_TENANT_ID ?? canonicalTenantId,
  apiClientId: process.env.API_CLIENT_ID ?? canonicalApiClientId,
  apiAudience: process.env.API_AUDIENCE ?? canonicalAudience,
  disableAuth: process.env.DISABLE_AUTH === "true" && process.env.NODE_ENV !== "production",
  allowedOrigins: splitCsv(process.env.ALLOWED_ORIGINS).length
    ? splitCsv(process.env.ALLOWED_ORIGINS)
    : [
        "https://portal.skunkworksacademy.com",
        "https://login.skunkworksacademy.com",
        "https://verify.skunkworksacademy.com",
        "http://localhost:5173",
        "http://localhost:3000"
      ]
};

export function missingSettings() {
  const missing: string[] = [];
  if (!config.tenantId) missing.push("ENTRA_TENANT_ID");
  if (!config.apiClientId) missing.push("API_CLIENT_ID");
  if (!config.apiAudience) missing.push("API_AUDIENCE");
  if (!config.allowedOrigins.length) missing.push("ALLOWED_ORIGINS");
  return missing;
}

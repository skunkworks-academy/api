import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "./config.js";
import type { AuthenticatedUser } from "./types.js";

const issuer = `https://login.microsoftonline.com/${config.tenantId}/v2.0`;
const jwks = createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${config.tenantId}/discovery/v2.0/keys`));
const acceptedAudiences = new Set([config.apiAudience, config.apiClientId]);

function extractBearerToken(req: Request) {
  const header = req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : undefined;
}

function rolesFromPayload(payload: Record<string, unknown>) {
  const roles = Array.isArray(payload.roles) ? payload.roles.map(String) : [];
  const scp = typeof payload.scp === "string" ? payload.scp.split(" ").filter(Boolean) : [];
  return { roles, scopes: scp };
}

function userFromPayload(payload: Record<string, unknown>): AuthenticatedUser {
  const { roles, scopes } = rolesFromPayload(payload);
  const preferredUsername = typeof payload.preferred_username === "string" ? payload.preferred_username : undefined;
  const email = typeof payload.email === "string" ? payload.email : preferredUsername ?? "unknown@skunkworksacademy.com";
  const name = typeof payload.name === "string" ? payload.name : email;
  const objectId = typeof payload.oid === "string" ? payload.oid : email;
  const tenantId = typeof payload.tid === "string" ? payload.tid : undefined;

  return { objectId, name, email, roles, tenantId, scopes };
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  if (config.disableAuth) {
    req.user = {
      objectId: "local-dev-user",
      name: "Local API Developer",
      email: "developer@skunkworksacademy.com",
      roles: ["Portal.Admin", "Portal.Staff"],
      tenantId: config.tenantId,
      scopes: ["access_as_user"]
    };
    return next();
  }

  const token = extractBearerToken(req);
  if (!token) return res.status(401).json({ error: "missing_bearer_token" });

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: Array.from(acceptedAudiences)
    });
    req.user = userFromPayload(payload as Record<string, unknown>);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "invalid_token", detail: error instanceof Error ? error.message : "Token validation failed" });
  }
}

export function requireScope(requiredScope = "access_as_user") {
  return (req: Request, res: Response, next: NextFunction) => {
    const hasScope = req.user?.scopes.includes(requiredScope) || req.user?.roles.length;
    if (!hasScope) return res.status(403).json({ error: "insufficient_scope", requiredScope });
    return next();
  };
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  const roles = req.user?.roles.map((role) => role.toLowerCase()) ?? [];
  if (roles.includes("portal.admin") || roles.includes("portal.staff")) return next();
  return res.status(403).json({ error: "staff_role_required" });
}

export function userRole(req: Request) {
  const roles = req.user?.roles.map((role) => role.toLowerCase()) ?? [];
  if (roles.includes("portal.admin") || roles.includes("portal.staff")) return "Staff";
  if (roles.includes("portal.instructor")) return "Instructor";
  return "Student";
}

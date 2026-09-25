import { secrets } from "base44:runtime";

export function readSecret(name) {
  try {
    return secrets.get(name) || null;
  } catch (_e) {
    return null;
  }
}
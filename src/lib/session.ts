export type AirlockSession = {
  firstName: string;
  name: string;
  email: string;
  orgName: string;
};

export function getSession(): AirlockSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("airlock_session");
    if (!raw) return null;
    return JSON.parse(raw) as AirlockSession;
  } catch {
    return null;
  }
}

export function setSession(session: AirlockSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("airlock_session", JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("airlock_session");
}

import fs from "fs/promises";
import path from "path";

export type WaitlistSignup = {
  email: string;
  source?: string;
  role?: string;
};

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const DATA_FILE = path.join(process.cwd(), ".data", "waitlist.json");

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(normalizeEmail(email));
}

async function saveToFile(signup: WaitlistSignup): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  let entries: Array<WaitlistSignup & { created_at: string }> = [];
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    entries = JSON.parse(raw) as typeof entries;
  } catch {
    entries = [];
  }

  const email = normalizeEmail(signup.email);
  const existing = entries.find((e) => e.email === email);
  if (existing) {
    existing.source = signup.source ?? existing.source;
    existing.role = signup.role ?? existing.role;
  } else {
    entries.push({
      email,
      source: signup.source,
      role: signup.role,
      created_at: new Date().toISOString(),
    });
  }

  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

async function saveToNeon(signup: WaitlistSignup): Promise<void> {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  const email = normalizeEmail(signup.email);
  const source = (signup.source || "hero").slice(0, 32);
  const role = signup.role ? signup.role.slice(0, 32) : null;

  await sql`
    INSERT INTO waitlist_signups (email, source, role)
    VALUES (${email}, ${source}, ${role})
    ON CONFLICT (email) DO UPDATE SET
      source = EXCLUDED.source,
      role = COALESCE(EXCLUDED.role, waitlist_signups.role)
  `;
}

export async function saveWaitlistSignup(
  signup: WaitlistSignup
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const email = normalizeEmail(signup.email);
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email address.", status: 400 };
  }

  try {
    if (process.env.DATABASE_URL) {
      await saveToNeon({ ...signup, email });
    } else {
      await saveToFile({ ...signup, email });
    }
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not save your signup.";
    return { ok: false, error: message, status: 500 };
  }
}

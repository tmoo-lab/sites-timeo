import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

// SIX — synchronisation de la progression.
// Un seul document JSON par code de synchro. Le code n'est jamais stocké :
// la clé du blob est son empreinte SHA-256.

const MAX_BYTES = 400_000; // la progression tient en quelques dizaines de Ko
const STORE = "six-state";

function keyFor(code: string): string {
  const norm = code.trim().toLowerCase();
  return "states/" + createHash("sha256").update("six:" + norm).digest("hex");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export default async (req: Request, _context: Context) => {
  const code = req.headers.get("x-six-code") ?? "";
  if (code.length < 8 || code.length > 120) return json({ error: "code_invalide" }, 401);

  const key = keyFor(code);
  const store = getStore({ name: STORE, consistency: "strong" });

  if (req.method === "GET") {
    const entry = await store.getWithMetadata(key, { type: "json" });
    if (entry === null) return json({ state: null, updatedAt: null });
    return json({ state: entry.data, updatedAt: (entry.metadata as any)?.updatedAt ?? null });
  }

  if (req.method === "PUT") {
    const text = await req.text();
    if (text.length > MAX_BYTES) return json({ error: "trop_gros" }, 413);
    let body: any;
    try { body = JSON.parse(text); } catch { return json({ error: "json" }, 400); }
    const state = body?.state;
    if (!state || typeof state !== "object" || Array.isArray(state)) return json({ error: "state" }, 400);
    const baseUpdatedAt: string | null = body?.baseUpdatedAt ?? null;

    // Si quelqu'un (un autre appareil) a écrit depuis la dernière lecture du client,
    // on renvoie l'état courant : le client fusionne puis renvoie.
    const meta = await store.getMetadata(key);
    const current = (meta?.metadata as any)?.updatedAt ?? null;
    if (current && baseUpdatedAt !== current) {
      const entry = await store.getWithMetadata(key, { type: "json" });
      return json({ conflict: true, state: entry?.data ?? null, updatedAt: current }, 409);
    }

    const updatedAt = new Date().toISOString();
    await store.setJSON(key, state, { metadata: { updatedAt } });
    return json({ ok: true, updatedAt });
  }

  return json({ error: "methode" }, 405);
};

export const config: Config = {
  path: "/api/state",
  method: ["GET", "PUT"],
};

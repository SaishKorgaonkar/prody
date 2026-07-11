import * as http from "node:http";
import * as https from "node:https";
import type { ProdyEvent } from "./types";

export type StartSessionOptions = {
  projectPath: string;
  projectId?: string;
  region?: string;
  serviceName?: string;
};

export class ProdyClient {
  constructor(private readonly engineUrl: string) {}

  async startSession(opts: StartSessionOptions): Promise<string> {
    const body = {
      source: "ide",
      project_path: opts.projectPath,
      project_id: opts.projectId,
      region: opts.region,
      service_name: opts.serviceName,
    };
    const res = await this.request("POST", "/api/session/start", body);
    return res.session_id as string;
  }

  subscribeEvents(
    sessionId: string,
    onEvent: (event: ProdyEvent) => void,
    onEnd?: () => void
  ): () => void {
    const url = new URL(`${this.engineUrl}/api/session/${sessionId}/events`);
    const lib = url.protocol === "https:" ? https : http;

    const req = lib.get(url, (res) => {
      let buffer = "";
      res.on("data", (chunk: Buffer) => {
        buffer += chunk.toString("utf8");
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";
        for (const block of blocks) {
          for (const line of block.split("\n")) {
            if (!line.startsWith("data: ")) {
              continue;
            }
            const raw = line.slice(6).trim();
            if (!raw) {
              continue;
            }
            try {
              const parsed = JSON.parse(raw) as ProdyEvent;
              onEvent(parsed);
              if (parsed.type === "stream_end" || parsed.type === "finished") {
                onEnd?.();
              }
            } catch {
              // ignore malformed chunks
            }
          }
        }
      });
      res.on("end", () => onEnd?.());
      res.on("error", () => onEnd?.());
    });

    req.on("error", () => onEnd?.());
    return () => req.destroy();
  }

  async getStatus(sessionId: string): Promise<Record<string, unknown>> {
    return this.request("GET", `/api/session/${sessionId}/status`);
  }

  async approve(sessionId: string, stepId: string, approved: boolean): Promise<void> {
    await this.request("POST", `/api/session/${sessionId}/approve`, {
      step_id: stepId,
      approved,
    });
  }

  private request(
    method: string,
    path: string,
    body?: unknown
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.engineUrl}${path}`);
      const lib = url.protocol === "https:" ? https : http;
      const payload = body ? JSON.stringify(body) : undefined;

      const req = lib.request(
        url,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c.toString()));
          res.on("end", () => {
            if (!data) {
              resolve({});
              return;
            }
            try {
              resolve(JSON.parse(data) as Record<string, unknown>);
            } catch (e) {
              reject(e);
            }
          });
        }
      );

      req.on("error", reject);
      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }
}

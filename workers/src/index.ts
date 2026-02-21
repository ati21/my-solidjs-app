import { router } from "./routes";
import type { ExecutionContext } from '@cloudflare/workers-types';

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    // Make the D1 binding globally accessible as `DB`
    // (Workers automatically expose the bindings defined in wrangler.toml)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).DB = env.DB;
    return router.handle(request);
  }
};
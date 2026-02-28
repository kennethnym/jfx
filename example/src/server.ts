import { serve } from "bun";
import index from "./index.html";
import { simpleSpec } from "../specs/simple";
import { fullSpec } from "../specs/full";

const specs: Record<string, object> = {
  simple: simpleSpec,
  full: fullSpec,
};

const sourceFiles: Record<string, string> = {
  simple: "specs/simple.tsx",
  full: "specs/full.tsx",
};

const port = Number(process.env.PORT) || 3000;

const server = serve({
  port,
  routes: {
    // Serve the React app for all unmatched routes
    "/*": index,

    "/api/spec/:name": (req) => {
      const spec = specs[req.params.name];
      if (!spec) {
        return new Response("Not found", { status: 404 });
      }
      return Response.json(spec);
    },

    "/api/source/:name": async (req) => {
      const file = sourceFiles[req.params.name];
      if (!file) {
        return new Response("Not found", { status: 404 });
      }
      const source = await Bun.file(file).text();
      return new Response(source, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    },
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`jrx example server running at ${server.url}`);

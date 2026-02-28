import { useState, useEffect } from "react";
import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["catppuccin-mocha", "catppuccin-latte"],
      langs: ["tsx", "json"],
    });
  }
  return highlighterPromise;
}

export function useHighlight(code: string, lang: "tsx" | "json"): string {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    getHighlighter().then((highlighter) => {
      if (cancelled) return;
      setHtml(
        highlighter.codeToHtml(code, {
          lang,
          themes: {
            light: "catppuccin-latte",
            dark: "catppuccin-mocha",
          },
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  return html;
}

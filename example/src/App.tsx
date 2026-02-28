import { useState, useEffect, useMemo, useRef } from "react";
import { Renderer, StateProvider, ActionProvider, VisibilityProvider } from "@json-render/react";
import type { Spec } from "@json-render/core";
import { registry, handlers } from "./registry";
import { useHighlight } from "./useHighlight";

const SPECS = ["simple", "full"] as const;

type SetState = (fn: (prev: Record<string, unknown>) => Record<string, unknown>) => void;

function SpecRenderer({ spec }: { spec: Spec }) {
  const [state, setState] = useState<Record<string, unknown>>(spec.state ?? {});
  const stateRef = useRef(state);
  const setStateRef = useRef<SetState>(setState);
  stateRef.current = state;
  setStateRef.current = setState;

  const actionHandlers = useMemo(
    () => handlers(() => setStateRef.current, () => stateRef.current),
    [],
  );

  return (
    <StateProvider initialState={state}>
      <VisibilityProvider>
        <ActionProvider handlers={actionHandlers}>
          <Renderer spec={spec} registry={registry} />
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}

function CodeBlock({ html, fallback, maxHeight = "40vh" }: { html: string; fallback: string; maxHeight?: string }) {
  if (html) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ borderRadius: "8px", overflow: "auto", maxHeight, fontSize: "13px", lineHeight: "1.5" }}
      />
    );
  }
  return (
    <pre style={{ backgroundColor: "var(--code-bg)", color: "var(--code-fg)", padding: "16px", borderRadius: "8px", fontSize: "13px", lineHeight: "1.5", overflow: "auto", maxHeight, margin: 0 }}>
      {fallback}
    </pre>
  );
}

export function App() {
  const [activeSpec, setActiveSpec] = useState<string | null>(null);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [specJson, setSpecJson] = useState<string>("");
  const [jsxSource, setJsxSource] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const jsxHtml = useHighlight(jsxSource, "tsx");
  const jsonHtml = useHighlight(specJson, "json");

  useEffect(() => {
    if (!activeSpec) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/spec/${activeSpec}`).then((r) => r.json()),
      fetch(`/api/source/${activeSpec}`).then((r) => r.text()),
    ])
      .then(([data, source]) => {
        setSpec(data);
        setSpecJson(JSON.stringify(data, null, 2));
        setJsxSource(source);
      })
      .finally(() => setLoading(false));
  }, [activeSpec]);

  if (!activeSpec) {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", padding: "0 24px" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>jfx examples</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
          JSX &rarr; json-render Spec. Pick a spec to see the live UI and JSON
          output.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {SPECS.map((name) => (
            <button
              key={name}
              onClick={() => setActiveSpec(name)}
              style={{
                padding: "12px 16px",
                fontSize: "15px",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <strong>{name}</strong>
              <span style={{ color: "var(--text-muted)", marginLeft: "8px" }}>
                {name === "simple"
                  ? "Flat elements, no state"
                  : "Nested layout with state, events, visibility, watchers"}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--border-light)",
          backgroundColor: "var(--bg-surface)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button
          onClick={() => {
            setActiveSpec(null);
            setSpec(null);
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent)",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          &larr; Back
        </button>
        <h1 style={{ fontSize: "18px" }}>{activeSpec} spec</h1>
      </div>

      {loading ? (
        <p style={{ padding: "24px", color: "var(--text-muted)" }}>Loading...</p>
      ) : (
        spec && (
          <div style={{ display: "flex", gap: "24px", padding: "24px", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
                Live UI
              </h2>
              <div
                style={{
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "var(--bg-surface)",
                }}
              >
                <SpecRenderer spec={spec} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
                  JSX Source
                </h2>
                <CodeBlock html={jsxHtml} fallback={jsxSource} />
              </div>

              <div>
                <h2 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
                  JSON Output
                </h2>
                <CodeBlock html={jsonHtml} fallback={specJson} />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

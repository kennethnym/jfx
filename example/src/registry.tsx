import { defineRegistry, useBoundProp } from "@json-render/react";
import { catalog } from "./catalog";

export const { registry, handlers } = defineRegistry(catalog, {
  components: {
    Stack: ({ props, children }) => (
      <div
        style={{
          display: "flex",
          flexDirection: props.direction === "horizontal" ? "row" : "column",
          gap: props.gap === "lg" ? "16px" : props.gap === "sm" ? "4px" : "12px",
          padding: "16px",
        }}
      >
        {children}
      </div>
    ),

    Card: ({ props, children }) => (
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "16px",
          backgroundColor: "var(--bg-surface-alt)",
        }}
      >
        {props.title && (
          <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
            {props.title}
          </h3>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {children}
        </div>
      </div>
    ),

    Text: ({ props }) => (
      <span style={{ fontSize: "14px", color: "var(--text-body)" }}>
        {String(props.content ?? "")}
      </span>
    ),

    Button: ({ props, emit }) => (
      <button
        onClick={() => emit("press")}
        style={{
          padding: "8px 16px",
          fontSize: "14px",
          backgroundColor: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          alignSelf: "flex-start",
        }}
      >
        {props.label}
      </button>
    ),

    Input: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
      return (
        <input
          placeholder={props.placeholder ?? ""}
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            outline: "none",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text)",
          }}
        />
      );
    },
  },

  actions: {
    increment: async (params, setState) => {
      if (!params) return;
      const path = params.statePath;
      const key = path.replace(/^\//, "");
      setState((prev) => ({
        ...prev,
        [key]: ((prev[key] as number) ?? 0) + 1,
      }));
    },

    logCountry: async (params) => {
      if (!params) return;
      console.log("logCountry:", params.country);
    },
  },
});

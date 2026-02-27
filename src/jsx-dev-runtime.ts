// Dev runtime re-exports the production runtime.
// The automatic JSX transform looks for jsx-dev-runtime in development mode.
export { jsx, jsxs, Fragment } from "./jsx-runtime";
export type { JSX } from "./jsx-runtime";

// jsxDEV is the dev-mode factory — same signature as jsx
export { jsx as jsxDEV } from "./jsx-runtime";

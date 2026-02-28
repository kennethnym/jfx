import type {
  ActionBinding,
  VisibilityCondition,
} from "@json-render/core";
import { JFX_NODE, FRAGMENT, type JfxNode } from "./types";
import type { JfxComponent } from "./types";

export { FRAGMENT as Fragment };

/** Props reserved by jfx — extracted from JSX props and placed on the UIElement level. */
const RESERVED_PROPS = new Set([
  "key",
  "children",
  "visible",
  "on",
  "repeat",
  "watch",
]);

/**
 * Normalize a raw `children` value from JSX props into a flat array of JfxNodes.
 * Handles: undefined, single node, nested arrays, and filters out nulls/booleans.
 */
function normalizeChildren(raw: unknown): JfxNode[] {
  if (raw == null || typeof raw === "boolean") return [];

  if (Array.isArray(raw)) {
    const result: JfxNode[] = [];
    for (const child of raw) {
      if (child == null || typeof child === "boolean") continue;
      if (Array.isArray(child)) {
        result.push(...normalizeChildren(child));
      } else {
        result.push(child as JfxNode);
      }
    }
    return result;
  }

  return [raw as JfxNode];
}

/**
 * Extract component props, filtering out reserved prop names.
 */
function extractProps(
  rawProps: Record<string, unknown>,
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const k of Object.keys(rawProps)) {
    if (!RESERVED_PROPS.has(k)) {
      props[k] = rawProps[k];
    }
  }
  return props;
}

/** Accepted tag types: string literal, Fragment symbol, or a function component. */
type JsxType = string | typeof FRAGMENT | JfxComponent;

/**
 * Core factory — shared by `jsx` and `jsxs`.
 *
 * If `type` is a function, it is called with props (like React calls
 * function components). The function returns a JfxNode directly.
 *
 * If `type` is a string or Fragment, a JfxNode is constructed inline.
 */
function createNode(
  type: JsxType,
  rawProps: Record<string, unknown> | null,
): JfxNode {
  const p = rawProps ?? {};

  // Function component — call it, just like React does.
  if (typeof type === "function") {
    return type(p);
  }

  return {
    $$typeof: JFX_NODE,
    type,
    props: extractProps(p),
    children: normalizeChildren(p.children),
    key: p.key != null ? String(p.key) : undefined,
    visible: p.visible as VisibilityCondition | undefined,
    on: p.on as
      | Record<string, ActionBinding | ActionBinding[]>
      | undefined,
    repeat: p.repeat as { statePath: string; key?: string } | undefined,
    watch: p.watch as
      | Record<string, ActionBinding | ActionBinding[]>
      | undefined,
  };
}

/**
 * JSX factory for elements with a single child (or no children).
 * Called by the automatic JSX transform (`react-jsx`).
 */
export function jsx(
  type: JsxType,
  props: Record<string, unknown> | null,
  key?: string,
): JfxNode {
  const node = createNode(type, props);
  if (key != null) node.key = String(key);
  return node;
}

/**
 * JSX factory for elements with multiple static children.
 * Called by the automatic JSX transform (`react-jsx`).
 */
export function jsxs(
  type: JsxType,
  props: Record<string, unknown> | null,
  key?: string,
): JfxNode {
  const node = createNode(type, props);
  if (key != null) node.key = String(key);
  return node;
}

// ---------------------------------------------------------------------------
// JSX namespace — tells TypeScript what JSX expressions are valid
// ---------------------------------------------------------------------------

export namespace JSX {
  /** Any string tag is valid — component types come from the catalog at runtime. */
  export interface IntrinsicElements {
    [tag: string]: Record<string, unknown>;
  }

  /** The type returned by JSX expressions. */
  export type Element = JfxNode;

  export interface ElementChildrenAttribute {
    children: {};
  }
}

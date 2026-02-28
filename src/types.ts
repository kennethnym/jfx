import type {
  ActionBinding,
  VisibilityCondition,
} from "@json-render/core";

// ---------------------------------------------------------------------------
// JfxNode — intermediate representation produced by the JSX factory
// ---------------------------------------------------------------------------

/**
 * Sentinel symbol identifying a JfxNode (prevents plain objects from
 * being mistaken for nodes).
 */
export const JFX_NODE = Symbol.for("jfx.node");

/**
 * Sentinel symbol for Fragment grouping.
 */
export const FRAGMENT = Symbol.for("jfx.fragment");

/**
 * A node in the intermediate JSX tree.
 *
 * Created by the `jsx` / `jsxs` factory functions and consumed by `render()`
 * which flattens the tree into a json-render `Spec`.
 */
export interface JfxNode {
  /** Brand symbol — always `JFX_NODE` */
  $$typeof: typeof JFX_NODE;

  /**
   * Component type name (e.g. `"Card"`, `"Button"`).
   * For fragments this is the `FRAGMENT` symbol.
   */
  type: string | typeof FRAGMENT;

  /** Component props (reserved props already extracted) */
  props: Record<string, unknown>;

  /** Child nodes */
  children: JfxNode[];

  // -- Reserved / meta fields (extracted from JSX props) --

  /** Explicit element key (overrides auto-generation) */
  key: string | undefined;

  /** Visibility condition */
  visible: VisibilityCondition | undefined;

  /** Event bindings */
  on: Record<string, ActionBinding | ActionBinding[]> | undefined;

  /** Repeat configuration */
  repeat: { statePath: string; key?: string } | undefined;

  /** State watchers */
  watch: Record<string, ActionBinding | ActionBinding[]> | undefined;
}

// ---------------------------------------------------------------------------
// JfxComponent — a function usable as a JSX tag that maps to a type string
// ---------------------------------------------------------------------------

/**
 * A jfx component function. Works like a React function component:
 * when used as a JSX tag (`<Card />`), the factory calls the function
 * with props and gets back a JfxNode.
 */
export type JfxComponent = (props: Record<string, unknown>) => JfxNode;

/**
 * Define a jfx component for use as a JSX tag.
 *
 * Creates a function that, when called with props, produces a JfxNode
 * with the given type name — just like a React component returns
 * React elements.
 *
 * @example
 * ```tsx
 * const Card = component("Card");
 * const spec = render(<Card title="Hello"><Text content="World" /></Card>);
 * ```
 */
export function component(typeName: string): JfxComponent {
  // Import createNodeFromString lazily to avoid circular dep
  // (jsx-runtime imports types). Instead, we build the node inline.
  return (props: Record<string, unknown>) => {
    return {
      $$typeof: JFX_NODE,
      type: typeName,
      props: filterReserved(props),
      children: normalizeChildrenRaw(props.children),
      key: props.key != null ? String(props.key) : undefined,
      visible: props.visible as VisibilityCondition | undefined,
      on: props.on as Record<string, ActionBinding | ActionBinding[]> | undefined,
      repeat: props.repeat as { statePath: string; key?: string } | undefined,
      watch: props.watch as Record<string, ActionBinding | ActionBinding[]> | undefined,
    };
  };
}

const RESERVED = new Set(["key", "children", "visible", "on", "repeat", "watch"]);

function filterReserved(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(props)) {
    if (!RESERVED.has(k)) out[k] = props[k];
  }
  return out;
}

function normalizeChildrenRaw(raw: unknown): JfxNode[] {
  if (raw == null || typeof raw === "boolean") return [];
  if (Array.isArray(raw)) {
    const result: JfxNode[] = [];
    for (const child of raw) {
      if (child == null || typeof child === "boolean") continue;
      if (Array.isArray(child)) {
        result.push(...normalizeChildrenRaw(child));
      } else {
        result.push(child as JfxNode);
      }
    }
    return result;
  }
  return [raw as JfxNode];
}

// ---------------------------------------------------------------------------
// render() options
// ---------------------------------------------------------------------------

export interface RenderOptions {
  /** Initial state to include in the Spec output */
  state?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export function isJfxNode(value: unknown): value is JfxNode {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as JfxNode).$$typeof === JFX_NODE
  );
}

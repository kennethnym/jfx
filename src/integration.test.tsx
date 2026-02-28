/** @jsxImportSource react */

/**
 * Integration tests: verify that Specs produced by jsonsx are consumable
 * by @json-render/react's Renderer.
 *
 * This file uses React JSX (via the pragma above) for the React component
 * tree, and jsonsx's jsx()/jsxs() via the component wrappers for building Specs.
 */

import { describe, it, expect, mock } from "bun:test";
import React from "react";
import { render as reactRender, act, fireEvent, screen, cleanup } from "@testing-library/react";
import type { Spec } from "@json-render/core";
import {
  JSONUIProvider,
  Renderer,
  type ComponentRenderProps,
} from "@json-render/react";
import { useStateStore } from "@json-render/react";
import { jsx, jsxs } from "./jsx-runtime";
import { render as jsonsxRender } from "./render";
import {
  Stack as JStack,
  Card as JCard,
  Text as JText,
  Button as JButton,
} from "./test-components";

// ---------------------------------------------------------------------------
// React stub components (rendered by @json-render/react's Renderer)
// ---------------------------------------------------------------------------

function Button({ element, emit }: ComponentRenderProps<{ label: string }>) {
  return (
    <button data-testid="btn" onClick={() => emit("press")}>
      {element.props.label}
    </button>
  );
}

function Text({ element }: ComponentRenderProps<{ content: string }>) {
  return <span data-testid="text">{element.props.content}</span>;
}

function Stack({ children }: ComponentRenderProps) {
  return <div data-testid="stack">{children}</div>;
}

function Card({ element, children }: ComponentRenderProps<{ title: string }>) {
  return (
    <div data-testid="card">
      <h3>{element.props.title}</h3>
      {children}
    </div>
  );
}

function StateProbe() {
  const { state } = useStateStore();
  return <pre data-testid="state-probe">{JSON.stringify(state)}</pre>;
}

const registry = { Button, Text, Stack, Card };

// ---------------------------------------------------------------------------
// Helper: render a jsonsx spec with @json-render/react
// ---------------------------------------------------------------------------

function renderSpec(spec: Spec, handlers?: Record<string, (...args: unknown[]) => void>) {
  return reactRender(
    <JSONUIProvider registry={registry} initialState={spec.state} handlers={handlers}>
      <Renderer spec={spec} registry={registry} />
      <StateProbe />
    </JSONUIProvider>,
  );
}

// =============================================================================
// Basic rendering
// =============================================================================

describe("jsonsx → @json-render/react round-trip", () => {
  it("renders a single element", () => {
    const spec = jsonsxRender(jsx(JText, { content: "Hello from jsonsx" }));
    renderSpec(spec);
    expect(screen.getByTestId("text").textContent).toBe("Hello from jsonsx");
  });

  it("renders nested elements with children", () => {
    const spec = jsonsxRender(
      jsxs(JCard, {
        title: "My Card",
        children: [jsx(JText, { content: "Inside card" })],
      }),
    );
    renderSpec(spec);
    expect(screen.getByTestId("card")).toBeDefined();
    expect(screen.getByText("My Card")).toBeDefined();
    expect(screen.getByTestId("text").textContent).toBe("Inside card");
  });

  it("renders a tree with multiple children", () => {
    const spec = jsonsxRender(
      jsxs(JStack, {
        children: [
          jsx(JText, { content: "First" }),
          jsx(JText, { content: "Second" }),
          jsx(JButton, { label: "Click" }),
        ],
      }),
    );
    renderSpec(spec);
    expect(screen.getByTestId("stack")).toBeDefined();
    expect(screen.getByTestId("btn").textContent).toBe("Click");
  });

  it("renders a deep tree", () => {
    const spec = jsonsxRender(
      jsxs(JStack, {
        children: [
          jsxs(JCard, {
            title: "Outer",
            children: [jsx(JText, { content: "Deep" })],
          }),
        ],
      }),
    );
    renderSpec(spec);
    expect(screen.getByText("Outer")).toBeDefined();
    expect(screen.getByTestId("text").textContent).toBe("Deep");
  });
});

// =============================================================================
// State + actions (adapted from chained-actions.test.tsx)
// =============================================================================

describe("jsonsx specs with state and actions", () => {
  it("renders with initial state", () => {
    const spec = jsonsxRender(jsx(JText, { content: "Stateful" }), {
      state: { count: 42 },
    });
    renderSpec(spec);
    const probe = screen.getByTestId("state-probe");
    const state = JSON.parse(probe.textContent!);
    expect(state.count).toBe(42);
  });

  it("setState action updates state on button press", async () => {
    const spec = jsonsxRender(
      jsx(JButton, {
        label: "Set",
        on: {
          press: {
            action: "setState",
            params: { statePath: "/clicked", value: true },
          },
        },
      }),
      { state: { clicked: false } },
    );

    renderSpec(spec);

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn"));
    });

    const state = JSON.parse(screen.getByTestId("state-probe").textContent!);
    expect(state.clicked).toBe(true);
  });

  it("chained pushState + setState resolves correctly", async () => {
    const spec = jsonsxRender(
      jsx(JButton, {
        label: "Chain",
        on: {
          press: [
            {
              action: "pushState",
              params: { statePath: "/items", value: "new-item" },
            },
            {
              action: "setState",
              params: {
                statePath: "/observed",
                value: { $state: "/items" },
              },
            },
          ],
        },
      }),
      { state: { items: ["initial"], observed: "not yet set" } },
    );

    renderSpec(spec);

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn"));
    });

    const state = JSON.parse(screen.getByTestId("state-probe").textContent!);
    expect(state.items).toEqual(["initial", "new-item"]);
    expect(state.observed).toEqual(["initial", "new-item"]);
  });

  it("multiple pushState chain resolves correctly", async () => {
    const spec = jsonsxRender(
      jsx(JButton, {
        label: "Go",
        on: {
          press: [
            { action: "pushState", params: { statePath: "/items", value: "a" } },
            { action: "pushState", params: { statePath: "/items", value: "b" } },
            {
              action: "setState",
              params: {
                statePath: "/snapshot",
                value: { $state: "/items" },
              },
            },
          ],
        },
      }),
      { state: { items: [], snapshot: null } },
    );

    renderSpec(spec);

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn"));
    });

    const state = JSON.parse(screen.getByTestId("state-probe").textContent!);
    expect(state.items).toEqual(["a", "b"]);
    expect(state.snapshot).toEqual(["a", "b"]);
  });
});

// =============================================================================
// Spec structural validity
// =============================================================================

describe("jsonsx spec structural validity", () => {
  it("all child references resolve to existing elements", () => {
    const spec = jsonsxRender(
      jsxs(JStack, {
        children: [
          jsxs(JCard, {
            title: "A",
            children: [
              jsx(JText, { content: "1" }),
              jsx(JText, { content: "2" }),
            ],
          }),
          jsx(JButton, { label: "Go" }),
        ],
      }),
    );

    for (const el of Object.values(spec.elements)) {
      if (el.children) {
        for (const childKey of el.children) {
          expect(
            spec.elements[childKey],
            `Missing element "${childKey}"`,
          ).toBeDefined();
        }
      }
    }
  });

  it("root element exists in elements map", () => {
    const spec = jsonsxRender(jsx(JCard, { title: "Root" }));
    expect(spec.elements[spec.root]).toBeDefined();
  });

  it("element count matches node count", () => {
    const spec = jsonsxRender(
      jsxs(JStack, {
        children: [
          jsx(JCard, { title: "A" }),
          jsx(JCard, { title: "B" }),
          jsx(JText, { content: "C" }),
        ],
      }),
    );
    expect(Object.keys(spec.elements)).toHaveLength(4);
  });
});

// =============================================================================
// Dynamic features (ported from json-render's dynamic-forms.test.tsx)
// =============================================================================

describe("jsonsx specs with dynamic features", () => {
  it("$state prop expressions resolve at render time", () => {
    const spec = jsonsxRender(
      jsx(JText, { content: { $state: "/message" } }),
      { state: { message: "Dynamic hello" } },
    );

    renderSpec(spec);
    expect(screen.getByTestId("text").textContent).toBe("Dynamic hello");
  });

  it("visibility condition hides element when false", () => {
    const spec = jsonsxRender(
      jsxs(JStack, {
        children: [
          jsx(JText, {
            content: "Visible",
            visible: { $state: "/show", eq: true },
          }),
        ],
      }),
      { state: { show: false } },
    );

    renderSpec(spec);
    expect(screen.queryByTestId("text")).toBeNull();
  });

  it("visibility condition shows element when true", () => {
    cleanup();
    const spec = jsonsxRender(
      jsxs(JStack, {
        children: [
          jsx(JText, {
            content: "Visible",
            visible: { $state: "/show", eq: true },
          }),
        ],
      }),
      { state: { show: true } },
    );

    renderSpec(spec);
    expect(screen.getByTestId("text").textContent).toBe("Visible");
  });

  it("watchers fire when watched state changes", async () => {
    const loadCities = mock();

    const spec = jsonsxRender(
      jsxs(JStack, {
        children: [
          jsx(JButton, {
            label: "Set Country",
            on: {
              press: {
                action: "setState",
                params: { statePath: "/country", value: "US" },
              },
            },
          }),
          jsx(JText, {
            content: "watcher",
            watch: {
              "/country": {
                action: "loadCities",
                params: { country: { $state: "/country" } },
              },
            },
          }),
        ],
      }),
      { state: { country: "" } },
    );

    renderSpec(spec, { loadCities });

    expect(loadCities).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn"));
    });

    expect(loadCities).toHaveBeenCalledTimes(1);
    expect(loadCities).toHaveBeenCalledWith(
      expect.objectContaining({ country: "US" }),
    );
  });
});

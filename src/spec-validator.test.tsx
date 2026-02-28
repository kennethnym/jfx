/**
 * Ported from json-render's core/src/spec-validator.test.ts.
 *
 * Runs @json-render/core's validateSpec against Specs produced by jrx
 * to prove structural correctness.
 */

import { describe, it, expect } from "bun:test";
import { validateSpec } from "@json-render/core";
import { render } from "./render";
import {
  Stack,
  Card,
  Text,
  Button,
  Badge,
  List,
  ListItem,
  Select,
} from "./test-components";

describe("validateSpec on jrx-produced specs", () => {
  it("validates a simple single-element spec", () => {
    const spec = render(<Text text="hello" />);
    const result = validateSpec(spec);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("validates a parent-child spec", () => {
    const spec = render(
      <Stack>
        <Text text="hello" />
      </Stack>,
    );
    const result = validateSpec(spec);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("validates a deep tree", () => {
    const spec = render(
      <Stack>
        <Card title="A">
          <Text text="1" />
          <Text text="2" />
        </Card>
        <Button label="Go" />
      </Stack>,
    );
    const result = validateSpec(spec);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("validates spec with visible at element level (not in props)", () => {
    const spec = render(
      <Text text="conditional" visible={{ $state: "/show" }} />,
    );
    const result = validateSpec(spec);
    expect(result.issues.some((i) => i.code === "visible_in_props")).toBe(false);
  });

  it("validates spec with on at element level (not in props)", () => {
    const spec = render(
      <Button label="Click" on={{ press: { action: "submit" } }} />,
    );
    const result = validateSpec(spec);
    expect(result.issues.some((i) => i.code === "on_in_props")).toBe(false);
  });

  it("validates spec with repeat at element level (not in props)", () => {
    const spec = render(
      <Stack repeat={{ statePath: "/items" }}>
        <Text text="item" />
      </Stack>,
    );
    const result = validateSpec(spec);
    expect(result.issues.some((i) => i.code === "repeat_in_props")).toBe(false);
  });

  it("validates spec with watch at element level (not in props)", () => {
    const spec = render(
      <Select
        label="Country"
        watch={{ "/form/country": { action: "loadCities" } }}
      />,
    );
    const result = validateSpec(spec);
    expect(result.issues.some((i) => i.code === "watch_in_props")).toBe(false);
  });

  it("no orphaned elements in jrx output", () => {
    const spec = render(
      <Stack>
        <Text text="A" />
        <Text text="B" />
      </Stack>,
    );
    const result = validateSpec(spec, { checkOrphans: true });
    expect(result.issues.some((i) => i.code === "orphaned_element")).toBe(false);
  });

  it("no missing children in jrx output", () => {
    const spec = render(
      <Stack>
        <Card title="X">
          <Text text="nested" />
          <Badge text="tag" />
        </Card>
        <Button label="action" />
      </Stack>,
    );
    const result = validateSpec(spec);
    expect(result.issues.some((i) => i.code === "missing_child")).toBe(false);
    expect(result.valid).toBe(true);
  });

  it("validates spec with state", () => {
    const spec = render(<Text text="stateful" />, {
      state: { count: 0, items: ["a", "b"] },
    });
    const result = validateSpec(spec);
    expect(result.valid).toBe(true);
  });

  it("validates spec with all features combined", () => {
    const spec = render(
      <Stack>
        <Text text="header" visible={{ $state: "/showHeader" }} />
        <List repeat={{ statePath: "/items", key: "id" }}>
          <ListItem
            title={{ $item: "name" }}
            on={{ press: { action: "selectItem" } }}
          />
        </List>
        <Select
          label="Country"
          watch={{ "/country": { action: "loadCities" } }}
        />
        <Button
          label="Submit"
          on={{
            press: [
              { action: "validateForm" },
              { action: "submitForm" },
            ],
          }}
        />
      </Stack>,
      { state: { showHeader: true, items: [], country: "" } },
    );

    const result = validateSpec(spec);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);

    for (const el of Object.values(spec.elements)) {
      const props = el.props as Record<string, unknown>;
      expect(props.visible).toBeUndefined();
      expect(props.on).toBeUndefined();
      expect(props.repeat).toBeUndefined();
      expect(props.watch).toBeUndefined();
    }
  });
});

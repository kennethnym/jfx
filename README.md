# jsonsx

JSX factory for [json-render](https://github.com/vercel-labs/json-render). Write JSX, get Spec JSON.

## Install

```bash
bun add jsonsx @json-render/core
```

## Setup

Configure your `tsconfig.json` to use jsonsx as the JSX source:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "jsonsx"
  }
}
```

Or use a per-file pragma:

```tsx
/** @jsxImportSource jsonsx */
```

## Usage

### Define components

Create wrapper functions that map JSX tags to json-render component type names:

```ts
import { jsx } from "jsonsx/jsx-runtime";
import type { JsonsxNode } from "jsonsx";

export function Stack(props: Record<string, unknown>): JsonsxNode {
  return jsx("Stack", props);
}

export function Text(props: Record<string, unknown>): JsonsxNode {
  return jsx("Text", props);
}

export function Button(props: Record<string, unknown>): JsonsxNode {
  return jsx("Button", props);
}
```

### Render JSX to Spec JSON

```tsx
import { render } from "jsonsx";
import { Stack, Text, Button } from "./components";

const spec = render(
  <Stack>
    <Text content="Hello from jsonsx!" />
    <Button label="Click me" />
  </Stack>
);
```

This produces:

```json
{
  "root": "stack-1",
  "elements": {
    "text-1": {
      "type": "Text",
      "props": { "content": "Hello from jsonsx!" }
    },
    "button-1": {
      "type": "Button",
      "props": { "label": "Click me" }
    },
    "stack-1": {
      "type": "Stack",
      "props": {},
      "children": ["text-1", "button-1"]
    }
  }
}
```

### State, events, visibility, and watchers

Pass json-render bindings as JSX props:

```tsx
const spec = render(
  <Stack>
    <Text content={{ $state: "/count" }} />
    <Button
      label="Increment"
      on={{
        press: {
          action: "increment",
          params: { statePath: "/count" },
        },
      }}
    />
    <Text
      content="Hidden until toggled"
      visible={{ $state: "/showDetails", eq: true }}
    />
  </Stack>,
  {
    state: {
      count: 0,
      showDetails: false,
    },
  }
);
```

The `render()` function accepts an options object with `state` to include initial state in the Spec output.

### Reserved props

These props are extracted from JSX and mapped to Spec fields rather than passed through as component props:

| Prop | Spec field | Description |
|---|---|---|
| `key` | element key | Explicit element key (overrides auto-generation) |
| `visible` | `visible` | Visibility condition |
| `on` | `on` | Event bindings |
| `repeat` | `repeat` | Repeat configuration |
| `watch` | `watch` | State watchers |
| `children` | `children` | Child element references |

## Example

The `example/` directory contains a Bun HTTP server that demonstrates jsonsx in action. It shows JSX source, live rendered UI (via `@json-render/react`), and JSON output side by side.

```bash
cd example
bun install
bun dev
```

This starts a dev server with HMR at `http://localhost:3000`.

## Development

```bash
bun install       # install dependencies
bun run build     # build dist/
bun test          # run tests
bun run typecheck # type check
```

## License

MIT

import { jsx } from "jfx/jsx-runtime";
import type { JfxNode } from "jfx";


export function Stack(props: Record<string, unknown>): JfxNode {
  return jsx("Stack", props);
}

export function Card(props: Record<string, unknown>): JfxNode {
  return jsx("Card", props);
}

export function Text(props: Record<string, unknown>): JfxNode {
  return jsx("Text", props);
}

export function Button(props: Record<string, unknown>): JfxNode {
  return jsx("Button", props);
}

export function Input(props: Record<string, unknown>): JfxNode {
  return jsx("Input", props);
}

import { jsx } from "jsonsx/jsx-runtime";
import type { JsonsxNode } from "jsonsx";


export function Stack(props: Record<string, unknown>): JsonsxNode {
  return jsx("Stack", props);
}

export function Card(props: Record<string, unknown>): JsonsxNode {
  return jsx("Card", props);
}

export function Text(props: Record<string, unknown>): JsonsxNode {
  return jsx("Text", props);
}

export function Button(props: Record<string, unknown>): JsonsxNode {
  return jsx("Button", props);
}

export function Input(props: Record<string, unknown>): JsonsxNode {
  return jsx("Input", props);
}

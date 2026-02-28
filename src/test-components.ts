import { jsx } from "./jsx-runtime";
import type { JfxNode } from "./types";

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

export function Badge(props: Record<string, unknown>): JfxNode {
  return jsx("Badge", props);
}

export function List(props: Record<string, unknown>): JfxNode {
  return jsx("List", props);
}

export function ListItem(props: Record<string, unknown>): JfxNode {
  return jsx("ListItem", props);
}

export function Select(props: Record<string, unknown>): JfxNode {
  return jsx("Select", props);
}

export function Input(props: Record<string, unknown>): JfxNode {
  return jsx("Input", props);
}

export function Divider(props: Record<string, unknown>): JfxNode {
  return jsx("Divider", props);
}

import { jsx } from "@nym.sh/jrx/jsx-runtime";
import type { JrxNode } from "@nym.sh/jrx";


export function Stack(props: Record<string, unknown>): JrxNode {
  return jsx("Stack", props);
}

export function Card(props: Record<string, unknown>): JrxNode {
  return jsx("Card", props);
}

export function Text(props: Record<string, unknown>): JrxNode {
  return jsx("Text", props);
}

export function Button(props: Record<string, unknown>): JrxNode {
  return jsx("Button", props);
}

export function Input(props: Record<string, unknown>): JrxNode {
  return jsx("Input", props);
}

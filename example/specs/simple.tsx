/** @jsxImportSource jrx */
import { render } from "jrx";
import { Stack, Text, Button } from "../components";

export const simpleSpec = render(
  <Stack>
    <Text content="Hello from jrx!" />
    <Button label="Click me" />
  </Stack>
);

/** @jsxImportSource jfx */
import { render } from "jfx";
import { Stack, Text, Button } from "../components";

export const simpleSpec = render(
  <Stack>
    <Text content="Hello from jfx!" />
    <Button label="Click me" />
  </Stack>
);

/** @jsxImportSource jsonsx */
import { render } from "jsonsx";
import { Stack, Text, Button } from "../components";

export const simpleSpec = render(
  <Stack>
    <Text content="Hello from jsonsx!" />
    <Button label="Click me" />
  </Stack>
);

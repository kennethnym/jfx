/** @jsxImportSource jrx */
import { render } from "jrx";
import { Stack, Card, Text, Button, Input } from "../components";

export const fullSpec = render(
  <Stack>
    <Card title="Counter">
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
    </Card>

    <Card title="Toggle Details">
      <Button
        label={{
          $cond: { $state: "/showDetails", eq: true },
          $then: "Hide Details",
          $else: "Show Details",
        }}
        on={{
          press: {
            action: "setState",
            params: {
              statePath: "/showDetails",
              value: {
                $cond: { $state: "/showDetails", eq: true },
                $then: false,
                $else: true,
              },
            },
          },
        }}
      />
      <Text
        content="These are the hidden details!"
        visible={{ $state: "/showDetails", eq: true }}
      />
    </Card>

    <Card title="Watched Input">
      <Input
        placeholder="Type a country..."
        value={{ $bindState: "/country" }}
      />
      <Text
        content={{ $state: "/country" }}
        watch={{
          "/country": {
            action: "logCountry",
            params: { country: { $state: "/country" } },
          },
        }}
      />
    </Card>
  </Stack>,
  {
    state: {
      count: 0,
      showDetails: false,
      country: "",
    },
  }
);

import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

export const catalog = defineCatalog(schema, {
  components: {
    Stack: {
      props: z.object({
        direction: z.enum(["vertical", "horizontal"]).nullable(),
        gap: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      slots: ["default"],
      description: "Flex container for layouts",
    },
    Card: {
      props: z.object({
        title: z.string().nullable(),
      }),
      slots: ["default"],
      description: "Container card for grouping content",
    },
    Text: {
      props: z.object({
        content: z.string(),
      }),
      description: "Display text",
    },
    Button: {
      props: z.object({
        label: z.string(),
      }),
      description: "Clickable button. Bind on.press for handler.",
    },
    Input: {
      props: z.object({
        placeholder: z.string().nullable(),
      }),
      description: "Text input field",
    },
  },
  actions: {
    increment: {
      params: z.object({
        statePath: z.string(),
      }),
      description: "Increment a numeric state value by 1",
    },
    logCountry: {
      params: z.object({
        country: z.string(),
      }),
      description: "Log the selected country",
    },
  },
});

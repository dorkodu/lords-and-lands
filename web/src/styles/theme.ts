import { MantineTheme, MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  globalStyles: (_theme: MantineTheme) => ({
    body: {
      overscrollBehavior: "contain",
    },
  }),

  colorScheme: "dark",
  primaryColor: "green",

  defaultRadius: "md",
  cursorType: "pointer",
  focusRing: "auto",
  loader: "dots",
}
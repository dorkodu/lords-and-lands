import { MantineProvider } from "@mantine/core";
import { Outlet, ScrollRestoration } from "react-router-dom"
import { theme } from "./styles/theme";

export default function App() {
  return (
    <>
      <MantineProvider theme={{ ...theme }} withNormalizeCSS withGlobalStyles>
        <Outlet />
      </MantineProvider>

      <ScrollRestoration />
    </>
  )
}
import { MantineProvider } from "@mantine/core";
import { useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom"
import { useAppStore } from "./stores/appStore";
import { theme } from "./styles/theme";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.indexOf("/chat") !== -1) useAppStore.setState(s => { s.route = "chat" });
    else if (location.pathname.indexOf("/game") !== -1) useAppStore.setState(s => { s.route = "game" });
    else if (location.pathname.indexOf("/join-lobby") !== -1) useAppStore.setState(s => { s.route = "join-lobby" });
    else if (location.pathname.indexOf("/lobby") !== -1) useAppStore.setState(s => { s.route = "lobby" });
    else if (location.pathname.indexOf("/lobby-preview") !== -1) useAppStore.setState(s => { s.route = "lobby-preview" });
    else if (location.pathname.indexOf("/main-menu") !== -1) useAppStore.setState(s => { s.route = "main-menu" });
    else if (location.pathname.indexOf("/settings") !== -1) useAppStore.setState(s => { s.route = "settings" });
    else if (location.pathname.indexOf("/saves") !== -1) useAppStore.setState(s => { s.route = "saves" });
    else useAppStore.setState(s => { s.route = "any" });
  }, [location.pathname]);

  return (
    <>
      <MantineProvider theme={{ ...theme }} withNormalizeCSS withGlobalStyles>
        <Outlet />
      </MantineProvider>

      <ScrollRestoration />
    </>
  )
}
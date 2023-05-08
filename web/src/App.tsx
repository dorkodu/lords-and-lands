import { MantineProvider } from "@mantine/core";
import { useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation, useNavigate } from "react-router-dom"
import { useAppStore } from "./stores/appStore";
import { theme } from "./styles/theme";
import "./lib/socketio";
import { useGameStore } from "./stores/gameStore";
import { game } from "@core/game";
import { assets } from "./assets/assets";
import ModalQuitLobby from "./components/modals/ModalQuitLobby";
import ModalUpdateSW from "./components/modals/ModalUpdateSW";
import ModalLobbyOnline from "./components/modals/ModalLobbyOnline";
import ModalPlayerWin from "./components/modals/ModalPlayerWin";
import ModalNextTurn from "./components/modals/ModalNextTurn";
import ModalTutorial from "./components/modals/ModalTutorial";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ModalAccount from "./components/modals/ModalUser";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = useAppStore(state => state.redirect);
  const turn = useGameStore(state => state.data.turn.type);

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

  useEffect(() => { redirect && navigate(redirect) }, [redirect]);

  useEffect(() => {
    let country = game.util.turnTypeToCountryId(turn);
    const icon = document.querySelector('link[rel="icon"') as HTMLLinkElement | null;
    if (!icon) return;
    icon.href = assets.countryIdToUnitSrc(country) ?? icon.href;
  }, [turn]);

  return (
    <>
      <GoogleOAuthProvider clientId="545347259439-fv1hu4n6nf2vacoe2qbsr3com41ta74u.apps.googleusercontent.com">
        <MantineProvider theme={{ ...theme }} withNormalizeCSS withGlobalStyles>
          <Outlet />

          <ModalAccount />
          <ModalTutorial />
          <ModalLobbyOnline />
          <ModalQuitLobby />
          <ModalNextTurn />
          <ModalPlayerWin />
          <ModalUpdateSW />
        </MantineProvider>
      </GoogleOAuthProvider>

      <ScrollRestoration />
    </>
  )
}
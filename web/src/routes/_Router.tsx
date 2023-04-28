import React, { Suspense } from "react";
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router-dom";
import App from "../App";
import CenterLoader from "@/components/loaders/CenterLoader";
import { useWait } from "../components/hooks";

// Lazy routes \\
const LazyMainMenu = React.lazy(useWait(() => import("./MainMenu")));
const LazyLobby = React.lazy(useWait(() => import("./Lobby")));
const LazyJoinLobby = React.lazy(useWait(() => import("./JoinLobby")));
const LazyLobbyPreview = React.lazy(useWait(() => import("./LobbyPreview")));
const LazyChat = React.lazy(useWait(() => import("./Chat")));
const LazySettings = React.lazy(useWait(() => import("./Settings")));
const LazySaves = React.lazy(useWait(() => import("./Saves")));
const LazyGame = React.lazy(useWait(() => import("./Game")));
const LazyNotFound = React.lazy(useWait(() => import("./NotFound")));
// Lazy routes \\

const MainMenu = <Suspense fallback={<CenterLoader />}><LazyMainMenu /></Suspense>
const Lobby = <Suspense fallback={<CenterLoader />}><LazyLobby /></Suspense>
const JoinLobby = <Suspense fallback={<CenterLoader />}><LazyJoinLobby /></Suspense>
const LobbyPreview = <Suspense fallback={<CenterLoader />}><LazyLobbyPreview /></Suspense>
const Chat = <Suspense fallback={<CenterLoader />}><LazyChat /></Suspense>
const Settings = <Suspense fallback={<CenterLoader />}><LazySettings /></Suspense>
const Saves = <Suspense fallback={<CenterLoader />}><LazySaves /></Suspense>
const Game = <Suspense fallback={<CenterLoader />}><LazyGame /></Suspense>
const NotFound = <Suspense fallback={<CenterLoader />}><LazyNotFound /></Suspense>

// Lazy layouts \\
const DefaultLayout = React.lazy(useWait(() => import("../components/layouts/DefaultLayout")));
// Lazy layouts \\

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Navigate to "/main-menu" on path "/" */}
      <Route index element={<Navigate to="/main-menu" />} />

      <Route path="/main-menu" element={MainMenu} />
      <Route path="/lobby-preview" element={LobbyPreview} />
      <Route path="/game" element={Game} />

      <Route element={<Suspense fallback={<CenterLoader />}><DefaultLayout /></Suspense>}>
        <Route path="/lobby" element={Lobby} />
        <Route path="/join-lobby" element={JoinLobby} />
        <Route path="/chat" element={Chat} />
        <Route path="/settings" element={Settings} />
        <Route path="/saves" element={Saves} />
      </Route>

      {/* Error routes & catch all */}
      <Route path="/404" element={NotFound} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Route>
  )
)

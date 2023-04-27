import CenterLoader from "@/components/loaders/CenterLoader";
import React, { Suspense } from "react";
import { createHashRouter, createRoutesFromElements, Navigate, Route } from "react-router-dom";
import App from "../App";
import { useWait } from "../components/hooks";

// Lazy routes \\
const LazyGame = React.lazy(useWait(() => import("./Game")));
const LazyNotFound = React.lazy(useWait(() => import("./NotFound")));
// Lazy routes \\

const Game = <Suspense fallback={<CenterLoader />}><LazyGame /></Suspense>
const NotFound = <Suspense fallback={<CenterLoader />}><LazyNotFound /></Suspense>

export const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Navigate to "/game" on path "/" */}
      <Route index element={<Navigate to="/game" />} />

      <Route path="/game" element={Game} />

      {/* Error routes & catch all */}
      <Route path="/404" element={NotFound} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Route>
  )
)

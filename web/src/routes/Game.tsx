import Header from "@/components/_game/Header";
import Footer from "@/components/_game/Footer";
import Map from "@/components/_game/Map";
import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { useAppStore } from "@/stores/appStore";
import { socketio } from "@/lib/socketio";
import { ActionId } from "@core/types/action_id";

export default function Game() {
  useEffect(() => {
    const online = useAppStore.getState().lobby.online;

    useGameStore.setState(s => {
      if (s.data.running) return;

      if (online) {
        socketio.emit("client-game-action", { id: ActionId.Start, info: {} });
      }
      else {
        game.play.start(s.data, {});
      }
    });

    useGameStore.setState(s => {
      if (online) {
        const players = useAppStore.getState().lobby.players;
        const playerId = useAppStore.getState().lobby.playerId;
        const player = players.filter(p => p.id === playerId)[0];
        const country = player && s.data.countries.filter(c => c.id === player.country)[0];
        if (country) s.country = country;
      }
      else {
        s.country = game.util.turnTypeToCountry(s.data, s.data.turn.type);
      }
    });
  }, []);

  return (
    <>
      <Header />
      <Footer />

      <Map />
    </>
  )
}

import Header from "@/components/_game/Header";
import Footer from "@/components/_game/Footer";
import Map from "@/components/_game/Map";
import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { useAppStore } from "@/stores/appStore";
import { socketio } from "@/lib/socketio";
import { ActionId } from "@core/types/action_id";
import { util } from "@/lib/util";

export default function Game() {
  useEffect(() => {
    const lobby = useAppStore.getState().lobby;

    useGameStore.setState(s => {
      if (s.data.running) return;

      if (lobby.online) {
        socketio.emit("client-game-action", { id: ActionId.Start, info: {} });
      }
      else {
        lobby.players.forEach(p => game.play.addCountry(s.data, { country: p.country }));
        game.play.generate(s.data, { w: s.data.width, h: s.data.height, seed: s.data.seed });

        game.play.start(s.data, {});
        util.skipAITurns(s.data);
        s.country = util.getLocalCountry(s.data);
      }
    });

    useGameStore.setState(s => {
      if (lobby.online) {
        const player = lobby.players.filter(p => p.id === lobby.playerId)[0];
        const country = player && s.data.countries.filter(c => c.id === player.country)[0];
        if (country) s.country = country;
      }
      else {

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

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
    const data = useGameStore.getState().data;
    const lobby = useAppStore.getState().lobby;

    useGameStore.setState(s => {
      if (s.data.running) return;

      if (lobby.online) {
        socketio.emit("client-game-action", { id: ActionId.Start, info: {} });
      }
      else {
        lobby.players.forEach(p => game.play.addCountry(s.data, { country: p.country }));

        // If map is not generated ex. player directly entered to /game route
        if (data.tiles.length === 0) {
          game.play.generate(s.data, { w: s.data.width, h: s.data.height, seed: s.data.seed });
        }

        game.play.start(s.data, {});
        util.skipAITurns(s.data);
        s.country = util.getLocalCountry(s.data);
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

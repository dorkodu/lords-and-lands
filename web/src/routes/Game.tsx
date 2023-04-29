import Header from "@/components/_game/Header";
import Footer from "@/components/_game/Footer";
import Map from "@/components/_game/Map";
import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { useAppStore } from "@/stores/appStore";
import { socketio } from "@/lib/socketio";
import { ActionId } from "@core/types/action_id";

//import { CountryId } from "@core/types/country_id";

export default function Game() {
  useEffect(() => {
    const online = useAppStore.getState().lobby.online;

    useGameStore.setState(s => {
      if (s.data.running) return;

      //s.data = game.createGameData();
      //game.play.addCountry(s.data, { country: CountryId.Green });
      //game.play.addCountry(s.data, { country: CountryId.Red });
      //game.play.generate(s.data, { w: 10, h: 10, seed: 123 });

      if (online) {
        socketio.emit("client-game-action", { id: ActionId.Generate, info: { w: s.data.width, h: s.data.height, seed: s.data.seed } });
        socketio.emit("client-game-action", { id: ActionId.Start, info: {} });
      }
      else {
        game.play.generate(s.data, { w: s.data.width, h: s.data.height, seed: s.data.seed });
        game.play.start(s.data, {});

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

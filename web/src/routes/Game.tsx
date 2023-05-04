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
//import { ai } from "@core/lib/ai";
//import { CountryId } from "@core/types/country_id";
//import { useHotkeys } from "@mantine/hooks";
//import { createGameData } from "@core/gamedata";
//import { createSeedRandom } from "@core/lib/seed_random";

export default function Game() {
  useEffect(() => {
    const lobby = useAppStore.getState().lobby;

    useGameStore.setState(s => {
      if (s.data.running) return;

      //game.play.addCountry(s.data, { country: CountryId.Green })
      //game.play.addCountry(s.data, { country: CountryId.Purple })
      //game.play.addCountry(s.data, { country: CountryId.Red })
      //game.play.addCountry(s.data, { country: CountryId.Yellow })
      //game.play.generate(s.data, { w: 15, h: 15, seed: 123 })
      //s.data.rng = createSeedRandom(123);

      if (lobby.online) {
        socketio.emit("client-game-action", { id: ActionId.Start, info: {} });

        const player = lobby.players.filter(p => p.id === lobby.playerId)[0];
        const country = player && s.data.countries.filter(c => c.id === player.country)[0];
        if (country) s.country = country;
      }
      else {
        lobby.players.forEach(p => game.play.addCountry(s.data, { country: p.country }));
        game.play.generate(s.data, { w: s.data.width, h: s.data.height, seed: s.data.seed });

        game.play.start(s.data, {});
        util.skipAITurns(s.data);
        s.country = util.getLocalCountry(s.data);
      }
    });
  }, []);

  //useHotkeys([
  //  [
  //    "Enter",
  //    () => {
  //      //console.time("Game")
  //      //let countries = useGameStore.getState().data.countries.length;
  //      //
  //      //while (countries !== 1) {
  //      let country = CountryId.None;
  //
  //      function aiModifier() {
  //        switch (country) {
  //          case CountryId.Green: return +3;
  //          case CountryId.Purple: return +1;
  //          case CountryId.Red: return -1;
  //          case CountryId.Yellow: return -3;
  //          default: return 0;
  //        }
  //      }
  //
  //      useGameStore.setState(s => {
  //        country = game.util.turnTypeToCountryId(s.data.turn.type);
  //        ai.play(s.data, country, aiModifier());
  //        game.play.nextTurn(s.data, { country: country });
  //        country = game.util.turnTypeToCountryId(s.data.turn.type);
  //        s.country = s.data.countries.filter(c => c.id === country)[0];
  //      });
  //
  //      //countries = useGameStore.getState().data.countries.length;
  //      //}
  //      //console.timeEnd("Game")
  //    }
  //  ],
  //]);

  return (
    <>
      <Header />
      <Footer />

      <Map />
    </>
  )
}

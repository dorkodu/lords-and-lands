import Header from "@/components/_game/Header";
import Footer from "@/components/_game/Footer";
import Map from "@/components/_game/Map";
import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { CountryId } from "@core/types/country_id";

export default function Game() {
  useEffect(() => {
    useGameStore.setState(s => {
      s.data = game.createGameData(Date.now());
      game.play.addCountry(s.data, { country: CountryId.Green });
      game.play.addCountry(s.data, { country: CountryId.Red });
      game.play.generate(s.data, { w: 10, h: 10 });
      game.play.start(s.data, {});
      s.country = game.util.turnTypeToCountry(s.data, s.data.turn.type);
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

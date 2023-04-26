import Header from "@/components/game/Header";
import Footer from "@/components/game/Footer";
import Map from "@/components/game/Map";
import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { CountryId } from "@core/types/country_id";

export default function Game() {
  useEffect(() => {
    useGameStore.setState(s => {
      s.data = game.createGameData(Date.now());
      game.play.addCountry(s.data, CountryId.Green);
      game.play.addCountry(s.data, CountryId.Purple);
      game.play.generate(s.data, 10, 10);
      game.play.start(s.data);
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

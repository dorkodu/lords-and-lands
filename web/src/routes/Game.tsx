import Header from "@/components/game/Header";
import Footer from "@/components/game/Footer";
import Map from "@/components/game/Map";
import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";

export default function Game() {
  useEffect(() => {
    useGameStore.setState(s => {
      s.data = game.createGameData(Date.now());
      game.play.generate(s.data, 10, 10);
      game.play.addCountry();
      game.play.addCountry();
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

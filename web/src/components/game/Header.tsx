import { useGameStore } from "@/stores/gameStore";
import { TurnType } from "@core/types/turn_type";
import { Flex, createStyles } from "@mantine/core";

import UnitGreen from "@/assets/units/green.png";
import UnitPurple from "@/assets/units/purple.png";
import UnitRed from "@/assets/units/red.png";
import UnitYellow from "@/assets/units/yellow.png";
import LandmarkBanner from "@/assets/landmarks/banner.png";
import LandmarkChest from "@/assets/landmarks/chest.png";
import { game } from "@core/game";

const useStyles = createStyles((_theme) => ({
  header: {
    position: "absolute",
    left: 0,
    right: 0,

    height: "64px",
    zIndex: 1,

    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))",
  },
}))

export default function Header() {
  const { classes } = useStyles();
  const data = useGameStore(state => state.data);

  return (
    <Flex className={classes.header} direction="row" align="center" justify="center" gap="md">
      <Flex>
        {[-4, -3, -2, -1].map((v, i) =>
          <img src={turnTypeToSrc(game.play.getTurnType(data, data.turn.count + v))} style={{ width: 32, height: 32 }} key={i} />
        )}
        <img src={turnTypeToSrc(data.turn.type)} style={{ width: 64, height: 64 }} />

        {[1, 2, 3, 4].map((v, i) =>
          <img src={turnTypeToSrc(game.play.getTurnType(data, data.turn.count + v))} style={{ width: 32, height: 32 }} key={i} />
        )}
      </Flex>
    </Flex>
  )
}

function turnTypeToSrc(type: TurnType) {
  switch (type) {
    case TurnType.CountryGreen: return UnitGreen;
    case TurnType.CountryPurple: return UnitPurple;
    case TurnType.CountryRed: return UnitRed;
    case TurnType.CountryYellow: return UnitYellow;

    case TurnType.Banner: return LandmarkBanner;
    case TurnType.Chest: return LandmarkChest;
    default: return undefined;
  }
}
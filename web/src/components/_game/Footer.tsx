import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { Flex, createStyles, ActionIcon } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { IconArrowRight, IconMessageCircle2, IconWorld } from "@tabler/icons-react";

const useStyles = createStyles((_theme) => ({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    height: "64px",
    zIndex: 1,

    backgroundImage: "linear-gradient(0deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))",
  },
}))

export default function Footer() {
  const { classes } = useStyles();

  const onClickLobby = () => { }
  const onClickChat = () => { }
  const onClickNextTurn = () => {
    useGameStore.setState(s => {
      game.play.nextTurn(s.data, { country: s.country?.id });
      s.country = game.util.turnTypeToCountry(s.data, s.data.turn.type);
    })
  }

  useHotkeys([
    ["1", () => onClickLobby()],
    ["2", () => onClickChat()],
    ["3", () => onClickNextTurn()],
  ]);

  return (
    <Flex className={classes.footer} direction="row" align="center" justify="center" gap="md">

      <ActionIcon variant="filled" size={32} onClick={onClickLobby}>
        <IconWorld />
      </ActionIcon>

      <ActionIcon variant="filled" size={32} onClick={onClickChat}>
        <IconMessageCircle2 />
      </ActionIcon>

      <ActionIcon variant="filled" size={32} onClick={onClickNextTurn}>
        <IconArrowRight />
      </ActionIcon>

    </Flex>
  )
}
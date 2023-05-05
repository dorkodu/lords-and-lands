import { util } from "@/lib/util";
import { useAppStore } from "@/stores/appStore";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { Flex, createStyles, ActionIcon, Tooltip, useMantineTheme } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { IconArrowRight, IconFocusCentered, IconWorld } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import CustomMessageIcon from "../custom/CustomMessageIcon";

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
  const navigate = useNavigate();
  const { classes } = useStyles();
  const theme = useMantineTheme();

  const data = useGameStore(state => state.data);
  const country = useGameStore(state => state.country);

  const onClickLobby = () => { navigate("/lobby") }
  const onClickChat = () => { navigate("/chat") }
  const onClickNextTurn = () => {
    const actable = game.play.nextTurnActable(data, { country: country?.id });
    if (!actable) return;

    const didAction = useGameStore.getState().didAction;

    // If didn't do action, show "ModalNextTurn"
    if (!didAction) {
      useAppStore.setState(s => { s.modals.showNextTurn = true });
      return;
    }

    util.nextTurn();
  }
  const onClickCenter = () => { useGameStore.getState().map.center() }

  useHotkeys([
    ["Escape", () => onClickLobby()],
    ["1", () => onClickLobby()],
    ["2", () => onClickChat()],
    ["3", () => onClickNextTurn()],
    ["4", () => onClickCenter()],
  ]);

  return (
    <Flex className={classes.footer} direction="row" align="center" justify="center" gap="md">

      <Tooltip label="Lobby (1)" events={{ hover: true, focus: false, touch: true }}>
        <ActionIcon variant="filled" size={32} onClick={onClickLobby}>
          <IconWorld />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Chat (2)" events={{ hover: true, focus: false, touch: true }}>
        <ActionIcon variant="filled" size={32} onClick={onClickChat}>
          <CustomMessageIcon />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Next Turn (3)" events={{ hover: true, focus: false, touch: true }}>
        <ActionIcon
          variant="filled"
          size={32}
          onClick={onClickNextTurn}
          disabled={!game.play.nextTurnActable(data, { country: country?.id })}
        >
          <IconArrowRight />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Center (4)" events={{ hover: true, focus: false, touch: true }}>
        <ActionIcon
          variant="filled"
          size={32}
          onClick={onClickCenter}
          style={{ position: "absolute", right: theme.spacing.md }}
        >
          <IconFocusCentered />
        </ActionIcon>
      </Tooltip>

    </Flex>
  )
}
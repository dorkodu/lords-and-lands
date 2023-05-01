import { socketio } from "@/lib/socketio";
import { useAppStore } from "@/stores/appStore";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { ActionId } from "@core/types/action_id";
import { Flex, createStyles, ActionIcon, Tooltip } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { IconArrowRight, IconWorld } from "@tabler/icons-react";
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

  const data = useGameStore(state => state.data);
  const country = useGameStore(state => state.country);

  const onClickLobby = () => { navigate("/lobby") }
  const onClickChat = () => { navigate("/chat") }
  const onClickNextTurn = () => {
    const online = useAppStore.getState().lobby.online;

    useGameStore.setState(s => {
      if (online) {
        // If next turn action is actable
        if (game.play.nextTurnActable(s.data, { country: s.country?.id })) {
          socketio.emit("client-game-action", { id: ActionId.NextTurn, info: {} });
        }
      }
      else {
        game.play.nextTurn(s.data, { country: s.country?.id });
        s.country = game.util.turnTypeToCountry(s.data, s.data.turn.type);
      }

      // Clear any previous tile selections (excluding hovered tile)
      s.moveableTiles = [];
      s.selectedUnitTile = undefined;
    });
  }

  useHotkeys([
    ["1", () => onClickLobby()],
    ["2", () => onClickChat()],
    ["3", () => onClickNextTurn()],
  ]);

  return (
    <Flex className={classes.footer} direction="row" align="center" justify="center" gap="md">

      <Tooltip label="Lobby" events={{ hover: true, focus: false, touch: true }}>
        <ActionIcon variant="filled" size={32} onClick={onClickLobby}>
          <IconWorld />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Chat" events={{ hover: true, focus: false, touch: true }}>
        <ActionIcon variant="filled" size={32} onClick={onClickChat}>
          <CustomMessageIcon />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Next Turn" events={{ hover: true, focus: false, touch: true }}>
        <ActionIcon
          variant="filled"
          size={32}
          onClick={onClickNextTurn}
          disabled={!game.play.nextTurnActable(data, { country: country?.id })}
        >
          <IconArrowRight />
        </ActionIcon>
      </Tooltip>

    </Flex>
  )
}
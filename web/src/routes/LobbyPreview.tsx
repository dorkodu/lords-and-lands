import Map from "@/components/_game/Map";
import { socketio } from "@/lib/socketio";
import { useAppStore } from "@/stores/appStore";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { ActionId } from "@core/types/action_id";
import { ActionIcon, createStyles, Flex, Tooltip, useMantineTheme } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { IconArrowLeft, IconFocusCentered, IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LobbyPreview() {
  useEffect(() => {
    const lobby = useAppStore.getState().lobby;

    useGameStore.setState(s => {
      if (s.data.tiles.length !== 0) return;

      const info = { w: s.data.width, h: s.data.height, seed: s.data.seed };

      if (!lobby.online) {
        lobby.players.forEach(p => game.play.addCountry(s.data, { country: p.country }));
        game.play.generate(s.data, info);
      }
      else if (lobby.online && lobby.owner) {
        socketio.emit("client-game-action", { id: ActionId.Generate, info });
      }
    });
  }, []);

  return (
    <>
      <Map />
      <Footer />
    </>
  )
}

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

function Footer() {
  const navigate = useNavigate();
  const { classes } = useStyles();
  const theme = useMantineTheme();

  const lobbyOwner = useAppStore(state => state.lobby.owner);
  const running = useGameStore(state => state.data.running);

  const onClickLobby = () => {
    navigate("/lobby")
  }
  const onClickGenerate = () => {
    const online = useAppStore.getState().lobby.online;

    useGameStore.setState(s => {
      // Generate new seed on every map generation
      const seed = Date.now();
      const info = { w: s.data.width, h: s.data.height, seed };
      if (online) socketio.emit("client-game-action", { id: ActionId.Generate, info });
      else game.play.generate(s.data, info);
    });
  }
  const onClickCenter = () => { useGameStore.getState().map.center() }

  useHotkeys([
    ["Escape", onClickLobby],
    ["1", () => onClickLobby()],
    ["2", () => onClickGenerate()],
    ["3", () => onClickCenter()],
  ]);

  return (
    <Flex className={classes.footer} direction="row" align="center" justify="center" gap="md">

      <Tooltip label="Go Back (1)" events={{ hover: true, focus: false, touch: true }}>
        <ActionIcon variant="filled" size={32} onClick={onClickLobby}>
          <IconArrowLeft />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Re-generate (2)" events={{ hover: true, focus: false, touch: true }}>
        <ActionIcon variant="filled" size={32} onClick={onClickGenerate} disabled={!lobbyOwner || running}>
          <IconRefresh />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Center (3)" events={{ hover: true, focus: false, touch: true }}>
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
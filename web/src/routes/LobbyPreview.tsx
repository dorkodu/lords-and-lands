import Map from "@/components/_game/Map";
import { socketio } from "@/lib/socketio";
import { useAppStore } from "@/stores/appStore";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { ActionId } from "@core/types/action_id";
import { ActionIcon, createStyles, Flex } from "@mantine/core";
import { IconArrowLeft, IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LobbyPreview() {
  useEffect(() => {
    const online = useAppStore.getState().lobby.online;
    const owner = useAppStore.getState().lobby.owner;

    const w = useAppStore.getState().lobby.map.width;
    const h = useAppStore.getState().lobby.map.height;
    const seed = useAppStore.getState().lobby.map.seed;
    const info = { w, h, seed };

    useGameStore.setState(s => {
      if (s.data.tiles.length !== 0) return;
      if (!online) game.play.generate(s.data, { w, h, seed });
      else if (online && owner) socketio.emit("client-game-action", { id: ActionId.Generate, info });
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
  const lobbyOwner = useAppStore(state => state.lobby.owner);

  const onClickLobby = () => {
    navigate("/lobby")
  }

  const onClickGenerate = () => {
    const online = useAppStore.getState().lobby.online;

    // Generate new seed on every map generation
    const map = { ...useAppStore.getState().lobby.map, seed: Date.now() };

    useAppStore.setState(s => { s.lobby.map = map });

    useGameStore.setState(s => {
      const info = { w: map.width, h: map.height, seed: map.seed }
      if (online) socketio.emit("client-game-action", { id: ActionId.Generate, info })
      else game.play.generate(s.data, info);
    });
  }

  return (
    <Flex className={classes.footer} direction="row" align="center" justify="center" gap="md">

      <ActionIcon variant="filled" size={32} onClick={onClickLobby}>
        <IconArrowLeft />
      </ActionIcon>

      {lobbyOwner &&
        <ActionIcon variant="filled" size={32} onClick={onClickGenerate}>
          <IconRefresh />
        </ActionIcon>
      }

    </Flex>
  )
}
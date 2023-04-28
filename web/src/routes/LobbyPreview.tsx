import Map from "@/components/_game/Map";
import { useAppStore } from "@/stores/appStore";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { ActionIcon, createStyles, Flex } from "@mantine/core";
import { IconArrowLeft, IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LobbyPreview() {
  useEffect(() => {
    const w = useAppStore.getState().lobby.map.width;
    const h = useAppStore.getState().lobby.map.height;

    useGameStore.setState(s => {
      if (s.data.tiles.length !== 0) return;
      game.play.generate(s.data, { w, h });
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
    const map = useAppStore.getState().lobby.map;
    useGameStore.setState(s => { game.play.generate(s.data, { w: map.width, h: map.height }) })
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
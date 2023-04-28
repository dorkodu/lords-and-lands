import { ActionIcon, Button, Divider, Flex, NumberInput, Text, Title } from "@mantine/core";
import {
  IconArrowBigLeftFilled,
  IconArrowBigRightFilled,
  IconArrowRight,
  IconBan,
  IconCopy,
  IconDeviceFloppy,
  IconLogin,
  IconLogout,
  IconMessageCircle2,
  IconSettings,
  IconStarFilled
} from "@tabler/icons-react";
import { IPlayer } from "@/types/player";
import { useAppStore } from "@/stores/appStore";
import { assets } from "@/assets/assets";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";

export default function Lobby() {
  const navigate = useNavigate();

  const lobby = useAppStore(state => state.lobby);

  const toggleLobbyStatus = () => {
    useAppStore.setState(s => { s.lobby.online = !s.lobby.online });
  }

  const onClickSettings = () => { navigate("/settings") }
  const onClickSaves = () => { navigate("/saves") }
  const onClickChat = () => { navigate("/chat") }
  const onClickGame = () => { navigate("/game") }

  return (
    <Flex direction="column" align="center" gap="md">

      <Flex gap="md">
        <ActionIcon onClick={toggleLobbyStatus} disabled={!lobby.owner}>
          <IconArrowBigLeftFilled />
        </ActionIcon>

        <Text>{lobby.online ? "Online" : "Offline"}</Text>

        <ActionIcon onClick={toggleLobbyStatus} disabled={!lobby.owner}>
          <IconArrowBigRightFilled />
        </ActionIcon>
      </Flex>

      <Flex gap="md">
        <Text>Lobby ID: {lobby.id}</Text>
        <ActionIcon>
          <IconCopy />
        </ActionIcon>
      </Flex>

      <Flex gap="md">
        <ActionIcon onClick={onClickSettings}>
          <IconSettings />
        </ActionIcon>

        <ActionIcon onClick={onClickSaves}>
          <IconDeviceFloppy />
        </ActionIcon>

        <ActionIcon onClick={onClickChat}>
          <IconMessageCircle2 />
        </ActionIcon>

        <ActionIcon onClick={onClickGame}>
          <IconArrowRight />
        </ActionIcon>
      </Flex>

      <Players />
      <Map />
    </Flex>
  )
}

function Players() {
  const players = useAppStore(state => state.lobby.players);

  if (players.length === 0) return null;
  return (
    <Flex direction="column" gap="xs">
      <Divider />
      {players.map((player, i) => <Player player={player} key={i} />)}
    </Flex>
  )
}

function Player({ player }: { player: IPlayer }) {
  const playerExist = !!player.id;
  const lobbyOwner = useAppStore(state => state.lobby.owner);

  const showBan = lobbyOwner && playerExist;
  const showLogin = !playerExist;
  const showLogout = playerExist;

  const onClickBan = () => {

  }

  const onClickLogin = () => {
    let done = false;
    if (playerExist) return;

    useAppStore.setState(s => {
      const p = s.lobby.players.filter(p => p.country === player.country)[0];
      if (!p) return;
      p.id = `${p.country}`;
      p.name = `Player (${p.country})`;
      p.isAdmin = lobbyOwner;
      done = true;
    });

    if (!done) return;

    useGameStore.setState(s => {
      game.play.addCountry(s.data, { country: player.country });
    });
  }

  const onClickLogout = () => {
    let done = false;
    if (!playerExist) return;

    useAppStore.setState(s => {
      const p = s.lobby.players.filter(p => p.country === player.country)[0];
      if (!p) return;
      p.id = undefined;
      p.name = undefined;
      p.isAdmin = false;
      done = true;
    });

    if (!done) return;

    useGameStore.setState(s => {
      game.play.removeCountry(s.data, { country: player.country });
    });
  }

  return (
    <>
      <Flex gap="md" justify="space-between" style={{ maxWidth: 360 }}>

        <Flex align="center" gap="md">
          <img src={assets.countryIdToUnitSrc(player.country)} width={48} height={48} />
          {playerExist && <Text>{player.name}</Text>}
        </Flex>

        <Flex align="center" justify="flex-end" gap="xs">
          {showBan && <ActionIcon size={24} onClick={onClickBan}><IconBan /></ActionIcon>}
          {showLogin && <ActionIcon size={24} onClick={onClickLogin}><IconLogin /></ActionIcon>}
          {showLogout && <ActionIcon size={24} onClick={onClickLogout}><IconLogout /></ActionIcon>}
          {player.isAdmin && <IconStarFilled />}
        </Flex>

      </Flex>

      <Divider />
    </>
  )
}

function Map() {
  const navigate = useNavigate();

  const map = useAppStore(state => state.lobby.map);
  const lobbyOwner = useAppStore(state => state.lobby.owner);

  const onChangeWidth = (value: number | "") => {
    useAppStore.setState(s => { s.lobby.map.width = value || 10 });
  }

  const onChangeHeight = (value: number | "") => {
    useAppStore.setState(s => { s.lobby.map.height = value || 10 });
  }

  const onChangeSeed = (value: number | "") => {
    useAppStore.setState(s => { s.lobby.map.seed = value || Date.now() });
  }

  const onClickPreview = () => { navigate("/lobby-preview") }

  return (
    <Flex direction="column" gap="md">
      <Title order={4}>Map Settings</Title>

      <Flex align="center" justify="space-between" gap="md">
        Width: <NumberInput value={map.width} onChange={onChangeWidth} disabled={!lobbyOwner} />
      </Flex>

      <Flex align="center" justify="space-between" gap="md">
        Height: <NumberInput value={map.height} onChange={onChangeHeight} disabled={!lobbyOwner} />
      </Flex>

      <Flex align="center" justify="space-between" gap="md">
        Seed: <NumberInput value={map.seed} onChange={onChangeSeed} disabled={!lobbyOwner} />
      </Flex>

      <Button onClick={onClickPreview}>Preview</Button>
    </Flex>
  )
}
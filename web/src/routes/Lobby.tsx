import { ActionIcon, Button, Divider, Flex, Image, NumberInput, Text, Title } from "@mantine/core";
import {
  IconArrowBigLeftFilled,
  IconArrowBigRightFilled,
  IconArrowRight,
  IconBan,
  IconCopy,
  IconDeviceFloppy,
  IconDeviceGamepad2,
  IconMessageCircle2,
  IconRobot,
  IconSettings,
  IconStarFilled
} from "@tabler/icons-react";
import { IPlayer } from "@/types/player";
import { useAppStore } from "@/stores/appStore";
import { assets } from "@/assets/assets";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { util } from "@/lib/util";
import { CountryId } from "@core/types/country_id";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect } from "react";

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

  const addLocalPlayer = () => {
    useAppStore.setState(s => {
      const newPlayer = { id: util.generateId(), name: "Local Player", country: CountryId.None };
      const exists = s.lobby.players.filter(p => p.id === newPlayer.id).length > 0;
      if (exists) return;
      s.lobby.players.push(newPlayer);
    });
  }

  const addBotPlayer = () => { }

  return (
    <Flex direction="column" gap="xs">
      <Divider />
      {players.map((player, i) => <Player player={player} key={i} />)}

      <Flex justify="center" gap="md">
        <ActionIcon size={24} onClick={addLocalPlayer}><IconDeviceGamepad2 /></ActionIcon>
        <ActionIcon size={24} onClick={addBotPlayer}><IconRobot /></ActionIcon>
      </Flex>
    </Flex>
  )
}

function Player({ player }: { player: IPlayer }) {
  const playerExist = !!player.id;
  const lobbyOwner = useAppStore(state => state.lobby.owner);

  const showBan = lobbyOwner && playerExist;

  const onClickCountry = () => {
    let oldCountry = player.country;
    let newCountry = player.country;

    useAppStore.setState(s => {
      const p = s.lobby.players.filter(p => p.id === player.id)[0];
      if (!p) return;

      const countries = s.lobby.players.map(p => p.country);

      while (newCountry < CountryId.Count) {
        if (countries.includes(newCountry)) { newCountry++; }
        else { p.country = newCountry; return; }
      }

      newCountry = CountryId.None;
      p.country = newCountry;
    });

    useGameStore.setState(s => {
      game.play.removeCountry(s.data, { country: oldCountry });
      game.play.addCountry(s.data, { country: newCountry });
    });
  }

  const onClickBan = () => {
    if (!playerExist) return;

    useAppStore.setState(s => {
      s.lobby.players = s.lobby.players.filter(p => p.id !== player.id);
    });

    useGameStore.setState(s => {
      game.play.removeCountry(s.data, { country: player.country });
    });
  }

  return (
    <>
      <Flex gap="md" justify="space-between" style={{ maxWidth: 360 }}>

        <Flex align="center" gap="md">
          <ActionIcon size={48} onClick={onClickCountry}>
            <Image src={assets.countryIdToUnitSrc(player.country)} width={48} height={48} withPlaceholder />
          </ActionIcon>
          {playerExist && <Text>{player.name}</Text>}
        </Flex>

        <Flex align="center" justify="flex-end" gap="xs">
          {showBan && <ActionIcon size={24} onClick={onClickBan}><IconBan /></ActionIcon>}
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

  const [debouncedWidth] = useDebouncedValue(map.width, 250);
  const [debouncedHeight] = useDebouncedValue(map.height, 250);
  const [debouncedSeed] = useDebouncedValue(map.seed, 250);

  useEffect(() => {
    useGameStore.setState(s => {
      game.play.generate(s.data, { w: debouncedWidth, h: debouncedHeight, seed: debouncedSeed });
    });
  }, [debouncedWidth, debouncedHeight, debouncedSeed]);

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
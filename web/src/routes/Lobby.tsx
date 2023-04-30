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
import { useEffect, useState } from "react";
import { socketio } from "@/lib/socketio";
import { useSettings } from "@/components/hooks";

export default function Lobby() {
  const navigate = useNavigate();

  const lobby = useAppStore(state => state.lobby);
  const { playerName } = useSettings();

  const toggleLobbyStatus = () => {
    useAppStore.setState(s => {
      s.lobby.online = !s.lobby.online;
      if (s.lobby.online) socketio.emit("client-create-lobby", { playerName });
      else socketio.emit("client-lobby-update", { online: false });
    });
  }

  const onClickCopyLobbyId = () => { lobby.lobbyId && util.copyToClipboard(lobby.lobbyId) }

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
        <Text>Lobby ID: {lobby.lobbyId ?? "- offline -"}</Text>

        <ActionIcon onClick={onClickCopyLobbyId}>
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
  const lobby = useAppStore(state => state.lobby);

  const addLocalPlayer = () => {
    // TODO: Implement and enable adding local players in online mode
    // Disable adding local players in online mode
    if (lobby.online) return;

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
      {lobby.players.map((player, i) => <Player player={player} key={i} />)}

      <Flex justify="center" gap="md">
        <ActionIcon size={24} onClick={addLocalPlayer} disabled={lobby.online}><IconDeviceGamepad2 /></ActionIcon>
        <ActionIcon size={24} onClick={addBotPlayer} disabled={lobby.online}><IconRobot /></ActionIcon>
      </Flex>
    </Flex>
  )
}

function Player({ player }: { player: IPlayer }) {
  const lobby = useAppStore(state => state.lobby);
  const self = lobby.playerId === player.id;

  const onClickCountry = () => {
    // If not playing offline and player is not current player
    if (lobby.online && lobby.playerId !== player.id) return;

    let oldCountry = player.country;
    let newCountry = player.country;

    const p = useAppStore.getState().lobby.players.filter(p => p.id === player.id)[0];
    if (!p) return;

    const countries = lobby.players.map(p => p.country);

    while (newCountry < CountryId.Count) {
      if (countries.includes(newCountry)) { newCountry++; }
      else break;
    }

    if (newCountry >= CountryId.Count) newCountry = CountryId.None;

    // If online, send "new country" to server first to validate
    if (lobby.online) {
      let country: "green" | "purple" | "red" | "yellow" | "none" = "none";

      switch (newCountry) {
        case CountryId.Green: country = "green"; break;
        case CountryId.Purple: country = "purple"; break;
        case CountryId.Red: country = "red"; break;
        case CountryId.Yellow: country = "yellow"; break;
      }

      socketio.emit("client-change-country", { country });
    }
    // If not offline, change country immediately
    else {
      useAppStore.setState(s => {
        const p = s.lobby.players.filter(p => p.id === player.id)[0];
        if (p) p.country = newCountry;
      });

      useGameStore.setState(s => {
        game.play.removeCountry(s.data, { country: oldCountry });
        game.play.addCountry(s.data, { country: newCountry });
      });
    }
  }

  const onClickBan = () => {
    if (!lobby.owner) return;

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
          <Text>{player.name}</Text>
        </Flex>

        <Flex align="center" justify="flex-end" gap="xs">
          {!self && !player.isAdmin && lobby.owner && <ActionIcon size={24} onClick={onClickBan}><IconBan /></ActionIcon>}
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
  const lobby = useAppStore(state => state.lobby);

  const [modified, setMofidied] = useState(false);

  const [debouncedWidth] = useDebouncedValue(map.width, 250);
  const [debouncedHeight] = useDebouncedValue(map.height, 250);
  const [debouncedSeed] = useDebouncedValue(map.seed, 250);

  useEffect(() => {
    // When player joins a lobby, lobby sends width, height & seed,
    // but since it's listening for changes here, lobby update event is sent.
    // "modified" variable is to prevent this from happening.
    if (!modified) return;

    useGameStore.setState(s => {
      const info = { w: debouncedWidth, h: debouncedHeight, seed: debouncedSeed };

      game.play.generate(s.data, info);
      if (lobby.online) socketio.emit("client-lobby-update", info);
    });
  }, [debouncedWidth, debouncedHeight, debouncedSeed]);

  const onChangeWidth = (value: number | "") => {
    setMofidied(true);
    useAppStore.setState(s => { s.lobby.map.width = value || 10 });
  }

  const onChangeHeight = (value: number | "") => {
    setMofidied(true);
    useAppStore.setState(s => { s.lobby.map.height = value || 10 });
  }

  const onChangeSeed = (value: number | "") => {
    setMofidied(true);
    useAppStore.setState(s => { s.lobby.map.seed = value || Date.now() });
  }

  const onClickPreview = () => { navigate("/lobby-preview") }

  return (
    <Flex direction="column" gap="md">
      <Title order={4}>Map Settings</Title>

      <Flex align="center" justify="space-between" gap="md">
        Width: <NumberInput value={map.width} onChange={onChangeWidth} disabled={!lobby.owner} />
      </Flex>

      <Flex align="center" justify="space-between" gap="md">
        Height: <NumberInput value={map.height} onChange={onChangeHeight} disabled={!lobby.owner} />
      </Flex>

      <Flex align="center" justify="space-between" gap="md">
        Seed: <NumberInput value={map.seed} onChange={onChangeSeed} disabled={!lobby.owner} />
      </Flex>

      <Button onClick={onClickPreview}>Preview</Button>
    </Flex>
  )
}
import { ActionIcon, Button, Divider, Flex, Image, NumberInput, Text, Title } from "@mantine/core";
import {
  IconArrowBigLeftFilled,
  IconArrowBigRightFilled,
  IconArrowRight,
  IconBan,
  IconCheck,
  IconClipboardText,
  IconDeviceFloppy,
  IconDeviceGamepad2,
  IconRobot,
  IconSettings,
  IconShare,
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
import { useDebouncedValue, useTimeout } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { socketio } from "@/lib/socketio";
import { useSettings } from "@/components/hooks";
import CustomMessageIcon from "@/components/custom/CustomMessageIcon";

export default function Lobby() {
  const navigate = useNavigate();

  const lobby = useAppStore(state => state.lobby);
  const data = useGameStore(state => state.data);
  const { playerName } = useSettings();

  const [clipboard, setClipboard] = useState(false);
  const [share, setShare] = useState(false);
  const { start: resetClipboard } = useTimeout(() => setClipboard(false), 500);
  const { start: resetShare } = useTimeout(() => setShare(false), 500);

  const toggleLobbyStatus = () => {
    const online = useAppStore.getState().lobby.online;
    useAppStore.getState().resetLobby();
    useAppStore.setState(s => {
      s.lobby.online = !online;
      if (s.lobby.online) socketio.emit("client-create-lobby", { playerName });
      else socketio.emit("client-lobby-update", { online: false });
    });
  }

  const onClickClipboard = async () => {
    if (clipboard || !lobby.lobbyId) return;
    const link = `${location.origin}/join-lobby?lobby-id=${lobby.lobbyId}`;
    const status = await util.copyToClipboard(link);
    setClipboard(status);
    resetClipboard();
  }
  const onClickShare = async () => {
    if (share || !lobby.lobbyId) return;
    const link = `${location.origin}/join-lobby?lobby-id=${lobby.lobbyId}`;
    const status = await util.share("Lords and Lands", link);
    setShare(status);
    resetShare();
  }

  const onClickSettings = () => { navigate("/settings") }
  const onClickSaves = () => { navigate("/saves") }
  const onClickChat = () => { navigate("/chat") }
  const onClickGame = () => { navigate("/game") }

  return (
    <Flex direction="column" gap="md" maw={360} style={{ width: "100%", margin: "0 auto" }}>

      <Flex align="center" justify="center" gap="md">
        <ActionIcon onClick={toggleLobbyStatus} disabled={!lobby.owner}>
          <IconArrowBigLeftFilled />
        </ActionIcon>

        <Text>{lobby.online ? "Online" : "Offline"}</Text>

        <ActionIcon onClick={toggleLobbyStatus} disabled={!lobby.owner}>
          <IconArrowBigRightFilled />
        </ActionIcon>
      </Flex>

      <Flex justify="center" gap="md" wrap="wrap">
        <Button
          leftIcon={<IconClipboardText />}
          onClick={onClickClipboard}
          disabled={!lobby.lobbyId}
          style={{ flex: 1 }}
        >
          Copy Lobby
        </Button>

        <Button
          leftIcon={<IconShare />}
          onClick={onClickShare}
          disabled={!lobby.lobbyId}
          style={{ flex: 1 }}
        >
          Share Lobby
        </Button>
      </Flex>

      <Flex justify="center" gap="md" wrap="wrap">
        <Button leftIcon={<IconSettings />} onClick={onClickSettings} style={{ flex: 1 }}>
          Settings
        </Button>

        <Button leftIcon={<IconDeviceFloppy />} onClick={onClickSaves} style={{ flex: 1 }}>
          Saves
        </Button>

        <Button leftIcon={<CustomMessageIcon />} onClick={onClickChat} style={{ flex: 1 }}>
          Chat
        </Button>

        <Button
          leftIcon={<IconArrowRight />}
          onClick={onClickGame}
          disabled={!(
            lobby.owner && game.play.startActable(data, {}) ||
            data.running
          )}
          style={{ flex: 1 }}
        >
          Play
        </Button>
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
    <>
      <Flex direction="column" gap="xs">
        <Divider />
        {lobby.players.map((player, i) => <Player player={player} key={i} />)}
      </Flex>

      <Flex justify="center" gap="md" wrap="wrap">
        <Button leftIcon={<IconDeviceGamepad2 />} onClick={addLocalPlayer} disabled={lobby.online} style={{ flex: 1 }}>
          Add Local Player
        </Button>
        <Button leftIcon={<IconRobot />} onClick={addBotPlayer} disabled={lobby.online} style={{ flex: 1 }}>
          Add Bot Player
        </Button>
      </Flex>
    </>
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
      socketio.emit("client-change-country", { country: newCountry });
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

  const lobby = useAppStore(state => state.lobby);
  const width = useGameStore(state => state.data.width);
  const height = useGameStore(state => state.data.height);
  const seed = useGameStore(state => state.data.seed);

  const [modified, setMofidied] = useState(false);

  const [debouncedWidth] = useDebouncedValue(width, 250);
  const [debouncedHeight] = useDebouncedValue(height, 250);
  const [debouncedSeed] = useDebouncedValue(seed, 250);

  useEffect(() => {
    // When player joins a lobby, lobby sends width, height & seed,
    // but since it's listening for changes here, lobby update event is sent.
    // "modified" variable is to prevent this from happening.
    if (!modified) return;
    setMofidied(false);

    useGameStore.setState(s => {
      const info = { w: debouncedWidth, h: debouncedHeight, seed: debouncedSeed };
      if (lobby.online) socketio.emit("client-lobby-update", info);
      else game.play.generate(s.data, info);
    });
  }, [debouncedWidth, debouncedHeight, debouncedSeed]);

  const onChangeWidth = (value: number | "") => {
    setMofidied(true);
    useGameStore.setState(s => { s.data.width = value || 10 });
  }

  const onChangeHeight = (value: number | "") => {
    setMofidied(true);
    useGameStore.setState(s => { s.data.height = value || 10 });
  }

  const onChangeSeed = (value: number | "") => {
    setMofidied(true);
    useGameStore.setState(s => { s.data.seed = value || Date.now() });
  }

  const onClickPreview = () => { navigate("/lobby-preview") }

  return (
    <Flex direction="column" gap="md">
      <Title order={4}>Map Settings</Title>

      <Flex align="center" justify="space-between" gap="md">
        Width: <NumberInput value={width} onChange={onChangeWidth} disabled={!lobby.owner} min={5} max={25} />
      </Flex>

      <Flex align="center" justify="space-between" gap="md">
        Height: <NumberInput value={height} onChange={onChangeHeight} disabled={!lobby.owner} min={5} max={25} />
      </Flex>

      <Flex align="center" justify="space-between" gap="md">
        Seed: <NumberInput value={seed} onChange={onChangeSeed} disabled={!lobby.owner} />
      </Flex>

      <Button onClick={onClickPreview}>Preview</Button>
    </Flex>
  )
}
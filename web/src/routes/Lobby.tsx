import { ActionIcon, Button, Divider, Flex, Image, Menu, NumberInput, Text, Title } from "@mantine/core";
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
import CustomMessageIcon from "@/components/custom/CustomMessageIcon";
import { INetworkPlayer } from "@api/types/player";
import { IBotSettings } from "@core/lib/bot";
import CustomRobotIcon from "@/components/custom/CustomRobotIcon";

export default function Lobby() {
  const navigate = useNavigate();

  const lobby = useAppStore(state => state.lobby);
  const lobbyOwner = useAppStore(state => state.isLobbyOwner());
  const data = useGameStore(state => state.data);

  const [clipboard, setClipboard] = useState(false);
  const [share, setShare] = useState(false);
  const { start: resetClipboard } = useTimeout(() => setClipboard(false), 500);
  const { start: resetShare } = useTimeout(() => setShare(false), 500);

  const toggleLobbyStatus = () => {
    const subscribed = useAppStore.getState().account?.subscribed;
    if (!lobby.online && !subscribed) useAppStore.setState(s => { s.modals.showAccount = true });
    else useAppStore.setState(s => { s.modals.showLobbyOnline = true });
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
        <ActionIcon onClick={toggleLobbyStatus} disabled={!lobbyOwner}>
          <IconArrowBigLeftFilled />
        </ActionIcon>

        <Text>{lobby.online ? "Online" : "Offline"}</Text>

        <ActionIcon onClick={toggleLobbyStatus} disabled={!lobbyOwner}>
          <IconArrowBigRightFilled />
        </ActionIcon>
      </Flex>

      <Flex justify="center" gap="md" wrap="wrap">
        <Button
          leftIcon={!clipboard ? <IconClipboardText /> : <IconCheck />}
          onClick={onClickClipboard}
          disabled={!lobby.lobbyId}
          style={{ flex: 1 }}
        >
          Copy Lobby
        </Button>

        <Button
          leftIcon={!share ? <IconShare /> : <IconCheck />}
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
      </Flex>

      <Flex justify="center" gap="md" wrap="wrap">
        <Button
          leftIcon={<IconArrowRight />}
          onClick={onClickGame}
          disabled={
            !((lobbyOwner && game.play.startActable(data, {})) || data.running) && lobby.online
          }
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
  const running = useGameStore(state => state.data.running);

  const lobbyOwner = lobby.playerId !== undefined && lobby.adminId !== undefined && lobby.playerId === lobby.adminId;

  const localPlayerAddable = lobby.players.length < 4;
  const addLocalPlayer = () => {
    if (!localPlayerAddable) return;

    if (lobby.online) {
      if (lobby.lobbyId) {
        socketio.emit("client-join-lobby", { lobbyId: lobby.lobbyId, playerName: "Local", local: true });
      }
    }
    else {
      useAppStore.setState(s => {
        if (!s.lobby.adminId) return;

        const newPlayer: INetworkPlayer = {
          id: util.generateId(),
          name: "Local Player",
          country: CountryId.None,
          local: { ownerId: s.lobby.adminId },
        }

        const exists = s.lobby.players.filter(p => p.id === newPlayer.id).length > 0;
        if (exists) return;
        s.lobby.players.push(newPlayer);
      });
    }
  }

  const botPlayerAddable = lobby.players.length < 4;
  const addBotPlayer = (botSettings: IBotSettings) => {
    if (!botPlayerAddable) return;

    if (lobby.online) {
      if (lobby.lobbyId) {
        socketio.emit("client-join-lobby", { lobbyId: lobby.lobbyId, playerName: "Bot", bot: botSettings });
      }
    }
    else {
      useAppStore.setState(s => {
        const newPlayer: INetworkPlayer = {
          id: util.generateId(),
          name: "",
          country: CountryId.None,
          bot: botSettings,
        }

        const exists = s.lobby.players.filter(p => p.id === newPlayer.id).length > 0;
        if (exists) return;

        s.lobby.players.push(newPlayer);
      });
    }
  }

  return (
    <>
      <Flex direction="column" gap="xs">
        <Divider />
        {lobby.players.map((player, i) => <Player player={player} key={i} />)}
      </Flex>


      <Flex justify="center" gap="md" wrap="wrap">
        <Button
          leftIcon={<IconDeviceGamepad2 />}
          onClick={addLocalPlayer}
          disabled={running || !localPlayerAddable}
          style={{ flex: 1 }}
        >
          Add Local Player
        </Button>

        <Menu>
          <Menu.Target>
            <Button
              leftIcon={<IconRobot />}
              disabled={!lobbyOwner || running || !botPlayerAddable}
              style={{ flex: 1 }}
            >
              Add Bot Player
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              icon={<IconRobot />}
              onClick={() => addBotPlayer({ difficulty: "easy" })}
              disabled={running || !botPlayerAddable}
              color="green"
            >
              Add Easy Bot
            </Menu.Item>

            <Menu.Item
              icon={<IconRobot />}
              onClick={() => addBotPlayer({ difficulty: "normal" })}
              disabled={running || !botPlayerAddable}
              color="yellow"
            >
              Add Normal Bot
            </Menu.Item>

            <Menu.Item
              icon={<IconRobot />}
              onClick={() => addBotPlayer({ difficulty: "hard" })}
              disabled={running || !botPlayerAddable}
              color="red"
            >
              Add Hard Bot
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    </>
  )
}

function Player({ player }: { player: INetworkPlayer }) {
  const lobby = useAppStore(state => state.lobby);
  const lobbyOwner = useAppStore(state => state.isLobbyOwner());

  const onClickCountry = () => {
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

    // If online, send "new country" to server
    if (lobby.online) {
      socketio.emit("client-change-country", { playerId: player.id, country: newCountry });
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
    if (!lobbyOwner) return;

    if (lobby.online) {
      socketio.emit("client-leave-lobby", { playerId: player.id });
    }
    else {
      useAppStore.setState(s => { s.lobby.players = s.lobby.players.filter(p => p.id !== player.id) });
      useGameStore.setState(s => { game.play.removeCountry(s.data, { country: player.country }) });
    }
  }

  return (
    <>
      <Flex gap="md" justify="space-between" style={{ maxWidth: 360 }}>

        <Flex align="center" gap="md">
          <ActionIcon size={48} onClick={onClickCountry}>
            <Image src={assets.countryIdToUnitSrc(player.country)} width={48} height={48} withPlaceholder />
          </ActionIcon>
          <Text>
            {!player.bot && !player.local && <Text span>{player.name}</Text>}
            {player.bot && <Text span>{util.getBotPlayerName(player.bot)}</Text>}
            {player.local && <Text span>{util.getLocalPlayerName(player.local)}</Text>}
          </Text>
        </Flex>

        <Flex align="center" justify="flex-end" gap="xs">
          {lobbyOwner && player.id !== lobby.adminId && <ActionIcon size={24} onClick={onClickBan}><IconBan /></ActionIcon>}
          {player.bot && <CustomRobotIcon bot={player.bot} />}
          {player.local && <IconDeviceGamepad2 />}
          {player.id === lobby.adminId && <IconStarFilled />}
        </Flex>

      </Flex>

      <Divider />
    </>
  )
}

function Map() {
  const navigate = useNavigate();

  const running = useGameStore(state => state.data.running);

  const lobby = useAppStore(state => state.lobby);
  const lobbyOwner = useAppStore(state => state.isLobbyOwner());
  const width = useGameStore(state => state.data.width);
  const height = useGameStore(state => state.data.height);
  const seed = useGameStore(state => state.data.seed);

  const [modified, setMofidied] = useState(false);

  const [debouncedWidth] = useDebouncedValue(width, 250);
  const [debouncedHeight] = useDebouncedValue(height, 250);
  const [debouncedSeed] = useDebouncedValue(seed, 250);

  const inputDisabled = !lobbyOwner || running;

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
        Width: <NumberInput value={width} onChange={onChangeWidth} disabled={inputDisabled} min={5} max={10} />
      </Flex>

      <Flex align="center" justify="space-between" gap="md">
        Height: <NumberInput value={height} onChange={onChangeHeight} disabled={inputDisabled} min={5} max={10} />
      </Flex>

      <Flex align="center" justify="space-between" gap="md">
        Seed: <NumberInput value={seed} onChange={onChangeSeed} disabled={inputDisabled} />
      </Flex>

      <Button onClick={onClickPreview}>Preview</Button>
    </Flex>
  )
}
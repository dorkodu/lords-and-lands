import { socketio } from "@/lib/socketio";
import { useAppStore } from "@/stores/appStore";
import { useGameStore } from "@/stores/gameStore";
import { wrapContent } from "@/styles/css";
import { ISave } from "@/types/save";
import { game } from "@core/game";
import { ActionIcon, Button, Divider, Flex, Text, TextInput } from "@mantine/core";
import { getHotkeyHandler, useHotkeys, useLocalStorage } from "@mantine/hooks";
import { IconCheck, IconDeviceGamepad2, IconTrash } from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Saves() {
  const [saves, setSaves] = useLocalStorage<Record<string, ISave>>({
    key: "saves",
    defaultValue: {},
    getInitialValueInEffect: false,
    serialize: (value) => JSON.stringify(value),
    deserialize: (value) => JSON.parse(value),
  });
  const savesArray = useMemo(() => Object.values(saves).sort((a, b) => b.date - a.date), [saves]);

  const [saveName, setSaveName] = useState("");
  const saveable = () => !saveName || !!saves[saveName];

  const navigate = useNavigate();
  const goBack = () => { navigate(-1) }
  useHotkeys([["Escape", goBack]]);

  const onClickSave = () => {
    if (saveable()) return;

    // Get serialized data from game data & set running to false since it's saved
    const gameData = useGameStore.getState().data;
    const serializedData = game.serializer.serialize(gameData);
    serializedData.running = false;

    const save: ISave = {
      name: saveName,
      date: Date.now(),
      data: serializedData,
    };

    setSaves({ ...saves, [saveName]: save });
    setSaveName("");
  }

  const deleteSave = (name: string) => {
    const newSaves = { ...saves };
    delete newSaves[name];
    setSaves(newSaves);
  }

  return (
    <Flex direction="column" gap="md" maw={360} style={{ width: "100%", margin: "0 auto" }}>
      <Flex direction="column" gap="md">
        <TextInput
          label="Save Name"
          placeholder="Save Name..."
          value={saveName}
          onChange={(e) => setSaveName(e.currentTarget.value)}
          onKeyDown={getHotkeyHandler([["Enter", onClickSave], ["Escape", goBack]])}
        />

        <Button onClick={onClickSave} disabled={saveable()}>Save</Button>
      </Flex>

      <Flex direction="column" gap="md">
        {savesArray.map(save => (
          <React.Fragment key={save.name}>
            <Save save={save} deleteSave={deleteSave} />
            <Divider />
          </React.Fragment>
        ))}
      </Flex>
    </Flex>
  )
}

function Save({ save, deleteSave }: { save: ISave, deleteSave: (name: string) => void }) {
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" }).format(save.date);
  }, [save]);

  const navigate = useNavigate();
  const lobbyOwner = useAppStore(state => state.isLobbyOwner());
  const running = useGameStore(state => state.data.running);

  const [deleteStatus, setDeleteStatus] = useState<"delete" | "confirm">("delete");

  const onClickDelete = () => {
    if (deleteStatus === "delete") {
      setDeleteStatus("confirm");
      return;
    }

    if (deleteStatus === "confirm") {
      deleteSave(save.name);
      return;
    }
  }

  const onClickPlay = () => {
    const online = useAppStore.getState().lobby.online;

    useGameStore.setState(s => {
      if (online) socketio.emit("client-sync-state", save.data);
      else s.data = game.serializer.deserialize(save.data);
    });

    navigate("/lobby");
  }

  return (
    <Flex align="center" justify="space-between" gap="md" maw={360}>
      <Flex direction="column">
        <Text style={wrapContent}>{save.name}</Text>
        <Text size="sm" color="dimmed">{formattedDate}</Text>
      </Flex>

      <Flex gap="xs">
        <ActionIcon variant="filled" size={32} color="red" onClick={onClickDelete}>
          {deleteStatus === "delete" && <IconTrash />}
          {deleteStatus === "confirm" && <IconCheck />}
        </ActionIcon>

        <ActionIcon variant="filled" size={32} color="green" onClick={onClickPlay} disabled={!lobbyOwner || running}>
          <IconDeviceGamepad2 />
        </ActionIcon>
      </Flex>
    </Flex>
  )
}
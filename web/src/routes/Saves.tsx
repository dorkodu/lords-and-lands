import { socketio } from "@/lib/socketio";
import { useAppStore } from "@/stores/appStore";
import { useGameStore } from "@/stores/gameStore";
import { wrapContent } from "@/styles/css";
import { ISave } from "@/types/save";
import { game } from "@core/game";
import { ActionIcon, Button, Divider, Flex, Text, TextInput } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconDeviceGamepad2, IconTrash } from "@tabler/icons-react";
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

  const onClickSave = () => {
    if (saveable()) return;

    const gameData = useGameStore.getState().data;
    const save: ISave = {
      name: saveName,
      date: Date.now(),
      data: game.serializer.serialize(gameData),
    };

    setSaves({ ...saves, [saveName]: save });
  }

  const deleteSave = (name: string) => {
    const newSaves = { ...saves };
    delete newSaves[name];
    setSaves(newSaves);
  }

  return (
    <Flex direction="column" align="center" gap="md">
      <Flex direction="column" gap="md">
        <TextInput
          label="Save Name"
          placeholder="Save Name..."
          value={saveName}
          onChange={(e) => setSaveName(e.currentTarget.value)}
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
  const navigate = useNavigate();

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" }).format(save.date);
  }, [save]);

  const onClickDelete = () => {
    deleteSave(save.name);
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
        <ActionIcon onClick={onClickDelete}>
          <IconTrash />
        </ActionIcon>

        <ActionIcon onClick={onClickPlay}>
          <IconDeviceGamepad2 />
        </ActionIcon>
      </Flex>
    </Flex>
  )
}
import { useSettings } from "@/components/hooks";
import { useAppStore } from "@/stores/appStore";
import { Button, Divider, Flex, TextInput } from "@mantine/core";
import { getHotkeyHandler, useHotkeys } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { playerName, setPlayerName } = useSettings();

  const navigate = useNavigate();
  const goBack = () => { navigate(-1) }
  useHotkeys([["Escape", goBack]]);

  const showTutorial = () => { useAppStore.setState(s => { s.modals.showTutorial = true }) }

  return (
    <Flex direction="column" gap="md" maw={360} style={{ width: "100%", margin: "0 auto" }}>
      <TextInput
        label="Player Name"
        description="Between 1 and 32 characters."
        placeholder="Player Name..."
        maxLength={32}
        value={playerName}
        onChange={(ev) => setPlayerName(ev.target.value)}
        onKeyDown={getHotkeyHandler([["Escape", goBack]])}
      />

      <Divider />

      <Button onClick={showTutorial}>Show Tutorial</Button>
    </Flex>
  )
}
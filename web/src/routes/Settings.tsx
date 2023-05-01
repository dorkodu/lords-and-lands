import { useSettings } from "@/components/hooks";
import { Flex, TextInput } from "@mantine/core";

export default function Settings() {
  const { playerName, setPlayerName } = useSettings();

  return (
    <Flex direction="column" gap="md" maw={360} style={{ width: "100%", margin: "0 auto" }}>
      <TextInput
        label="Player Name"
        description="Between 1 and 32 characters."
        placeholder="Player Name..."
        maxLength={32}
        value={playerName}
        onChange={(ev) => setPlayerName(ev.target.value)}
      />
    </Flex>
  )
}
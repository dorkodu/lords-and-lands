import { useSettings } from "@/components/hooks";
import { Flex, TextInput } from "@mantine/core";

export default function Settings() {
  const { playerName, setPlayerName } = useSettings();

  return (
    <Flex direction="column" align="center" gap="md">
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
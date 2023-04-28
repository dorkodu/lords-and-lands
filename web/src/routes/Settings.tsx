import { Flex, Text, TextInput } from "@mantine/core";

export default function Settings() {
  return (
    <Flex direction="column" align="center" gap="md">
      <Flex align="center" gap="md">
        <Text>Player Name:</Text>
        <TextInput placeholder="Player Name..." />
      </Flex>
    </Flex>
  )
}
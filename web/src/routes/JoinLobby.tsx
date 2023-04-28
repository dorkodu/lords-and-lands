import { Button, Flex, TextInput } from "@mantine/core";

export default function JoinLobby() {
  return (
    <Flex direction="column" align="center" gap="md">
      <TextInput placeholder="Room ID..." />
      <Button>Join</Button>
    </Flex>
  )
}
import { socketio } from "@/lib/socketio";
import { Button, Flex, TextInput } from "@mantine/core";
import { useState } from "react";

export default function JoinLobby() {
  const [lobbyId, setLobbyId] = useState("");

  const onClickJoin = () => {
    socketio.emit("client-join-lobby", { lobbyId });
  }

  return (
    <Flex direction="column" align="center" gap="md">
      <TextInput
        placeholder="Lobby ID..."
        value={lobbyId}
        onChange={(e) => setLobbyId(e.currentTarget.value)}
      />
      <Button onClick={onClickJoin}>Join</Button>
    </Flex>
  )
}
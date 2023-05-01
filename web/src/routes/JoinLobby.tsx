import { useSettings } from "@/components/hooks";
import { socketio } from "@/lib/socketio";
import { Button, Flex, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function JoinLobby() {
  const [params] = useSearchParams();

  const [lobbyId, setLobbyId] = useState("");
  const { playerName } = useSettings();

  const onClickJoin = () => {
    socketio.emit("client-join-lobby", { lobbyId, playerName });
  }

  useEffect(() => {
    const id = params.get("lobby-id");
    if (!id) return;
    socketio.emit("client-join-lobby", { lobbyId: id, playerName });
  }, []);

  return (
    <Flex direction="column" gap="md" maw={360} style={{ width: "100%", margin: "0 auto" }}>
      <Flex direction="column" gap="md">

        <TextInput
          label="Lobby ID"
          placeholder="Lobby ID..."
          value={lobbyId}
          onChange={(e) => setLobbyId(e.currentTarget.value)}
          autoFocus
        />

        <Button onClick={onClickJoin}>Join</Button>

      </Flex>
    </Flex>
  )
}
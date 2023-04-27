import { Button, Flex, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function MainMenu() {
  const navigate = useNavigate();

  const createLobby = () => { navigate("/lobby") }
  const joinLobby = () => { navigate("/join-lobby") }
  const settings = () => { navigate("/settings") }

  return (
    <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
      <Flex direction="column" align="center" justify="center" gap="md" p="md" style={{ height: "100%" }}>

        <Title align="center">Lords and Lands</Title>

        <Flex direction="column" gap="md" style={{ maxWidth: 360, width: "100%" }}>
          <Button onClick={createLobby}>Create Lobby</Button>
          <Button onClick={joinLobby}>Join Lobby</Button>
          <Button onClick={settings}>Settings</Button>
        </Flex>

      </Flex>
    </div>
  )
}
import { useAppStore } from "@/stores/appStore";
import { Button, Flex, Image, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import DorkoduLogo from "@/assets/dorkodu_logo.svg";
import { util } from "@/lib/util";

export default function MainMenu() {
  const navigate = useNavigate();

  const createLobby = () => {
    useAppStore.getState().resetLobby();
    navigate("/lobby");
  }
  const joinLobby = () => { navigate("/join-lobby") }
  const settings = () => { navigate("/settings") }

  return (
    <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
      <Flex direction="column" align="center" justify="center" gap="md" p="md" style={{ height: "100%" }}>

        <Flex direction="column" align="center">
          <Title align="center">Lords and Lands</Title>
          <Text size="xs" weight="bold" color="dimmed">{util.version(30, 4, 2023)}</Text>
        </Flex>

        <Flex direction="column" my="md" gap="md" style={{ maxWidth: 240, width: "100%" }}>
          <Button onClick={createLobby}>Create Lobby</Button>
          <Button onClick={joinLobby}>Join Lobby</Button>
          <Button onClick={settings}>Settings</Button>
        </Flex>

        <Flex direction="column" align="center" gap="xs">
          <Image src={DorkoduLogo} maw={240} />
          <Text color="dimmed"><b>Dorkodu</b> &copy; {new Date().getFullYear()}</Text>
        </Flex>

      </Flex>
    </div>
  )
}
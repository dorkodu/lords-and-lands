import { useAppStore } from "@/stores/appStore";
import { Button, Flex, Image, Indicator, Text, Title, Anchor } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import DorkoduLogo from "@/assets/dorkodu-pride_logo.svg";
import { util } from "@/lib/util";

export default function MainMenu() {
  const navigate = useNavigate();
  const status = useAppStore(state => state.status);

  const createLobby = () => {
    useAppStore.getState().resetLobby();
    navigate("/lobby");
  }
  const joinLobby = () => { navigate("/join-lobby") }
  const settings = () => { navigate("/settings") }

  return (
    <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
      <Flex
        direction="column" justify="center" gap="md" p="md" maw={360}
        style={{ width: "100%", margin: "0 auto", minHeight: "100%" }}
      >

        <Flex direction="column" align="center">
          <Title align="center">Lords and Lands</Title>
          <Text size="xs" weight="bold" color="dimmed">{util.version(10, 6, 2023)}</Text>
        </Flex>

        <Flex direction="column" gap="md" style={{ maxWidth: 240, width: "100%", margin: "0 auto" }}>
          <Button onClick={createLobby}>Create Lobby</Button>
          <Button onClick={joinLobby}>Join Lobby</Button>
          <Button onClick={settings}>Settings</Button>
        </Flex>

        <Flex justify="center">
          <Indicator color={status ? "green" : "red"} position="middle-start" offset={-10}>
            <Text color={status ? "green" : "red"}>{status ? "Online" : "Offline"}</Text>
          </Indicator>
        </Flex>

        <Flex direction="column" align="center" gap="xs">
          <Anchor href="https://dorkodu.com"><Image src={DorkoduLogo} maw={240} /></Anchor>
          <Text color="dimmed">
            <Anchor href="https://dorkodu.com" fw="bold">Dorkodu</Anchor> &copy; {new Date().getFullYear()}
          </Text>
        </Flex>

      </Flex>
    </div>
  )
}
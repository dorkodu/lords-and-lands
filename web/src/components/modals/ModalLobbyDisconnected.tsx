import { useAppStore } from "@/stores/appStore";
import { Button, Flex, Image, Modal, Title } from "@mantine/core";
import UnitPurple from "@/assets/units/purple.png";
import { useEffect } from "react";
import { Piece } from "../TextParser";
import { useNavigate } from "react-router-dom";

export default function ModalLobbyDisconnected() {
  const showLobbyDisconnected = useAppStore(state => state.modals.showLobbyDisconnected);
  const close = () => { useAppStore.setState(s => { s.modals.showLobbyDisconnected = false }) }

  const navigate = useNavigate();

  const status = useAppStore(state => state.status);
  const lobby = useAppStore(state => state.lobby);

  const okay = () => {
    navigate("/");
    close();
  }

  useEffect(() => {
    if (!lobby.online) return;
    if (status) return;
    useAppStore.setState(s => { s.modals.showLobbyDisconnected = true });
  }, [status, lobby.online]);

  return (
    <Modal
      opened={showLobbyDisconnected}
      onClose={() => { }}
      lockScroll={false}
      withCloseButton={false}
      centered
      size={360}
    >
      <Flex direction="column" gap="md">
        <Flex justify="center">
          <Image src={UnitPurple} width={100} height={100} />
        </Flex>

        <Title order={4} align="center">
          You lost connection <Piece.Emoji emoji={"🔌"} /><Piece.Emoji emoji={"😭"} />
        </Title>

        <Button onClick={okay}>Okay</Button>
        <Button variant="default" onClick={close}>Stay</Button>
      </Flex>
    </Modal>
  )
}
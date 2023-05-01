import { useAppStore } from "@/stores/appStore";
import { Button, Flex, Image, Modal, Title } from "@mantine/core";

import UnitPurple from "@/assets/units/purple.png";
import { socketio } from "@/lib/socketio";
import { useNavigate } from "react-router-dom";

export default function ModalQuitLobby() {
  const showQuitLobby = useAppStore(state => state.modals.showQuitLobby);
  const close = () => { useAppStore.setState(s => { s.modals.showQuitLobby = false }) }

  const navigate = useNavigate();

  const quitLobby = () => {
    // This modal is only used on online but still, if playing online, send "leave lobby" event
    const online = useAppStore.getState().lobby.online;
    if (online) socketio.emit("client-leave-lobby");

    // Close the modal & navigate to "/"
    close();
    navigate("/");
  }

  return (
    <Modal
      opened={showQuitLobby}
      onClose={close}
      lockScroll={false}
      centered
      size={360}
    >
      <Flex direction="column" gap="md">
        <Flex justify="center">
          <Image src={UnitPurple} width={100} height={100} />
        </Flex>

        <Title order={4} align="center">
          Are you sure you want to leave the lobby?
        </Title>

        <Button onClick={close}>Stay</Button>
        <Button onClick={quitLobby} variant="default">Leave</Button>
      </Flex>
    </Modal>
  )
}
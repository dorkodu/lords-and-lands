import { useAppStore } from "@/stores/appStore";
import { Button, Flex, Image, Modal, Title } from "@mantine/core";

import UnitYellow from "@/assets/units/yellow.png";
import { socketio } from "@/lib/socketio";
import { useSettings } from "../hooks";

export default function ModalLobbyOnline() {
  const showLobbyOnline = useAppStore(state => state.modals.showLobbyOnline);
  const close = () => { useAppStore.setState(s => { s.modals.showLobbyOnline = false }) }

  const { playerName } = useSettings();
  const online = useAppStore(state => state.lobby.online);

  const changeLobbyOnline = () => {
    const online = useAppStore.getState().lobby.online;
    useAppStore.getState().resetLobby();
    useAppStore.setState(s => {
      s.lobby.online = !online;
      if (s.lobby.online) socketio.emit("client-create-lobby", { playerName });
      else socketio.emit("client-lobby-update", { online: false });
    });

    // Close the modal
    close();
  }

  return (
    <Modal
      opened={showLobbyOnline}
      onClose={close}
      lockScroll={false}
      centered
      size={360}
    >
      <Flex direction="column" gap="md">
        <Flex justify="center">
          <Image src={UnitYellow} width={100} height={100} />
        </Flex>

        <Title order={4} align="center">
          {`Are you sure you want to change lobby to ${online ? '"Offline"' : '"Online"'} ?`}
        </Title>

        <Button onClick={close}>No</Button>
        <Button onClick={changeLobbyOnline} variant="default">Yes</Button>
      </Flex>
    </Modal>
  )
}
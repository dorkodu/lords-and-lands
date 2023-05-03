/*
import { useAppStore } from "@/stores/appStore";
import { Flex, Loader, Modal, Title } from "@mantine/core";
import { useEffect } from "react";
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Piece } from "../TextParser";

import UnitGreen from "@/assets/units/green.png";

export default function ModalUpdateSW() {
  const showUpdateSW = useAppStore(state => state.modals.showUpdateSW);

  const {
    offlineReady: [_offlineReady, _setOfflineReady],
    needRefresh: [needRefresh, _setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh) return;
    useAppStore.setState(s => { s.modals.showUpdateSW = true });
    setTimeout(() => updateServiceWorker(true), 500)
  }, [needRefresh]);

  return (
    <Modal
      opened={showUpdateSW}
      onClose={() => { }}
      lockScroll={false}
      withCloseButton={false}
      centered
      size={360}
    >
      <Flex direction="column" gap="md" align="center">
        <img src={UnitGreen} width={100} height={100} />

        <Title order={4} align="center">
          Updating the Game
          &nbsp;
          <Piece.Emoji emoji={"🌊"} />
        </Title>

        <Loader />
      </Flex>
    </Modal>
  )
}
*/

export default function ModalUpdateSW() {
  return (<></>)
}
import { useAppStore } from "@/stores/appStore";
import { Button, Flex, Image, Modal, Title } from "@mantine/core";
import { useGameStore } from "@/stores/gameStore";
import { assets } from "@/assets/assets";
import { util } from "@/lib/util";

export default function ModalNextTurn() {
  const showNextTurn = useAppStore(state => state.modals.showNextTurn);
  const close = () => { useAppStore.setState(s => { s.modals.showNextTurn = false }) }

  const countryId = useGameStore(state => state.country?.id);

  const nextTurn = () => {
    util.nextTurn();

    // Close the modal
    close();
  }

  return (
    <Modal
      opened={showNextTurn}
      onClose={close}
      lockScroll={false}
      centered
      size={360}
    >
      <Flex direction="column" gap="md">
        <Flex justify="center">
          <Image src={assets.countryIdToUnitSrc(countryId)} width={100} height={100} withPlaceholder />
        </Flex>

        <Title order={4} align="center">
          Are you sure you want to pass the turn?
        </Title>

        <Button onClick={close}>No</Button>
        <Button onClick={nextTurn} variant="default">Yes</Button>
      </Flex>
    </Modal>
  )
}
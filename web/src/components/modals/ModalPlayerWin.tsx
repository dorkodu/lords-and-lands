import { useAppStore } from "@/stores/appStore";
import { Flex, Image, Modal, Title } from "@mantine/core";
import { Piece } from "../TextParser";
import { useGameStore } from "@/stores/gameStore";
import { useEffect, useRef } from "react";
import { CountryId } from "@core/types/country_id";
import { assets } from "@/assets/assets";

export default function ModalPlayerWin() {
  const showPlayerWin = useAppStore(state => state.modals.showPlayerWin);
  const close = () => { useAppStore.setState(s => { s.modals.showPlayerWin = false }) }
  const winner = useRef(CountryId.None);

  const running = useGameStore(state => state.data.running);
  const countries = useGameStore(state => state.data.countries);

  useEffect(() => {
    if (!running) return;
    if (countries.length !== 1) return;
    useAppStore.setState(s => { s.modals.showPlayerWin = true });
    winner.current = countries[0]?.id ?? CountryId.None;
  }, [countries.length]);

  return (
    <Modal
      opened={showPlayerWin}
      onClose={close}
      lockScroll={false}
      centered
      size={360}
    >
      <Flex direction="column" gap="md">
        <Flex justify="center">
          <Image src={assets.countryIdToUnitSrc(winner.current)} width={100} height={100} />
        </Flex>

        <Title order={4} align="center">
          Winner!
          &nbsp;
          <Piece.Emoji emoji={"🥳"} />
        </Title>
      </Flex>
    </Modal>
  )
}
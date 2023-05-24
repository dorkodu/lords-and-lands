import { useAppStore } from "@/stores/appStore";
import { Button, Flex, Image, Modal, Title } from "@mantine/core";
import { Piece } from "../TextParser";
import { useGameStore } from "@/stores/gameStore";
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import { useNavigate } from "react-router-dom";
import { socketio } from "@/lib/socketio";

export default function ModalPlayerStatus() {
  const showPlayerStatus = useAppStore(state => state.modals.showPlayerStatus);
  const close = () => { useAppStore.setState(s => { s.modals.showPlayerStatus = false }) }

  const navigate = useNavigate();

  const running = useGameStore(state => state.data.running);
  const countries = useGameStore(state => state.data.countries);

  const lobby = useAppStore(state => state.lobby);
  const player = lobby.players.filter(p => p.id === lobby.playerId)[0]?.country;

  const [status, setStatus] = useState(false);

  const leaveLobby = () => {
    if (lobby.online) {
      if (lobby.playerId) socketio.emit("client-leave-lobby", { playerId: lobby.playerId });
    }
    else {
      navigate("/");
    }

    // Close the modal
    close();
  }

  useEffect(() => {
    if (!running) return;
    if (!(countries.length === 1 || countries.filter(c => c.id === player).length === 0)) return;

    const winStatus = countries.filter(c => c.id === player).length !== 0;
    setStatus(winStatus);

    useAppStore.setState(s => { s.modals.showPlayerStatus = true });
  }, [countries.length]);

  return (
    <Modal
      opened={showPlayerStatus}
      onClose={close}
      lockScroll={false}
      centered
      size={360}
    >
      <Flex direction="column" gap="md">
        <Flex justify="center">
          <Image src={assets.countryIdToUnitSrc(player)} width={100} height={100} />
        </Flex>

        <Title order={4} align="center">
          {status && <>You win <Piece.Emoji emoji={"🥳"} /></>}
          {!status && <>You lost <Piece.Emoji emoji={"😔"} /></>}
        </Title>

        <Button onClick={leaveLobby}>Leave lobby</Button>
        <Button variant="default" onClick={close}>Stay</Button>
      </Flex>
    </Modal>
  )
}
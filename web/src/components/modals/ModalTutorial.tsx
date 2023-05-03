import { useAppStore } from "@/stores/appStore";
import { Button, Flex, Image, Modal, Text } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { Piece } from "../TextParser";
import { useSettings } from "../hooks";

import TutorialGeneral from "@/assets/misc/tutorial_general.png";
import TutorialAlly from "@/assets/misc/tutorial_ally.png";
import TutorialEnemy from "@/assets/misc/tutorial_enemy.png";
import TutorialConquer from "@/assets/misc/tutorial_conquer.png";

import LandmarkBanner from "@/assets/landmarks/banner.png";
import LandmarkChest from "@/assets/landmarks/chest.png";
import LandmarkForest from "@/assets/landmarks/forest.png";
import LandmarkMountains from "@/assets/landmarks/mountains.png";

import UnitGreen from "@/assets/units/green.png";

interface ModalProps {
  showTutorial: boolean;
  title: string;

  page: number;
  pageCount: number;

  previous: () => void;
  next: () => void;
}

export default function ModalTutorial() {
  const showTutorial = useAppStore(state => state.modals.showTutorial);
  const close = () => { useAppStore.setState(s => { s.modals.showTutorial = false }) }

  const pageCount = 7;
  const [page, setPage] = useState(1);
  const previous = () => { if (page > 1) setPage(page - 1) }
  const next = () => {
    if (page < pageCount) { setPage(page + 1) }
    else { close(); setSeenTutorial(true); }
  }

  const title = (() => {
    switch (page) {
      case 1: return "• Welcome"
      case 2: return "• Movement"
      case 3: return "• Attacking"
      case 4: return "• Bonuses"
      case 5: return "• Turns"
      case 6: return "• How To Win"
      case 7: return "• Enjoy"
      default: return ""
    }
  })();

  const CurrentTutorial = () => {
    const modalProps = { showTutorial, title, page, pageCount, previous, next };
    switch (page) {
      case 1: return <TutorialWelcome modalProps={modalProps} />
      case 2: return <TutorialMovement modalProps={modalProps} />
      case 3: return <TutorialAttacking modalProps={modalProps} />
      case 4: return <TutorialBonuses modalProps={modalProps} />
      case 5: return <TutorialTurns modalProps={modalProps} />
      case 6: return <TutorialHowToWin modalProps={modalProps} />
      case 7: return <TutorialEnjoy modalProps={modalProps} />
      default: return <></>
    }
  }

  const { seenTutorial, setSeenTutorial } = useSettings();
  useEffect(() => {
    if (seenTutorial) return;
    useAppStore.setState(s => { s.modals.showTutorial = true });
  }, [seenTutorial]);

  // When tutorial modal is opened, always set current tutorial to first one "Welcome"
  useEffect(() => { showTutorial && setPage(1) }, [showTutorial]);

  return <CurrentTutorial />
}

function CustomModal({ children, modalProps }: React.PropsWithChildren<{ modalProps: ModalProps }>) {
  return (
    <Modal
      opened={modalProps.showTutorial}
      onClose={() => { }}
      lockScroll={false}
      centered
      size={360}
      title={`Tutorial ${modalProps.page} of ${modalProps.pageCount} ${modalProps.title}`}
      withCloseButton={false}
    >
      <Flex direction="column" gap="md">
        {children}

        <Flex justify="center" gap="md">
          <Button style={{ flex: 1 }} onClick={modalProps.previous} disabled={modalProps.page <= 1}>
            Previous
          </Button>
          <Button style={{ flex: 1 }} onClick={modalProps.next}>
            {modalProps.page !== modalProps.pageCount ? "Next" : "Let's Go!"}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

function TutorialWelcome({ modalProps }: { modalProps: ModalProps }) {
  return (
    <CustomModal modalProps={modalProps}>
      <Flex direction="column" gap="md">
        <Text align="center">Welcome to Lords and Lands!</Text>
        <Text align="center">Let's prepare you for the battlefield.</Text>
      </Flex>
    </CustomModal>
  )
}

function TutorialMovement({ modalProps }: { modalProps: ModalProps }) {
  return (
    <CustomModal modalProps={modalProps}>
      <Flex direction="column" gap="md">
        <Flex justify="center">
          <Image src={TutorialGeneral} width={48 * 3} height={48 * 3} />
        </Flex>

        <Flex direction="column">
          <Text>Units can;</Text>
          <Text>• move once per turn</Text>
          <Text>• in 8 directions</Text>
          <Text>• can't move after attacking</Text>
        </Flex>
      </Flex>
    </CustomModal>
  )
}

function TutorialAttacking({ modalProps }: { modalProps: ModalProps }) {
  return (
    <CustomModal modalProps={modalProps}>
      <Flex direction="column" gap="md">
        <Flex justify="center">
          <Image src={TutorialEnemy} width={48 * 3} height={48 * 3} />
        </Flex>

        <Flex direction="column">
          <Text>Units can;</Text>
          <Text>• attack once per turn</Text>
          <Text>• in 8 directions</Text>
          <Text>• even if the unit has moved</Text>
          <Text>• winner is the unit with most power</Text>
        </Flex>

        <Text align="center">
          Power = <Piece.Emoji emoji="🎲" /> Dice Roll + <Piece.Emoji emoji="🎲" /> Dice Bonus
        </Text>
      </Flex>
    </CustomModal>
  )
}

function TutorialBonuses({ modalProps }: { modalProps: ModalProps }) {
  return (
    <CustomModal modalProps={modalProps}>
      <Flex direction="column" gap="md">
        <Flex align="center" gap="md">
          <Image src={LandmarkMountains} width={48} height={48} style={{ filter: "invert(100%)" }} />
          <Text>• Mountains provide +2 defense bonus</Text>
        </Flex>

        <Flex align="center" gap="md">
          <Image src={LandmarkForest} width={48} height={48} style={{ filter: "invert(100%)" }} />
          <Text>• Forests provide +2 attack bonus</Text>
        </Flex>

        <Flex align="center" gap="md">
          <Image src={TutorialAlly} width={48 * 3} height={48 * 3} />
          <Text>• Each ally unit in any 8 direction provide +0.5 bonus</Text>
        </Flex>

        <Flex align="center" gap="md">
          <Image src={TutorialEnemy} width={48 * 3} height={48 * 3} />
          <Text>• Each enemy unit in any 8 direction reduce -0.5 bonus</Text>
        </Flex>
      </Flex>
    </CustomModal>
  )
}

function TutorialTurns({ modalProps }: { modalProps: ModalProps }) {
  return (
    <CustomModal modalProps={modalProps}>
      <Flex direction="column" gap="md">
        <Flex align="center" gap="md">
          <Image src={LandmarkBanner} width={48} height={48} style={{ filter: "invert(100%)" }} />
          <Text>• All players receive 1 banner</Text>
        </Flex>

        <Flex align="center" gap="md">
          <Image src={LandmarkChest} width={48} height={48} style={{ filter: "invert(100%)" }} />
          <Text>• A chest appears in a random tile, first unit to go there, receives 1 banner</Text>
        </Flex>

        <Flex align="center" gap="md">
          <Image src={UnitGreen} width={48} height={48} />
          <Text>• Player can place banners or move units</Text>
        </Flex>
      </Flex>
    </CustomModal>
  )
}

function TutorialHowToWin({ modalProps }: { modalProps: ModalProps }) {
  return (
    <CustomModal modalProps={modalProps}>
      <Flex direction="column" gap="md">
        <Flex align="center" gap="md">
          <Image src={LandmarkBanner} width={48} height={48} style={{ filter: "invert(100%)" }} />
          <Text>• Press on white banners to place banner</Text>
        </Flex>

        <Flex align="center" gap="md">
          <Image src={TutorialConquer} width={48} height={48} />
          <Text>• Stay in enemy tiles to conquer them</Text>
        </Flex>

        <Text align="center">Destroy your all enemies and conquer their land to win!</Text>
      </Flex>
    </CustomModal>
  )
}

function TutorialEnjoy({ modalProps }: { modalProps: ModalProps }) {
  return (
    <CustomModal modalProps={modalProps}>
      <Flex direction="column" gap="md">
        <Text align="center">And now you are a lord!</Text>
        <Text align="center">Go ahead and conquer your enemies.</Text>
        <Text align="center" color="dimmed" size="sm">You can always view tutorial from settings.</Text>
      </Flex>
    </CustomModal>
  )
}
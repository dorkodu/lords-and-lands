import { useAppStore } from "@/stores/appStore";
import { ActionIcon, Button, Flex, Image, Modal, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { Piece } from "../TextParser";

import UnitGreen from "@/assets/units/green.png";

export default function ModalTutorial() {
  const showTutorial = useAppStore(state => state.modals.showTutorial);
  const close = () => { useAppStore.setState(s => { s.modals.showTutorial = false }) }

  const [current, setCurrent] = useState(0);
  const previous = () => { if (current > 0) setCurrent(current - 1) }
  const next = () => { if (current < 5) setCurrent(current + 1) }

  const CurrentTutorial = () => {
    switch (current) {
      case 0: return <TutorialMovement />
      case 1: return <TutorialAttacking />
      case 2: return <TutorialBonuses />
      case 3: return <TutorialTurns />
      case 4: return <TutorialHowToWin />
      case 5: return <TutorialEnjoy />
      default: return <></>
    }
  }

  return (
    <Modal
      opened={true}
      onClose={() => { }}
      lockScroll={false}
      centered
      size={360}
      title="Tutorial"
      withCloseButton={false}
    >
      <Flex direction="column" gap="md">
        <CurrentTutorial />

        <Flex justify="center" gap="md">
          <Button style={{ flex: 1 }} onClick={previous}>Previous</Button>
          <Button style={{ flex: 1 }} onClick={next}>Next</Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

function TutorialMovement() {
  return (
    <Flex direction="column" gap="md">
      <Flex justify="center">
        <Image src={UnitGreen} width={64 * 3} height={64 * 3} />
      </Flex>

      <Flex direction="column">
        <Text>Units can;</Text>
        <Text>• move once per turn</Text>
        <Text>• in 8 directions</Text>
        <Text>• can't move after attacking</Text>
      </Flex>
    </Flex>
  )
}

function TutorialAttacking() {
  return (
    <Flex direction="column" gap="md">
      <Flex justify="center">
        <Image src={UnitGreen} width={64 * 3} height={64 * 3} />
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
  )
}

function TutorialBonuses() {
  return (
    <Flex direction="column" gap="md">
      <Flex align="center">
        <Image src={UnitGreen} width={48} height={48} />
        <Text>• Mountains provide +2 defence bonus</Text>
      </Flex>

      <Flex align="center">
        <Image src={UnitGreen} width={48} height={48} />
        <Text>• Forests provide +2 attack bonus</Text>
      </Flex>

      <Flex align="center">
        <Image src={UnitGreen} width={48 * 3} height={48 * 3} />
        <Text>• Each ally unit in any 8 direction provide +0.5 bonus</Text>
      </Flex>

      <Flex align="center">
        <Image src={UnitGreen} width={48 * 3} height={48 * 3} />
        <Text>• Each enemy unit in any 8 direction reduce -0.5 bonus</Text>
      </Flex>
    </Flex>
  )
}

function TutorialTurns() {
  return (
    <Flex direction="column" gap="md">
      <Flex align="center">
        <Image src={UnitGreen} width={48} height={48} />
        <Text>• All players receive 1 banner</Text>
      </Flex>

      <Flex align="center">
        <Image src={UnitGreen} width={48} height={48} />
        <Text>• A chest appears in a random tile, first unit to go there, receives 1 banner</Text>
      </Flex>

      <Flex align="center">
        <Image src={UnitGreen} width={48} height={48} />
        <Text>• Player can place banners or move units</Text>
      </Flex>
    </Flex>
  )
}

function TutorialHowToWin() {
  return (
    <Flex direction="column" gap="md">
      <Flex align="center">
        <Image src={UnitGreen} width={48} height={48} />
        <Text>• Press on white banners to place banner</Text>
      </Flex>

      <Flex align="center">
        <Image src={UnitGreen} width={48} height={48} />
        <Text>• Stay in enemy tiles to conquer them</Text>
      </Flex>

      <Text align="center">Destroy your all enemies and conquer their land to win!</Text>
    </Flex>
  )
}

function TutorialEnjoy() {
  return (
    <Flex direction="column" gap="md">
      <Text align="center">And now you are a lord!</Text>
      <Text align="center">Go ahead and conquer your enemies.</Text>
      <Text align="center" color="dimmed" size="sm">You can always view tutorial from settings.</Text>
    </Flex>
  )
}
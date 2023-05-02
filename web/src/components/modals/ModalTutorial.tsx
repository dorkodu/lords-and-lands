import { useAppStore } from "@/stores/appStore";
import { Button, Flex, Image, Modal, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { Piece } from "../TextParser";
import { useSettings } from "../hooks";
import UnitGreen from "@/assets/units/green.png";

export default function ModalTutorial() {
  const showTutorial = useAppStore(state => state.modals.showTutorial);
  const close = () => { useAppStore.setState(s => { s.modals.showTutorial = false }) }

  const tutorialCount = 7;
  const [current, setCurrent] = useState(1);
  const previous = () => { if (current > 1) setCurrent(current - 1) }
  const next = () => {
    if (current < tutorialCount) { setCurrent(current + 1) }
    else { close(); setSeenTutorial(true); }
  }

  const getTutorialTitle = () => {
    switch (current) {
      case 1: return "• Welcome"
      case 2: return "• Movement"
      case 3: return "• Attacking"
      case 4: return "• Bonuses"
      case 5: return "• Turns"
      case 6: return "• How To Win"
      case 7: return "• Enjoy"
      default: return <></>
    }
  }

  const CurrentTutorial = () => {
    switch (current) {
      case 1: return <TutorialWelcome />
      case 2: return <TutorialMovement />
      case 3: return <TutorialAttacking />
      case 4: return <TutorialBonuses />
      case 5: return <TutorialTurns />
      case 6: return <TutorialHowToWin />
      case 7: return <TutorialEnjoy />
      default: return <></>
    }
  }

  const { seenTutorial, setSeenTutorial } = useSettings();
  useEffect(() => {
    if (seenTutorial) return;
    useAppStore.setState(s => { s.modals.showTutorial = true });
  }, [seenTutorial]);

  return (
    <Modal
      opened={showTutorial}
      onClose={() => { }}
      lockScroll={false}
      centered
      size={360}
      title={`Tutorial ${current} of ${tutorialCount} ${getTutorialTitle()}`}
      withCloseButton={false}
    >
      <Flex direction="column" gap="md">
        <CurrentTutorial />

        <Flex justify="center" gap="md">
          <Button style={{ flex: 1 }} onClick={previous} disabled={current <= 1}>
            Previous
          </Button>
          <Button style={{ flex: 1 }} onClick={next}>
            {current !== tutorialCount ? "Next" : "Let's Go!"}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

function TutorialWelcome() {
  return (
    <Flex direction="column" gap="md">
      <Text align="center">Welcome to Lords and Lands!</Text>
      <Text align="center">Let's prepare you for the battlefield.</Text>
    </Flex>
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
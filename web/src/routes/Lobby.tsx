import { ActionIcon, Button, Card, Divider, Flex, NumberInput, Text, Title } from "@mantine/core";
import {
  IconArrowBigLeftFilled,
  IconArrowBigRightFilled,
  IconArrowRight,
  IconBan,
  IconCopy,
  IconDeviceFloppy,
  IconLogin,
  IconLogout,
  IconMessageCircle2,
  IconRobot,
  IconSettings,
  IconStarFilled
} from "@tabler/icons-react";

import UnitGreen from "@/assets/units/green.png";
import { CountryId } from "@core/types/country_id";

export default function Lobby() {
  return (
    <Flex direction="column" align="center" gap="md">

      <Flex gap="md">
        <ActionIcon>
          <IconArrowBigLeftFilled />
        </ActionIcon>

        <Text>offline</Text>

        <ActionIcon>
          <IconArrowBigRightFilled />
        </ActionIcon>
      </Flex>

      <Flex gap="md">
        <Text>Lobby ID: abc123</Text>
        <ActionIcon>
          <IconCopy />
        </ActionIcon>
      </Flex>

      <Flex gap="md">
        <ActionIcon>
          <IconSettings />
        </ActionIcon>

        <ActionIcon>
          <IconDeviceFloppy />
        </ActionIcon>

        <ActionIcon>
          <IconMessageCircle2 />
        </ActionIcon>

        <ActionIcon>
          <IconArrowRight />
        </ActionIcon>
      </Flex>

      <Players />
      <Map />
    </Flex>
  )
}

function Players() {
  return (
    <Flex direction="column" gap="xs">
      <Player
        country={CountryId.Green}
        name={"Berk Cambaz"}
        isAdmin
      />
      <Player
        country={CountryId.Green}
        name={"Berk Cambaz"}
      />
    </Flex>
  )
}

interface PlayerProps {
  country: CountryId;
  name: string;

  isAdmin?: boolean;
}

function Player({ country, name, isAdmin }: PlayerProps) {
  return (
    <Flex gap="md" justify="space-between">
      <Flex gap="md">
        <img src={UnitGreen} width={48} />
        <Text>{name}</Text>
      </Flex>
      <Flex align="center" justify="flex-end" gap="xs">
        <ActionIcon size={24}><IconBan /></ActionIcon>
        <ActionIcon size={24}><IconLogin /></ActionIcon>
        <ActionIcon size={24}><IconLogout /></ActionIcon>
        {isAdmin && <IconStarFilled />}
      </Flex>
    </Flex>
  )
}

function Map() {
  return (
    <Flex direction="column" gap="md">
      <Title order={4}>Map Settings</Title>

      <Flex align="center" justify="space-between" gap="md">
        Width: <NumberInput />
      </Flex>

      <Flex align="center" justify="space-between" gap="md">
        Height: <NumberInput />
      </Flex>

      <Flex align="center" justify="space-between" gap="md">
        Seed: <NumberInput />
      </Flex>

      <Button>Preview</Button>
    </Flex>
  )
}
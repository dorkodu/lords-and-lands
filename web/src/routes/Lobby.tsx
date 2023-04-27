import { ActionIcon, Button, Flex, NumberInput, Text, Title } from "@mantine/core";
import {
  IconArrowBigLeftFilled,
  IconArrowBigRightFilled,
  IconArrowRight,
  IconCopy,
  IconDeviceFloppy,
  IconMessageCircle2,
  IconSettings
} from "@tabler/icons-react";

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

      <Flex>
        player stuff
      </Flex>

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

    </Flex>
  )
}
import { Button, Flex, TextInput } from "@mantine/core";

export default function Saves() {
  return (
    <Flex direction="column" align="center">
      <Flex direction="column" gap="md">

        <TextInput
          label="Save Name"
          placeholder="Save Name..."
        />

        <Button>Save</Button>

      </Flex>
    </Flex>
  )
}
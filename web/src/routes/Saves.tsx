import { Button, Flex, TextInput } from "@mantine/core";
import { useState } from "react";

export default function Saves() {
  const [saveName, setSaveName] = useState("");

  const onClickSave = () => {

  }

  return (
    <Flex direction="column" align="center">
      <Flex direction="column" gap="md">

        <TextInput
          label="Save Name"
          placeholder="Save Name..."
          value={saveName}
          onChange={(e) => setSaveName(e.currentTarget.value)}
        />

        <Button onClick={onClickSave}>Save</Button>

      </Flex>
    </Flex>
  )
}
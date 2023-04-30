import { useAppStore } from "@/stores/appStore"
import { Indicator } from "@mantine/core";
import { IconMessageCircle2 } from "@tabler/icons-react";

export default function CustomMessageIcon() {
  const showIndicator = useAppStore(state => state.showMessageIndicator());

  return (
    <Indicator color="red" disabled={!showIndicator}>
      <IconMessageCircle2 />
    </Indicator>
  )
}
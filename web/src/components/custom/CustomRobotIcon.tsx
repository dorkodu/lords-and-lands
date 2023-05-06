import { util } from "@/lib/util";
import { IBotSettings } from "@core/lib/bot";
import { useMantineTheme } from "@mantine/core";
import { IconRobot } from "@tabler/icons-react";

export default function CustomRobotIcon({ bot }: { bot: IBotSettings }) {
  const theme = useMantineTheme();
  const color = theme.colors[util.getBotPlayerColor(bot)]?.[8];

  return (
    <IconRobot color={color} />
  )
}
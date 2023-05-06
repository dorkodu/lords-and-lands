import { IBotSettings } from "@core/lib/bot";
import { useMantineTheme, DefaultMantineColor } from "@mantine/core";
import { IconRobot } from "@tabler/icons-react";

export default function CustomRobotIcon({ bot }: { bot: IBotSettings }) {
  const theme = useMantineTheme();
  const color = theme.colors[botToColor(bot)]?.[8];

  return (
    <IconRobot color={color} />
  )
}

export function botToColor(bot: IBotSettings): DefaultMantineColor {
  switch (bot.difficulty) {
    case "easy": return "green";
    case "normal": return "yellow";
    case "hard": return "red";
  }
}

export function botToName(bot: IBotSettings): string {
  switch (bot.difficulty) {
    case "easy": return "Easy Bot";
    case "normal": return "Normal Bot";
    case "hard": return "Hard Bot";
  }
}
import { Flex, createStyles, ActionIcon } from "@mantine/core";
import { IconArrowRight, IconMenu2, IconMessageCircle2 } from "@tabler/icons-react";

const useStyles = createStyles((_theme) => ({
  header: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    height: "64px",
    zIndex: 1,

    backgroundImage: "linear-gradient(0deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))",
  },
}))

export default function Header() {
  const { classes } = useStyles();

  const onClickMenu = () => { }
  const onClickChat = () => { }
  const onClickNextTurn = () => { }

  return (
    <Flex className={classes.header} direction="row" align="center" justify="center" gap="md">

      <ActionIcon variant="filled" size={32} onClick={onClickMenu}>
        <IconMenu2 />
      </ActionIcon>

      <ActionIcon variant="filled" size={32} onClick={onClickChat}>
        <IconMessageCircle2 />
      </ActionIcon>

      <ActionIcon variant="filled" size={32} onClick={onClickNextTurn}>
        <IconArrowRight />
      </ActionIcon>

    </Flex>
  )
}
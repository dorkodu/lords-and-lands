import { Flex, createStyles } from "@mantine/core";

const useStyles = createStyles((_theme) => ({
  header: {
    position: "absolute",
    left: 0,
    right: 0,

    height: "64px",
    zIndex: 1,

    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))",
  },
}))

export default function Header() {
  const { classes } = useStyles();

  return (
    <Flex className={classes.header} direction="row" align="center" justify="center" gap="md">
      header
    </Flex>
  )
}
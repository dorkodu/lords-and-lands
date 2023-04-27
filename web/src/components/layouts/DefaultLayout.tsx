import { ActionIcon, Card, createStyles, Flex, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Outlet } from "react-router-dom";

const useStyles = createStyles((theme) => ({
  container: {
    position: "relative",
    maxWidth: theme.breakpoints.sm,
    margin: "0 auto",
  },

  header: {
    position: "fixed",
    top: 0,
    width: "100%",
    maxWidth: theme.breakpoints.sm,
    height: 64,
    margin: "0 auto",

    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,

    [`@media (max-width: ${theme.breakpoints.sm})`]: {
      borderRadius: 0,
    },
  },

  main: {
    width: "100%",
    marginTop: 64,
  },
}));


export default function DefaultLayout() {
  const { classes } = useStyles();

  return (
    <Flex className={classes.container}>
      <Card className={classes.header}>
        <Flex align="center" justify="space-between" style={{ height: "100%" }}>
          <ActionIcon>
            <IconArrowLeft />
          </ActionIcon>

          <Title order={3}>Title</Title>

          <ActionIcon style={{ visibility: "hidden" }}></ActionIcon>
        </Flex>
      </Card>

      <Flex direction="column" className={classes.main}>
        <Outlet />
      </Flex>
    </Flex>
  )
}
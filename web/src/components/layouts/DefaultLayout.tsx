import { useAppStore } from "@/stores/appStore";
import { ActionIcon, Card, createStyles, Flex, px, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Outlet, useNavigate } from "react-router-dom";

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
    zIndex: 100,

    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,

    [`@media (max-width: ${theme.breakpoints.sm})`]: {
      borderRadius: 0,
    },
  },

  main: {
    width: "100%",
    marginTop: 64 + px(theme.spacing.md),
    marginBottom: 0 + px(theme.spacing.md),
  },
}));


export default function DefaultLayout() {
  const navigate = useNavigate();
  const route = useAppStore(state => state.route);

  const { classes } = useStyles();

  const onClickBack = () => {
    switch (route) {
      case "chat":
      case "lobby-preview":
      case "settings":
      case "saves":
        navigate(-1);
        break;
      case "join-lobby":
      case "lobby":
        navigate("/main-menu");
        break;
    }
  }

  const routeToTitle = (): string => {
    switch (route) {
      case "chat": return "Chat";
      //case "game": return "Game";
      case "join-lobby": return "Join Lobby";
      case "lobby": return "Lobby";
      //case "lobby-preview": return "Lobby Preview";
      //case "main-menu": return "Main Menu";
      case "settings": return "Settings";
      case "saves": return "Saves";
      default: return "Not Found";
    }
  }

  return (
    <Flex className={classes.container}>
      <Card className={classes.header}>
        <Flex align="center" justify="space-between" style={{ height: "100%" }}>
          <ActionIcon onClick={onClickBack}>
            <IconArrowLeft />
          </ActionIcon>

          <Title order={3}>{routeToTitle()}</Title>

          <ActionIcon style={{ visibility: "hidden" }}></ActionIcon>
        </Flex>
      </Card>

      <Flex direction="column" mx="md" className={classes.main}>
        <Outlet />
      </Flex>
    </Flex>
  )
}
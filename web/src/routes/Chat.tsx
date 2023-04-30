import { socketio } from "@/lib/socketio";
import { useAppStore } from "@/stores/appStore";
import { wrapContent } from "@/styles/css";
import { ActionIcon, Card, createStyles, Flex, Text, TextInput } from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from 'react-virtuoso'

// TODO: Make styles re-usable, this is copied from layouts/DefaultLayout.tsx
const useStyles = createStyles((theme) => ({
  footer: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,

    width: "100%",
    maxWidth: theme.breakpoints.sm,
    height: 64,

    margin: "0 auto",
    zIndex: 100,

    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,

    [`@media (max-width: ${theme.breakpoints.sm})`]: {
      borderRadius: 0,
    },
  },
}));

export default function Chat() {
  const navigate = useNavigate();
  const { classes } = useStyles();

  const messages = useAppStore(state => state.lobby.messages);
  const message = useAppStore(state => state.lobby.message);

  const goBack = () => { navigate(-1) }

  const sendMessage = () => {
    if (message.trim().length <= 0) return;

    const online = useAppStore.getState().lobby.online;

    if (online) socketio.emit("client-chat-message", { message });
    else useAppStore.setState(s => { s.lobby.messages.push({ playerId: "player", msg: message }) })

    useAppStore.setState(s => { s.lobby.message = "" });
  }

  const onChangeMessage = (ev: React.ChangeEvent<HTMLInputElement>) => {
    useAppStore.setState(s => { s.lobby.message = ev.target.value });
  }

  return (
    <Flex direction="column">
      <Virtuoso
        useWindowScroll
        // TODO: Set index to the last seen message
        // TODO: Show new messages (never seen before) with a different color
        initialTopMostItemIndex={0}
        data={messages}
        itemContent={(index, message) => <ChatMessage message={message} key={index} />}
      />

      <Card className={classes.footer}>
        <Flex align="center" gap="md" style={{ height: "100%" }}>
          <ActionIcon onClick={goBack}>
            <IconArrowLeft />
          </ActionIcon>

          <TextInput
            placeholder="Message..."
            maxLength={200}
            value={message}
            onChange={onChangeMessage}
            onKeyDown={getHotkeyHandler([["Enter", sendMessage]])}
            style={{ flexGrow: 1 }}
          />

          <ActionIcon onClick={sendMessage}>
            <IconSend />
          </ActionIcon>
        </Flex>
      </Card>
    </Flex>
  )
}

function ChatMessage({ message }: { message: { playerId: string, msg: string } }) {
  const playerIdToPlayer = useAppStore(state => state.playerIdToPlayer);
  const playerIdToColor = useAppStore(state => state.playerIdToColor);

  return (
    <>
      <Text
        color={playerIdToColor(message.playerId)}
        style={wrapContent}
        span
      >
        {playerIdToPlayer(message.playerId)?.name ?? "Player"}
      </Text>
      <Text span>:&nbsp;</Text>
      <Text span style={wrapContent}>{message.msg}</Text>
    </>
  )
}
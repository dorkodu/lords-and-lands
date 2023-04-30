import TextParser, { PieceType } from "@/components/TextParser";
import { socketio } from "@/lib/socketio";
import { useAppStore } from "@/stores/appStore";
import { wrapContent } from "@/styles/css";
import { ActionIcon, Card, createStyles, Flex, Text, TextInput } from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from 'react-virtuoso'

// TODO: Make styles re-usable, this is copied from layouts/DefaultLayout.tsx
const useStyles = createStyles((theme) => ({
  main: {
    marginBottom: 64,
  },
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
  const lastSeenMessage = useAppStore(state => state.lobby.lastSeenMessage) ?? -1;
  const memoizedIndex = useMemo(() => lastSeenMessage, []);

  const goBack = () => { navigate(-1) }

  const sendMessage = () => {
    if (message.trim().length <= 0) return;

    const online = useAppStore.getState().lobby.online;

    if (online) {
      socketio.emit("client-chat-message", { message });
    }
    else {
      useAppStore.setState(s => {
        s.lobby.messages.push({ playerId: "player", msg: message });
        s.lobby.lastSeenMessage = s.lobby.messages.length - 1;
      });
    }

    useAppStore.setState(s => { s.lobby.message = "" });
  }

  const onChangeMessage = (ev: React.ChangeEvent<HTMLInputElement>) => {
    useAppStore.setState(s => { s.lobby.message = ev.target.value });
  }

  useEffect(() => {
    return () => useAppStore.setState(s => { s.lobby.lastSeenMessage = s.lobby.messages.length - 1 });
  }, []);

  return (
    <Flex direction="column">
      <Virtuoso
        useWindowScroll
        initialTopMostItemIndex={memoizedIndex < 0 ? 0 : memoizedIndex}
        data={messages}
        itemContent={(index, message) => (
          <ChatMessage message={message} seen={index <= memoizedIndex} key={index} />
        )}
        className={classes.main}
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

function ChatMessage({ message, seen }: { message: { playerId: string, msg: string }, seen?: boolean }) {
  const playerIdToPlayer = useAppStore(state => state.playerIdToPlayer);
  const playerIdToColor = useAppStore(state => state.playerIdToColor);

  return (
    <>
      <Text
        color={playerIdToColor(message.playerId)}
        style={wrapContent}
        span
      >
        <TextParser text={playerIdToPlayer(message.playerId)?.name ?? "Player"} types={[PieceType.Emoji]} />
      </Text>

      <Text span>:&nbsp;</Text>

      <Text span style={wrapContent} color={seen ? "dimmed" : undefined}>
        <TextParser text={message.msg} types={[PieceType.Emoji]} />
      </Text>
    </>
  )
}
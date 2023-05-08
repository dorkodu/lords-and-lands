import { request, sage } from "@/stores/api";
import { useAppStore } from "@/stores/appStore";
import { Button, Flex, Modal, Text } from "@mantine/core";
import { useGoogleLogin } from "@react-oauth/google";
import { IconBrandGoogle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useWait } from "../hooks";

interface State {
  loading: boolean;
  status: boolean | undefined;
}

export default function ModalAccount() {
  const showAccount = useAppStore(state => state.modals.showAccount);
  const close = () => { useAppStore.setState(s => { s.modals.showAccount = false }) }

  const [state, setState] = useState<State>({ loading: false, status: undefined });
  const account = useAppStore(state => state.account);

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: (res) => { login("google", res.access_token) },
    onError: (err) => console.log(err),
    onNonOAuthError: (err) => console.log(err),
  });

  const auth = async () => {
    const res = await sage.get(
      { a: sage.query("auth", undefined) },
      (query) => useWait(() => request(query))()
    );

    const status = !(!res?.a.data || res.a.error);
    const data = res?.a.data;

    if (data) useAppStore.setState(s => { s.account = data });
  }

  const login = async (type: "google", value: string) => {
    setState((s) => ({ ...s, loading: true, status: undefined }));

    const res = await sage.get(
      { a: sage.query("login", { type, value }) },
      (query) => useWait(() => request(query))()
    );

    const status = !(!res?.a.data || res.a.error);
    const data = res?.a.data;

    setState((s) => ({ ...s, loading: false, status: status }));

    if (data) useAppStore.setState(s => { s.account = data });
  }

  const logout = async () => {
    await sage.get(
      { a: sage.query("logout", undefined) },
      (query) => useWait(() => request(query))()
    );

    useAppStore.setState(s => { s.account = undefined });
  }

  useEffect(() => { auth() }, []);

  return (
    <Modal
      opened={showAccount}
      onClose={close}
      lockScroll={false}
      centered
      size={360}
      title="My Account"
    >
      <Flex direction="column" gap="md">

        {account &&
          <>
            <Text>{`Hello, ${account.name}`}</Text>

            {account.subscribed && <Button>Manage my subscription</Button>}
            {!account.subscribed && <Button>Subscribe for 50% discount</Button>}

            <Button variant="default" onClick={logout}>Logout</Button>
          </>
        }

        {!account &&
          <Button leftIcon={<IconBrandGoogle />} onClick={() => googleLogin()}>Login with Google</Button>
        }

      </Flex>
    </Modal>
  )
}
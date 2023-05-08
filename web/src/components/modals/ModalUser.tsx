import { socketio } from "@/lib/socketio";
import { request, sage } from "@/stores/api";
import { useAppStore } from "@/stores/appStore";
import { Anchor, Button, Flex, Modal, Text, Title } from "@mantine/core";
import { useGoogleLogin } from "@react-oauth/google";
import { IconBrandGoogle } from "@tabler/icons-react";
import { useEffect } from "react";
import { useControlProps, useWait } from "../hooks";

export default function ModalAccount() {
  const showAccount = useAppStore(state => state.modals.showAccount);
  const close = () => { useAppStore.setState(s => { s.modals.showAccount = false }) }

  const account = useAppStore(state => state.account);

  const [_authControl, setAuthControl] = useControlProps();
  const [loginControl, setLoginControl] = useControlProps();
  const [logoutControl, setLogoutControl] = useControlProps();
  const [subscribeControl, setSubscribeControl] = useControlProps();
  const [manageSubscriptionControl, setManageSubscriptionControl] = useControlProps();

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: (res) => { login("google", res.access_token) },
    onError: (err) => console.log(err),
    onNonOAuthError: (err) => console.log(err),
  });

  const auth = async () => {
    setAuthControl(() => ({ loading: true, status: undefined }));

    const res = await sage.get(
      { a: sage.query("auth", undefined) },
      (query) => useWait(() => request(query))()
    );

    const status = !(!res?.a.data || res.a.error);
    const data = res?.a.data;

    if (data) useAppStore.setState(s => { s.account = data });
    if (data?.subscribed && !useAppStore.getState().status) socketio.connect();

    setAuthControl(() => ({ loading: false, status: status }));
  }

  const login = async (type: "google", value: string) => {
    setLoginControl(() => ({ loading: true, status: undefined }));

    const res = await sage.get(
      { a: sage.query("login", { type, value }) },
      (query) => useWait(() => request(query))()
    );

    const status = !(!res?.a.data || res.a.error);
    const data = res?.a.data;

    if (data) useAppStore.setState(s => { s.account = data });
    if (data?.subscribed) socketio.connect();

    setLoginControl(() => ({ loading: false, status: status }));
  }

  const logout = async () => {
    setLogoutControl(() => ({ loading: true, status: undefined }));

    await sage.get(
      { a: sage.query("logout", undefined) },
      (query) => useWait(() => request(query))()
    );

    useAppStore.setState(s => { s.account = undefined });

    setLogoutControl(() => ({ loading: false, status: true }));
  }

  const subscribe = async () => {
    setSubscribeControl(() => ({ loading: true, status: undefined }));

    const res = await sage.get(
      { a: sage.query("subscribe", undefined) },
      (query) => useWait(() => request(query))()
    );

    const status = !(!res?.a.data || res.a.error);
    const data = res?.a.data;

    if (data) document.location.href = data.url;

    setSubscribeControl(() => ({ loading: false, status: status }));
  }

  const manageSubscription = async () => {
    setManageSubscriptionControl(() => ({ loading: true, status: undefined }));

    const res = await sage.get(
      { a: sage.query("manageSubscription", undefined) },
      (query) => useWait(() => request(query))()
    );

    const status = !(!res?.a.data || res.a.error);
    const data = res?.a.data;

    if (data) document.location.href = data.url;

    setManageSubscriptionControl(() => ({ loading: false, status: status }));
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
            <Title order={5}>{`Hello, ${account.name}`}</Title>

            <SubscriberFeatures />

            {account.subscribed &&
              <Button onClick={manageSubscription} loading={manageSubscriptionControl?.loading}>
                Manage my subscription
              </Button>
            }
            {!account.subscribed &&
              <Button onClick={subscribe} loading={subscribeControl?.loading}>
                Subscribe for 50% discount
              </Button>
            }

            <Button variant="default" onClick={logout} loading={logoutControl?.loading}>Logout</Button>
          </>
        }

        {!account &&
          <>
            <SubscriberFeatures />
            <Button
              leftIcon={<IconBrandGoogle />}
              onClick={() => googleLogin()}
              loading={loginControl?.loading}
            >
              Login with Google
            </Button>
          </>
        }

        <Text color="dimmed" align="center" fs="italic">*No refunds. All sales final.*</Text>

        <Text color="dimmed" align="center">
          For any questions, reach out to us at <Anchor href="mailto:hey@dorkodu.com">hey@dorkodu.com</Anchor>.
        </Text>

      </Flex>
    </Modal>
  )
}

function SubscriberFeatures() {
  return (
    <Flex direction="column">
      <Title order={5}>Subscriber features:</Title>
      <Text>• Online multiplayer</Text>
      <Text>• Lord of the lords</Text>
      <Text>• A lot of land</Text>
    </Flex>
  )
}
import { useEffect } from "react";
import Pusher from "pusher-js";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { PUSHER_APP_CLUSTER, PUSHER_APP_KEY } from "Utils/constants";
import { isOrderCreated, isOrderUpdated } from "../Redux/Ducks/pusherSlice";

export default function PusherClient() {
  const dispatch = useAppDispatch();
  const selected_store = useAppSelector((x) => x.Home.selected_store);

  useEffect(() => {
    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_APP_CLUSTER,
    });

    const channel = pusher.subscribe(`store_${selected_store}`);

    // Log success or failure of subscription
    channel.bind("pusher:subscription_succeeded", () => {
      console.log(
        `Subscription to channel succeeded and listening to store_${selected_store}`
      );
    });

    channel.bind("pusher:subscription_error", (status: any) => {
      console.error("Subscription error:", status);
    });

    // Bind to a specific event within that channel
    channel.bind("orderCreated", (data: any) => {
      console.log(data);
      if (data) {
        dispatch(isOrderCreated(data));
      }
    });

    // Bind to a specific event within that channel
    channel.bind("orderUpdated", (data: any) => {
      console.log(data);
      if (data) {
        dispatch(isOrderUpdated(data));
      }
    });

    // Log any Pusher connection errors
    pusher.connection.bind("error", (err: any) => {
      console.error("Pusher error:", err);
    });

    // Clean up by unsubscribing the Pusher connection on unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [selected_store]);

  return null;
}

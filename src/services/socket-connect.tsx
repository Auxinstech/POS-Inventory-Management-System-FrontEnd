import React, { useState, useEffect } from "react";
import { socket } from "./socket";

export default function SocketConnect() {
  const [isConnected, setIsConnected] = useState<any>(socket.connected);
  const [fooEvents, setFooEvents] = useState<any>([]);

  console.log("isConnected", isConnected);
  console.log("fooEvents", fooEvents);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value: any) {
      setFooEvents((previous: any) => [...previous, value]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("foo", onFooEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("foo", onFooEvent);
    };
  }, []);
  return <div></div>;
}

import React, { useEffect, useState } from "react";
import mqtt, { MqttClient } from "mqtt";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { getOrders } from "../Redux/Ducks/orderSlice";
import {
  isOrderCreated,
  isOrderUpdated,
  setMqttStatus,
  setTestMqtt,
} from "../Redux/Ducks/pusherSlice";

const MqttConnect = () => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const dispatch = useAppDispatch();

  const selectedStore = useAppSelector((state) => state.Home.selected_store);
  const stores = useAppSelector((state) => state.Home.stores);

  const selectedStoreObj = stores.find((store) => store.id === selectedStore);
  const topic = selectedStoreObj
    ? `${selectedStoreObj.slug}_${selectedStoreObj.id}`
    : null;

  useEffect(() => {
    if (!topic) {
      console.log(
        "⏹ Skipping MQTT connect: store id/slug is null or undefined"
      );
      return;
    }

    const url = "wss://pos.foodslift.com:8084/mqtt";
    const options = {
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
      username: "myuser",
      password: "lynk@X0900as34",
      clientId: "react_client_" + Math.random().toString(16).substr(2, 8),
    };

    const mqttClient = mqtt.connect(url, options);

    mqttClient.on("connect", () => {
      console.log("✅ Connected to MQTT broker");
      setIsConnected(true);
      dispatch(setMqttStatus(true));

      mqttClient.subscribe(topic, (err) => {
        if (!err) console.log(`📡 Subscribed to topic: ${topic}`);
        else console.error("❌ Subscription error:", err);
      });
    });

    mqttClient.on("message", (topic, message) => {
      console.log(`📩 New message: ${message.toString()}`);
      const parsedMessage = JSON.parse(message.toString());

      if (parsedMessage.orderCreated) {
        dispatch(isOrderCreated(parsedMessage.orderCreated));
      } else if (parsedMessage.orderUpdated) {
        dispatch(isOrderUpdated(parsedMessage.orderUpdated));
      } else if (parsedMessage.testMqtt) {
        dispatch(setTestMqtt(parsedMessage.testMqtt));
      }

      setMessages((prev) => [...prev, `${topic}: ${message.toString()}`]);
    });

    // Handle disconnection and offline events properly
    mqttClient.on("close", () => {
      console.warn("🔴 MQTT connection closed");
      setIsConnected(false);
      dispatch(setMqttStatus(false));
    });

    mqttClient.on("offline", () => {
      console.warn("⚠️ MQTT client offline");
      setIsConnected(false);
      dispatch(setMqttStatus(false));
    });

    mqttClient.on("error", (err) => {
      console.error("🚨 MQTT error:", err);
      setIsConnected(false);
      dispatch(setMqttStatus(false));
    });

    setClient(mqttClient);

    return () => {
      console.log("🧹 Cleaning up MQTT connection");
      mqttClient.end(true);
      setIsConnected(false);
      dispatch(setMqttStatus(false));
    };
  }, [topic, dispatch]);

  return <div></div>;
};

export default MqttConnect;

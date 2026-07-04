import { useAppDispatch, useAppSelector } from "Hook/hooks";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { TestMqtt } from "../../Redux/Ducks/settingSlice";
import { toast } from "react-toastify";
import { setToast } from "../../Redux/Ducks/toastSlice";
import { removeTestMqtt } from "../../Redux/Ducks/pusherSlice";

export default function TestMqttButton() {
  const selected_store = useAppSelector((x) => x.Home.selected_store);
  const dispatch = useAppDispatch();
  const { TestMqttMessage, mqttStatus: Status } = useAppSelector(
    (x) => x.pusher
  );
  const settings = useAppSelector((x) => x.Setting.settings);

  const [mqttStatus, setMqttStatus] = useState<boolean>(false);

  // Sync mqtt status state when setting changes
  useEffect(() => {
    const mqttStatusToggler = settings.find((x) => x.key === "mqtt_status");
    if (mqttStatusToggler?.value) {
      setMqttStatus(mqttStatusToggler.value === "true"); // convert string to boolean
    }
  }, [settings]);

  useEffect(() => {
    if (TestMqttMessage) {
      dispatch(
        setToast({
          message: TestMqttMessage || "MQTT is Working",
          type: "success",
        })
      );
      // Clear it so it only shows once
      dispatch(removeTestMqtt());
    }
  }, [TestMqttMessage]);

  const handleTestMqtt = async () => {
    if (!selected_store) return;
    // dispatch(
    //   setToast({
    //     message: "Request sent successfully",
    //     type: "success",
    //   })
    // );
    dispatch(
      TestMqtt({
        store_id: selected_store,
        message: "testMqtt",
      })
    );
  };

  console.log(mqttStatus);
  return (
    <div>
      {mqttStatus && (
        <div className="d-flex align-items-center gap-1">
          <span
            className={`rounded-circle ${Status ? "bg-primary" : "bg-danger"}`}
            style={{ width: "12px", height: "12px", display: "inline-block" }}
          ></span>
          <span className="small text-muted">
            {Status ? "Auto printing connected" : "Auto printing disconnected"}
          </span>
          {/* <Button variant="primary" onClick={handleTestMqtt}>
            Test MQTT
          </Button> */}
        </div>
      )}
    </div>
  );
}

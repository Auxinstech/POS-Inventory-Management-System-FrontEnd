import { useAppDispatch, useAppSelector } from "Hook/hooks";

import React, { useEffect } from "react";
import {
  Button,
  FloatingLabel,
  Form,
  Modal,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { fetchUserList } from "../../Redux/Ducks/UsersSlice";
import { setToast } from "../../Redux/Ducks/toastSlice";
import { assignRider } from "../../Redux/Ducks/orderSlice";

export default function AssignRiderModal({
  show,
  onHide,
}: {
  show: boolean;
  onHide: () => void;
}) {
  const [riderID, setRiderID] = React.useState<number | null>(null);
  const { selected_store } = useAppSelector((x) => x.Home);
  const handleRiderChange = (id: number | null) => {
    setRiderID(id);
  };

  const dispatch = useAppDispatch();
  const users = useAppSelector((x) => x.Users.users);

  const onSubmit = () => {
    if (!riderID) return;
    dispatch(assignRider(riderID));
    dispatch(
      setToast({ message: "Rider assigned successfully", type: "success" })
    );
    onHide();
  };

  const usersWithRiderRole =
    users?.length > 0
      ? users.filter((user) => {
          return (
            user?.roles?.some((role) => role.name === "rider") &&
            user?.stores?.some((store) => store.id === selected_store)
          );
        })
      : [];

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Select Driver</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-wrap gap-3">
          {usersWithRiderRole.map((user: any) => (
            <Card
              key={user.id}
              onClick={() => handleRiderChange(user.id)}
              className={`text-center shadow-sm transition-all ${
                riderID === user.id
                  ? "border-primary border-3 shadow-lg"
                  : "border-3"
              }`}
              style={{
                width: "140px",
                borderRadius: "16px",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Card.Body>
                {/* Avatar */}
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 ${
                    riderID === user.id
                      ? "bg-primary text-white"
                      : "bg-light text-dark"
                  }`}
                  style={{
                    width: "60px",
                    height: "60px",
                    fontSize: "22px",
                    fontWeight: 600,
                  }}
                >
                  {user.name.charAt(0)}
                </div>

                {/* Name */}
                <Card.Title
                  as="h6"
                  className="fw-semibold text-truncate"
                  title={user.name}
                >
                  {user.name}
                </Card.Title>

                {/* Subtitle or role */}
                <Card.Text className="text-muted small mb-0">Driver</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

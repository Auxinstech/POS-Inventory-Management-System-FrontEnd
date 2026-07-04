import { useAppDispatch } from "Hook/hooks";
import { Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteUser, IUserCreatePayload } from "../../Redux/Ducks/UsersSlice";
import { useState } from "react";
import UpdateUserModal from "./UpdateUser";

export interface Items {
  id: number;
  name: string;
  email: string;
  status: string;
  roles: {
    id: number;
    name: string;
  }[];
  stores: {
    id: number;
    name: string;
    slug: string;
  }[];
}

interface GridProps {
  items: Items[];
}

export interface IUserUpdatePayload {
  id: number;
  data: IUserCreatePayload;
}

const UserGrid: React.FC<GridProps> = ({ items }) => {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<IUserUpdatePayload | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleEdit = (id: number) => {
    const item = items.find((x) => x.id === id);
    if (!item) return;

    const userData: IUserCreatePayload = {
      name: item.name,
      email: item.email,
      password: "",
      status: item.status as "active" | "inactive",
      store_ids: item.stores.map((s) => s.id),
      role_ids: item.roles.map((r) => r.id),
    };

    const payload: IUserUpdatePayload = {
      id,
      data: userData,
    };

    setUser(payload);
    openModal();
  };

  const handleDelete = (id: number) => {
    dispatch(deleteUser(id));
  };

  return (
    <div className="container-fluid p-0">
      <Row className="data-grid-header fw-bold border-bottom p-2 py-3">
        <Col xs={3}>ID</Col>
        <Col xs={3}>Name</Col>
        <Col xs={3}>Email</Col>
        <Col xs={3}>Actions</Col>
      </Row>

      <UpdateUserModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        user={user}
      />
      {items.map((item) => (
        <Row
          key={item.id}
          className="data-grid-row py-2 border-bottom align-items-center hover-bg"
          style={{ cursor: "pointer" }}
        >
          <Col xs={3}>{item.id}</Col>
          <Col xs={3}>{item.name}</Col>
          <Col xs={3}>{item.email}</Col>
          <Col xs={3} className="d-flex gap-2">
            <Button variant="light" onClick={() => handleEdit(item.id)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => handleDelete(item.id)}>
              Delete
            </Button>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default UserGrid;

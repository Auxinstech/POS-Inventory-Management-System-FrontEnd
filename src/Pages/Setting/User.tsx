import {
  createUser,
  fetchUserList,
  IUserCreatePayload,
} from "../../Redux/Ducks/UsersSlice";
import UserGrid, { Items } from "../../Components/UserGrid/index";
import { useAppDispatch, useAppSelector } from "../../Hook/hooks";
import { useEffect, useState } from "react";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";
import { setToast } from "../../Redux/Ducks/toastSlice";
import { fetchRoleList } from "../../Redux/Ducks/rpSlice";

const User: React.FC = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector((x) => x.Users.users);

  useEffect(() => {
    if (users.length > 0) return;
    dispatch(fetchUserList());
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const [searchText, setSearchText] = useState<string>("");

  const filteredItems: Items[] = users
    .filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    )
    .map((user) => ({
      ...user,
      roles: user.roles ?? [],
      stores: user.stores ?? [],
    }));

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="manage-top-bar ">
          <div className="d-flex gap-2 w-100">
            <Form.Control
              type="text"
              placeholder="Search by name"
              className="flex-grow-1"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button variant="primary" onClick={openModal}>
              Add New User
            </Button>
          </div>
        </div>

        <div className="p-2">
          <UserGrid items={filteredItems} />
        </div>

        <UserCreateModal isModalOpen={isModalOpen} closeModal={closeModal} />
      </div>
    </div>
  );
};

function UserCreateModal({
  isModalOpen,
  closeModal,
}: {
  isModalOpen: boolean;
  closeModal: () => void;
}) {
  const dispatch = useAppDispatch();

  const stores = useAppSelector((x) => x.Home.stores);
  const roles = useAppSelector((x) => x.rp.roles);

  useEffect(() => {
    if (roles.length > 0) return;
    dispatch(fetchRoleList());
  }, []);

  const [formData, setFormData] = useState<IUserCreatePayload>({
    name: "",
    email: "",
    password: "",
    status: "active",
    store_ids: [],
    role_ids: [],
  });
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? (value as "active" | "inactive") : value,
    }));
  };

  const handleMultiSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
    key: "role_ids" | "store_ids"
  ) => {
    const values = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setFormData((prev) => ({
      ...prev,
      [key]: values,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(
      createUser(formData, {
        onSuccess: () => {
          setToast({
            message: "User created successfully",
            type: "success",
          });
          dispatch(fetchUserList());
          closeModal();
        },
      })
    );
  };

  return (
    <Modal show={isModalOpen} onHide={closeModal} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FloatingLabel controlId="name" label="Name" className="mb-3">
          <Form.Control
            size="sm"
            type="text"
            value={formData.name}
            name="name"
            onChange={handleChange}
          />
        </FloatingLabel>

        <FloatingLabel controlId="email" label="Email" className="mb-3">
          <Form.Control
            size="sm"
            type="email"
            value={formData.email}
            name="email"
            onChange={handleChange}
          />
        </FloatingLabel>

        <FloatingLabel controlId="password" label="Password" className="mb-3">
          <Form.Control
            size="sm"
            type="password"
            value={formData.password}
            name="password"
            onChange={handleChange}
          />
        </FloatingLabel>

        <FloatingLabel controlId="status" label="Status" className="mb-3">
          <Form.Select
            size="sm"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
        </FloatingLabel>
        {/* 
        <FloatingLabel
          controlId="store_ids"
          label="Select Store"
          className="mb-3"
        >
          <Form.Select
            size="lg"
            multiple
            value={formData.store_ids.map(String)}
            onChange={(e) => handleMultiSelect(e, "store_ids")}
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </Form.Select>
        </FloatingLabel>

        <FloatingLabel
          controlId="role_ids"
          label="Select Roles"
          className="mb-3"
        >
          <Form.Select
            size="lg"
            multiple
            value={formData.role_ids.map(String)}
            onChange={(e) => handleMultiSelect(e, "role_ids")}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Form.Select>
        </FloatingLabel> */}

        <Form.Group className="mb-3">
          <Form.Label>Select Stores</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {stores.map((store) => (
              <Form.Check
                key={store.id}
                type="checkbox"
                label={store.name}
                checked={formData.store_ids.includes(store.id)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData((prev) => ({
                    ...prev,
                    store_ids: checked
                      ? [...prev.store_ids, store.id]
                      : prev.store_ids.filter((id) => id !== store.id),
                  }));
                }}
              />
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Select Roles</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {roles.map((role) => (
              <Form.Check
                key={role.id}
                type="checkbox"
                label={role.name}
                checked={formData.role_ids.includes(role.id)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData((prev) => ({
                    ...prev,
                    role_ids: checked
                      ? [...prev.role_ids, role.id]
                      : prev.role_ids.filter((id) => id !== role.id),
                  }));
                }}
              />
            ))}
          </div>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit}>
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default User;

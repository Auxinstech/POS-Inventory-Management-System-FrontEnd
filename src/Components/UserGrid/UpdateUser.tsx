import { useAppDispatch, useAppSelector } from "../../Hook/hooks";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";
import { useEffect, useState } from "react";
import { setToast } from "../../Redux/Ducks/toastSlice";
import {
  updateUser,
  IUserCreatePayload,
  fetchUserList,
} from "../../Redux/Ducks/UsersSlice";
import { IUserUpdatePayload } from ".";
import { fetchRoleList } from "../../Redux/Ducks/rpSlice";
import storage from "Utils/storage";
import { setRoles, setStores } from "../../Redux/Ducks/userSlice";

function UpdateUserModal({
  isModalOpen,
  closeModal,
  user,
}: {
  isModalOpen: boolean;
  closeModal: () => void;
  user: IUserUpdatePayload | null;
}) {
  const dispatch = useAppDispatch();
  const stores = useAppSelector((x) => x.Home.stores);
  const roles = useAppSelector((x) => x.rp.roles);

  const [formData, setFormData] = useState<IUserCreatePayload>({
    name: "",
    email: "",
    password: "",
    status: "active",
    store_ids: [],
    role_ids: [],
  });

  useEffect(() => {
    if (roles.length > 0) return;
    dispatch(fetchRoleList());
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.data.name,
        email: user.data.email,
        password: "",
        status: user.data.status,
        store_ids: user.data.store_ids,
        role_ids: user.data.role_ids,
      });
    }
  }, [user]);

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
    if (!user) return;

    dispatch(
      updateUser(
        {
          id: user.id,
          data: formData,
        },
        {
          onSuccess: (data) => {
            // storage.set("roles", data.roles);
            // storage.set("stores", data.stores);
            // dispatch(setRoles(data.roles));
            // dispatch(setStores(data.stores));
            dispatch(fetchUserList());
            closeModal();
            dispatch(
              setToast({
                message: "User updated successfully.",
                type: "success",
              })
            );
          },
        }
      )
    );
  };

  return (
    <Modal show={isModalOpen} onHide={closeModal} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Update User</Modal.Title>
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
            placeholder="Leave blank to keep unchanged"
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

        {/* <FloatingLabel
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
        <Button variant="primary" onClick={handleSubmit} disabled={!user}>
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UpdateUserModal;

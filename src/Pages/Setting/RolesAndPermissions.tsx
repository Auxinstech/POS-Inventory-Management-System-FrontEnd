import { useEffect, useState } from "react";
import {
  Button,
  FloatingLabel,
  Form,
  Modal,
  Row,
  Col,
  Card,
  Accordion,
} from "react-bootstrap";
import RolesAndPermissionsGrid from "../../Components/RolesAndPermissionsGrid";
import { useAppSelector, useAppDispatch } from "Hook/hooks";
import {
  createPermission,
  createRole,
  deletePermission,
  deleteRole,
  fetchPermissionList,
  fetchRoleList,
  updatePermission,
  updateRole,
} from "../../Redux/Ducks/rpSlice";
import { setToast } from "../../Redux/Ducks/toastSlice";
import isValidRoleOrPermission from "../../Utils/isValidRoleOrPermission";

interface Role {
  id?: number;
  name: string;
  permissions: IRolePermissions[];
}

interface IRolePermissions {
  id: number;
  name: string;
  pivot: IRolePermissionPivot;
}

interface IRolePermissionPivot {
  role_id: number;
  permission_id: number;
}

interface Permission {
  id?: number;
  name: string;
}

const RolesAndPermissions: React.FC = () => {
  const dispatch = useAppDispatch();
  // === ROLES ===
  const roles_list = useAppSelector((x) => x.rp.roles);
  const permissions_list = useAppSelector((x) => x.rp.permissions);

  useEffect(() => {
    if (roles_list.length > 0) return;
    dispatch(fetchRoleList());
  }, []);

  useEffect(() => {
    if (permissions_list.length > 0) return;
    dispatch(fetchPermissionList());
  }, []);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleFormData, setRoleFormData] = useState<Role>({
    id: 0,
    name: "",
    permissions: [{ id: 0, name: "", pivot: { role_id: 0, permission_id: 0 } }],
  });
  const [isEditRole, setIsEditRole] = useState(false);

  // === PERMISSIONS ===

  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [permFormData, setPermFormData] = useState<Permission>({
    name: "",
  });
  const [isEditPerm, setIsEditPerm] = useState(false);

  // === ROLE CRUD ===
  const openRoleModal = () => setIsRoleModalOpen(true);
  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setRoleFormData({ id: 0, name: "", permissions: [] });

    setIsEditRole(false);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoleFormData({ ...roleFormData, name: e.target.value });
  };

  const handlePermissionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, (o) =>
      Number(o.value)
    );
    const selectedPermissions = permissions_list
      .filter((perm) => selectedIds.includes(perm.id!))
      .map((perm) => ({
        ...perm,
        pivot: {
          role_id: roleFormData.id || 0,
          permission_id: perm.id!,
        },
      }));

    setRoleFormData({
      ...roleFormData,
      permissions: selectedPermissions,
    });
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (roleFormData.name.trim() === "") return;

    if (!isValidRoleOrPermission(roleFormData.name)) {
      return dispatch(
        setToast({
          type: "error",
          message:
            "Invalid name, only lowercase letters and hyphens are allowed",
        })
      );
    }

    const permission_ids = roleFormData.permissions.map((p) => p.id);

    if (isEditRole) {
      dispatch(
        updateRole({
          id: roleFormData.id as number,
          data: {
            id: roleFormData.id as number,
            name: roleFormData.name,
            permission_ids,
          },
        })
      );
    } else {
      dispatch(
        createRole({
          name: roleFormData.name,
          permission_ids,
        })
      );
    }

    closeRoleModal();
  };

  const handleRoleEdit = (id: number) => {
    const role = roles_list.find((r) => r.id === id);
    if (role) {
      setRoleFormData(role);
      setIsEditRole(true);
      openRoleModal();
    }
  };

  const handleRoleDelete = (id: number) => {
    dispatch(deleteRole(id));
  };

  // === PERMISSION CRUD ===
  const openPermModal = () => setIsPermModalOpen(true);
  const closePermModal = () => {
    setIsPermModalOpen(false);
    setPermFormData({ id: 0, name: "" });
    setIsEditPerm(false);
  };

  const handlePermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPermFormData({ ...permFormData, name: e.target.value });
  };

  const handlePermSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (permFormData.name.trim() === "") return;
    if (!isValidRoleOrPermission(permFormData.name)) {
      return dispatch(
        setToast({
          type: "error",
          message:
            "Invalid name, only lowercase letters and hyphens are allowed",
        })
      );
    }

    if (isEditPerm) {
      dispatch(
        updatePermission({
          id: permFormData.id as number,
          data: { id: permFormData.id, name: permFormData.name },
        })
      );
    } else {
      dispatch(createPermission({ name: permFormData.name }));
    }

    closePermModal();
  };

  const handlePermEdit = (id: number) => {
    const perm = permissions_list.find((p) => p.id === id);
    if (perm) {
      setPermFormData(perm);
      setIsEditPerm(true);
      openPermModal();
    }
  };

  const handlePermDelete = (id: number) => {
    dispatch(deletePermission(id));
  };

  const renderAccordion = (title: string, content: React.ReactNode) => {
    return (
      <Accordion defaultActiveKey={title} className="mt-3">
        <Accordion.Item eventKey={title}>
          <Accordion.Header>{title}</Accordion.Header>
          <Accordion.Body>{content}</Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  return (
    <div
      className="p-2 "
      style={{
        width: "100%",
      }}
    >
      <Row className="">
        {/* Role Management */}
        {renderAccordion(
          "Role Management",
          <Col md={12}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Roles</h5>
                <Button size="sm" onClick={openRoleModal}>
                  Add Role
                </Button>
              </Card.Header>
              <Card.Body>
                <RolesAndPermissionsGrid
                  items={roles_list}
                  onEdit={handleRoleEdit}
                  onDelete={handleRoleDelete}
                />
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Permission Management */}
        {renderAccordion(
          "Permission Management ",
          <Col md={12}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Permissions</h5>
                <Button size="sm" onClick={openPermModal}>
                  Add Permission
                </Button>
              </Card.Header>
              <Card.Body>
                {permissions_list.map((perm) => (
                  <Row
                    key={perm.id}
                    className="py-1 border-bottom align-items-center"
                  >
                    <Col xs={6}>{perm.name}</Col>
                    <Col xs={6} className="d-flex gap-2 justify-content-end">
                      <Button
                        size="sm"
                        variant="light"
                        onClick={() => handlePermEdit(perm.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handlePermDelete(perm.id)}
                      >
                        Delete
                      </Button>
                    </Col>
                  </Row>
                ))}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Role Modal */}
      <Modal show={isRoleModalOpen} onHide={closeRoleModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditRole ? "Edit Role" : "Add New Role"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRoleSubmit}>
            <FloatingLabel
              controlId="roleName"
              label="Role Name"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Enter role name"
                value={roleFormData.name}
                onChange={handleRoleChange}
              />
            </FloatingLabel>
            <Form.Group className="mb-3">
              <Form.Label>Select Permissions</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {permissions_list.map((perm) => {
                  const exists = roleFormData.permissions.some(
                    (p) => p.id === perm.id
                  );

                  return (
                    <Form.Check
                      key={perm.id}
                      type="checkbox"
                      label={perm.name}
                      checked={exists}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setRoleFormData((prev) => {
                          const updatedPermissions = checked
                            ? [
                                ...prev.permissions,
                                {
                                  ...perm,
                                  pivot: {
                                    role_id: prev.id || 0,
                                    permission_id: perm.id!,
                                  },
                                },
                              ]
                            : prev.permissions.filter((p) => p.id !== perm.id);

                          return {
                            ...prev,
                            permissions: updatedPermissions,
                          };
                        });
                      }}
                    />
                  );
                })}
              </div>
            </Form.Group>

            {/* <FloatingLabel
              controlId="permissions"
              label="Please create Role first then add permissions"
              className="mb-3"
            >
              <Form.Select
                multiple
                size="lg"
                value={roleFormData.permissions.map((p) => String(p.id))}
                onChange={handlePermissionSelect}
              >
                {permissions_list.map((perm) => (
                  <option key={perm.id} value={perm.id}>
                    {perm.name}
                  </option>
                ))}
              </Form.Select>
            </FloatingLabel> */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeRoleModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRoleSubmit}>
            {isEditRole ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Permission Modal */}
      <Modal show={isPermModalOpen} onHide={closePermModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditPerm ? "Edit Permission" : "Add Permission"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePermSubmit}>
            <FloatingLabel
              controlId="permName"
              label="Permission Name"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Enter permission name"
                value={permFormData.name}
                onChange={handlePermChange}
              />
            </FloatingLabel>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePermModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePermSubmit}>
            {isEditPerm ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RolesAndPermissions;

import { Button, Col, Row } from "react-bootstrap";

export interface IRole {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: IRolePermissions[];
}

export interface IRolePermissions {
  id: number;
  name: string;
  pivot: IRolePermissionPivot;
}

export interface IRolePermissionPivot {
  role_id: number;
  permission_id: number;
}

interface GridProps {
  items: IRole[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const RolesAndPermissionsGrid: React.FC<GridProps> = ({
  items,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="container-fluid p-0">
      <Row className="data-grid-header fw-bold border-bottom p-2 py-3">
        <Col xs={2}>ID</Col>
        <Col xs={3}>Name</Col>
        <Col xs={4}>Permissions</Col>
        <Col xs={3}>Actions</Col>
      </Row>

      {items.map((item) => (
        <Row
          key={item.id}
          className="data-grid-row py-2 border-bottom align-items-center hover-bg"
        >
          <Col xs={2}>{item.id}</Col>
          <Col xs={3}>{item.name}</Col>
          <Col xs={4}>
            <ul className="mb-0 ps-3">
              {item.permissions.map((perm) => (
                <li key={perm.id}>{perm.name}</li>
              ))}
            </ul>
          </Col>
          <Col xs={3} className="d-flex gap-2">
            <Button size="sm" variant="light" onClick={() => onEdit(item.id)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </Button>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default RolesAndPermissionsGrid;

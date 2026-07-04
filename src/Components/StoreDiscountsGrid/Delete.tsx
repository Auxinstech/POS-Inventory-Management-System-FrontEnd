import { Modal, Button, Row, Col } from "react-bootstrap";
import { useAppDispatch } from "../../Hook/hooks";
import { deleteDiscount } from "../../Redux/Ducks/homeSlice";

const DeleteDiscountModal = ({
  showDeleteModal,
  setShowDeleteModal,
  selectedRow,
}: {
  showDeleteModal: boolean;
  setShowDeleteModal: any;
  selectedRow: any;
}) => {
  const dispatch = useAppDispatch();

  const handleDelete = async (id: number) => {
    if (!id) return;
    dispatch(
      deleteDiscount(id, {
        onSuccess: () => {
          setShowDeleteModal(false);
        },
      }),
    );
  };

  return (
    <Modal
      show={showDeleteModal}
      onHide={() => setShowDeleteModal(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete Discount</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {selectedRow && (
          <div>
            <p className="mb-3">
              Are you sure you want to delete the following discount?
            </p>

            <div className="bg-light p-3 rounded mb-3">
              <Row className="mb-2">
                <Col md={4}>
                  <strong>Discount ID:</strong>
                </Col>
                <Col md={8}>{selectedRow.id}</Col>
              </Row>

              <Row className="mb-2">
                <Col md={4}>
                  <strong>Store:</strong>
                </Col>
                <Col md={8}>
                  {selectedRow.store?.name || selectedRow.store_id}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={4}>
                  <strong>Discount Type:</strong>
                </Col>
                <Col md={8}>{selectedRow.discount_type?.toUpperCase()}</Col>
              </Row>

              <Row className="mb-2">
                <Col md={4}>
                  <strong>Discount Value:</strong>
                </Col>
                <Col md={8}>
                  {selectedRow.discount_mode === "percentage"
                    ? `${selectedRow.percentage}%`
                    : `$${Number(selectedRow.amount).toFixed(2)}`}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={4}>
                  <strong>Valid From:</strong>
                </Col>
                <Col md={8}>
                  {selectedRow.start_date} to {selectedRow.end_date}
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <strong>Status:</strong>
                </Col>
                <Col md={8}>
                  <span
                    className={`badge bg-${selectedRow.is_active ? "success" : "danger"}`}
                  >
                    {selectedRow.is_active ? "Active" : "Inactive"}
                  </span>
                </Col>
              </Row>
            </div>

            <div className="alert alert-warning">
              <strong>Warning:</strong> This action cannot be undone. Deleting
              this discount will:
              <ul className="mt-2 mb-0">
                <li>Remove the discount from all applicable orders</li>
                <li>Delete all discount usage history</li>
                <li>Affect any pending transactions using this discount</li>
              </ul>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={() => {
            handleDelete(selectedRow?.id);
          }}
        >
          Delete Discount
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteDiscountModal;

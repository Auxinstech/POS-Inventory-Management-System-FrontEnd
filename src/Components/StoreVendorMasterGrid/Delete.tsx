import { Modal, Button, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { useAppDispatch } from "Hook/hooks";
import { deleteVendor } from "../../Redux/Ducks/vendorSlice"; // Adjust import path as needed

const DeleteVendorModal = ({
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
      deleteVendor(id, {
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
        <Modal.Title>Confirm Delete Vendor</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {selectedRow && (
          <div>
            <p className="mb-3">
              Are you sure you want to delete the following Vendor?
            </p>

            <div className="bg-light p-3 rounded mb-3">
              <Row className="mb-2">
                <Col md={4}>
                  <strong>Vendor Code:</strong>
                </Col>
                <Col md={8}>{selectedRow.code}</Col>
              </Row>

              <Row className="mb-2">
                <Col md={4}>
                  <strong>Vendor Name:</strong>
                </Col>
                <Col md={8}>{selectedRow.name}</Col>
              </Row>

              <Row className="mb-2">
                <Col md={4}>
                  <strong>Phone:</strong>
                </Col>
                <Col md={8}>{selectedRow.phone || "-"}</Col>
              </Row>

              <Row className="mb-2">
                <Col md={4}>
                  <strong>Email:</strong>
                </Col>
                <Col md={8}>{selectedRow.email || "-"}</Col>
              </Row>

              <Row className="mb-2">
                <Col md={4}>
                  <strong>Current Balance:</strong>
                </Col>
                <Col md={8}>
                  <span
                    className={
                      Number(selectedRow.balance) > 0
                        ? "text-danger"
                        : "text-success"
                    }
                  >
                    ${Number(selectedRow.balance).toFixed(2)}
                  </span>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <strong>Status:</strong>
                </Col>
                <Col md={8}>
                  <span
                    className={`badge bg-${selectedRow.status ? "success" : "danger"}`}
                  >
                    {selectedRow.status ? "Active" : "Inactive"}
                  </span>
                </Col>
              </Row>
            </div>

            <div className="alert alert-warning">
              <strong>Warning:</strong> This action cannot be undone. Deleting
              this Vendor will:
              <ul className="mt-2 mb-0">
                <li>Remove all associated transactions</li>
                <li>Delete Vendor history</li>
                <li>Clear any pending balances</li>
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
          Delete Vendor
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteVendorModal;

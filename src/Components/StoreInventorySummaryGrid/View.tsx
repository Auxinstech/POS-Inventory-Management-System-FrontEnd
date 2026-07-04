import { Modal, Button, Form, FormGroup, Row, Col } from "react-bootstrap";
import { useState } from "react";

const ViewInventoryModal = ({
  showViewModal,
  setShowViewModal,
  selectedRow,
}: {
  showViewModal: boolean;
  setShowViewModal: any;
  selectedRow: any;
}) => {
  return (
    <Modal
      show={showViewModal}
      onHide={() => setShowViewModal(false)}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>View Item Adjustment</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {selectedRow && (
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>ID</Form.Label>
                <Form.Control value={selectedRow.id} disabled />
              </Col>

              <Col md={6}>
                <Form.Label>Store Name</Form.Label>
                <Form.Control value={selectedRow.store_name} disabled />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Item Name</Form.Label>
                <Form.Control value={selectedRow.item_name} disabled />
              </Col>

              <Col md={6}>
                <Form.Label>Quantity</Form.Label>
                <Form.Control value={selectedRow.quantity} disabled />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Unit Price</Form.Label>
                <Form.Control
                  value={Number(selectedRow.unit_price).toFixed(2)}
                  disabled
                />
              </Col>

              <Col md={6}>
                <Form.Label>Total Value</Form.Label>
                <Form.Control
                  value={Number(selectedRow.total_value).toFixed(2)}
                  disabled
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Item ID</Form.Label>
                <Form.Control value={selectedRow.item_id} disabled />
              </Col>

              <Col md={6}>
                <Form.Label>Modifier ID</Form.Label>
                <Form.Control value={selectedRow.modifier_id || "-"} disabled />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Type</Form.Label>
                <Form.Control value={selectedRow.type} disabled />
              </Col>

              <Col md={6}>
                <Form.Label>Unit</Form.Label>
                <Form.Control value={selectedRow.unit} disabled />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Label>Reference</Form.Label>
                <Form.Control value={selectedRow.reference} disabled />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Updated By</Form.Label>
                <Form.Control value={selectedRow.updated_by} disabled />
              </Col>

              <Col md={6}>
                <Form.Label>Created At</Form.Label>
                <Form.Control
                  value={
                    selectedRow.created_at
                      ? new Date(selectedRow.created_at).toLocaleDateString()
                      : "-"
                  }
                  disabled
                />
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowViewModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewInventoryModal;

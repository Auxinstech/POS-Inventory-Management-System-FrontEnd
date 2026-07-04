import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const ViewCustomerModal = ({
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
        <Modal.Title>View Customer Details</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {selectedRow && (
          <Form>
            {/* Basic Information */}
            <h6 className="mb-3 text-primary">Basic Information</h6>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>ID</Form.Label>
                <Form.Control value={selectedRow.id} disabled />
              </Col>

              <Col md={4}>
                <Form.Label>Customer Code</Form.Label>
                <Form.Control value={selectedRow.code} disabled />
              </Col>

              <Col md={4}>
                <Form.Label>Status</Form.Label>
                <Form.Control
                  value={selectedRow.status ? "Active" : "Inactive"}
                  disabled
                  className={
                    selectedRow.status ? "text-success" : "text-danger"
                  }
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Customer Name</Form.Label>
                <Form.Control value={selectedRow.name} disabled />
              </Col>

              <Col md={6}>
                <Form.Label>Customer Type</Form.Label>
                <Form.Control
                  value={selectedRow.type?.toUpperCase() || "-"}
                  disabled
                />
              </Col>
            </Row>

            {/* Contact Information */}
            <h6 className="mb-3 text-primary mt-3">Contact Information</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Phone</Form.Label>
                <Form.Control value={selectedRow.phone || "-"} disabled />
              </Col>

              <Col md={6}>
                <Form.Label>Email</Form.Label>
                <Form.Control value={selectedRow.email || "-"} disabled />
              </Col>
            </Row>

            {/* Address Information */}
            <h6 className="mb-3 text-primary mt-3">Address Information</h6>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Label>Address</Form.Label>
                <Form.Control value={selectedRow.address || "-"} disabled />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>City</Form.Label>
                <Form.Control value={selectedRow.city || "-"} disabled />
              </Col>

              <Col md={6}>
                <Form.Label>Country</Form.Label>
                <Form.Control value={selectedRow.country || "-"} disabled />
              </Col>
            </Row>

            {/* Financial Information */}
            <h6 className="mb-3 text-primary mt-3">Financial Information</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Credit Limit</Form.Label>
                <Form.Control
                  value={`$${Number(selectedRow.credit_limit).toFixed(2)}`}
                  disabled
                />
              </Col>

              <Col md={6}>
                <Form.Label>Current Balance</Form.Label>
                <Form.Control
                  value={`$${Number(selectedRow.balance).toFixed(2)}`}
                  disabled
                  className={
                    Number(selectedRow.balance) > 0
                      ? "text-danger"
                      : "text-success"
                  }
                />
              </Col>
            </Row>

            {/* Store Information */}
            <h6 className="mb-3 text-primary mt-3">Store Information</h6>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Label>Store</Form.Label>
                <Form.Control
                  value={
                    selectedRow.store_name ||
                    selectedRow.store?.name ||
                    "No Store Assigned"
                  }
                  disabled
                />
              </Col>
            </Row>

            {/* Audit Information */}
            <h6 className="mb-3 text-primary mt-3">Audit Information</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Created By</Form.Label>
                <Form.Control
                  value={
                    selectedRow.creator?.name || selectedRow.created_by || "-"
                  }
                  disabled
                />
              </Col>

              <Col md={6}>
                <Form.Label>Created At</Form.Label>
                <Form.Control
                  value={
                    selectedRow.created_at
                      ? new Date(selectedRow.created_at).toLocaleString()
                      : "-"
                  }
                  disabled
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Label>Last Updated</Form.Label>
                <Form.Control
                  value={
                    selectedRow.updated_at
                      ? new Date(selectedRow.updated_at).toLocaleString()
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

export default ViewCustomerModal;

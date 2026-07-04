import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const ViewDiscountModal = ({
  showViewModal,
  setShowViewModal,
  selectedRow,
}: {
  showViewModal: boolean;
  setShowViewModal: any;
  selectedRow: any;
}) => {
  console.log("selectedRow", selectedRow);
  return (
    <Modal
      show={showViewModal}
      onHide={() => setShowViewModal(false)}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>View Discount Details</Modal.Title>
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
                <Form.Label>Store</Form.Label>
                <Form.Control value={selectedRow.store_name || "-"} disabled />
              </Col>

              <Col md={4}>
                <Form.Label>Status</Form.Label>
                <Form.Control
                  value={selectedRow.is_active ? "Active" : "Inactive"}
                  disabled
                  className={
                    selectedRow.is_active ? "text-success" : "text-danger"
                  }
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Discount Type</Form.Label>
                <Form.Control
                  value={selectedRow.discount_type?.toUpperCase() || "-"}
                  disabled
                />
              </Col>

              <Col md={6}>
                <Form.Label>Discount Mode</Form.Label>
                <Form.Control
                  value={selectedRow.discount_mode?.toUpperCase() || "-"}
                  disabled
                />
              </Col>
            </Row>

            {/* Discount Details */}
            <h6 className="mb-3 text-primary mt-3">Discount Details</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Discount Value</Form.Label>
                <Form.Control
                  value={selectedRow.discount_value || "-"}
                  disabled
                  className="fw-bold text-primary"
                />
              </Col>

              <Col md={6}>
                <Form.Label>Min Order Value</Form.Label>
                <Form.Control
                  value={selectedRow.min_order_value || "-"}
                  disabled
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Max Discount</Form.Label>
                <Form.Control
                  value={selectedRow.max_discount || "-"}
                  disabled
                />
              </Col>

              {/* Optional: Show percentage or amount details based on mode */}
              {selectedRow.discount_mode === "percent" &&
                selectedRow.percentage !== "-" && (
                  <Col md={6}>
                    <Form.Label>Percentage Detail</Form.Label>
                    <Form.Control value={selectedRow.percentage} disabled />
                  </Col>
                )}

              {selectedRow.discount_mode === "amount" &&
                selectedRow.amount !== "-" && (
                  <Col md={6}>
                    <Form.Label>Amount Detail</Form.Label>
                    <Form.Control value={selectedRow.amount} disabled />
                  </Col>
                )}
            </Row>

            {/* Date & Time */}
            <h6 className="mb-3 text-primary mt-3">Validity Period</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  value={
                    selectedRow.start_date !== "-"
                      ? selectedRow.start_date
                      : "-"
                  }
                  disabled
                />
              </Col>

              <Col md={6}>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  value={
                    selectedRow.end_date !== "-" ? selectedRow.end_date : "-"
                  }
                  disabled
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  value={
                    selectedRow.start_time !== "-"
                      ? selectedRow.start_time
                      : "-"
                  }
                  disabled
                />
              </Col>

              <Col md={6}>
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  value={
                    selectedRow.end_time !== "-" ? selectedRow.end_time : "-"
                  }
                  disabled
                />
              </Col>
            </Row>

            {/* Restrictions */}
            <h6 className="mb-3 text-primary mt-3">Restrictions</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Postcode</Form.Label>
                <Form.Control
                  value={selectedRow.postcode || "All Areas"}
                  disabled
                />
              </Col>

              <Col md={6}>
                <Form.Label>First Time Users Only</Form.Label>
                <Form.Control
                  value={selectedRow.first_time_users_only ? "Yes" : "No"}
                  disabled
                />
              </Col>
            </Row>

            {/* Available Days */}
            <h6 className="mb-3 text-primary mt-3">Available Days</h6>
            <Row className="mb-3">
              <Col md={12}>
                <div className="d-flex gap-3 flex-wrap">
                  {selectedRow.monday && (
                    <span className="badge bg-primary">Monday</span>
                  )}
                  {selectedRow.tuesday && (
                    <span className="badge bg-primary">Tuesday</span>
                  )}
                  {selectedRow.wednesday && (
                    <span className="badge bg-primary">Wednesday</span>
                  )}
                  {selectedRow.thursday && (
                    <span className="badge bg-primary">Thursday</span>
                  )}
                  {selectedRow.friday && (
                    <span className="badge bg-primary">Friday</span>
                  )}
                  {selectedRow.saturday && (
                    <span className="badge bg-primary">Saturday</span>
                  )}
                  {selectedRow.sunday && (
                    <span className="badge bg-primary">Sunday</span>
                  )}
                  {!selectedRow.monday &&
                    !selectedRow.tuesday &&
                    !selectedRow.wednesday &&
                    !selectedRow.thursday &&
                    !selectedRow.friday &&
                    !selectedRow.saturday &&
                    !selectedRow.sunday && (
                      <span className="text-muted">No days selected</span>
                    )}
                </div>
              </Col>
            </Row>

            {/* Audit Information */}
            <h6 className="mb-3 text-primary mt-3">Audit Information</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Created At</Form.Label>
                <Form.Control
                  value={
                    selectedRow.created_at !== "-"
                      ? selectedRow.created_at
                      : "-"
                  }
                  disabled
                />
              </Col>

              <Col md={6}>
                <Form.Label>Last Updated</Form.Label>
                <Form.Control
                  value={
                    selectedRow.updated_at !== "-"
                      ? selectedRow.updated_at
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

export default ViewDiscountModal;

import { useAppDispatch } from "Hook/hooks";
import React, { useState } from "react";
import { Modal, Button, Form, Alert, Card } from "react-bootstrap";
import { setGenerateInvoice } from "../../Redux/Ducks/reportSlice";

export default function GenerateInvoice({ store_id }: { store_id: number }) {
  const dispatch = useAppDispatch();

  const today = new Date().toISOString().split("T")[0];

  const [showModal, setShowModal] = useState(false);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [success, setSuccess] = useState(false);

  const openModal = () => {
    setShowModal(true);
    setSuccess(false);
  };

  const closeModal = () => setShowModal(false);

  const handleGenerateInvoice = () => {
    console.log("Generating invoice for store:", store_id);
    dispatch(
      setGenerateInvoice({ store_id, from_date: fromDate, to_date: toDate })
    );
    setSuccess(true);

    setTimeout(() => {
      setShowModal(false);
    }, 1200);
  };

  return (
    <div className="invoice-wrapper">
      <Card className="invoice-card shadow-sm border-0">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="title">Invoice Management</h4>
            <p className="subtitle">Generate invoices between selected dates</p>
          </div>

          <Button
            variant="primary"
            className="modern-btn"
            onClick={openModal}
            disabled={!store_id}
          >
            + Generate Invoice
          </Button>
        </Card.Body>
      </Card>

      {success && (
        <Alert variant="success" className="mt-3 shadow-sm fade-in">
          <strong>Success!</strong> Invoice has been generated.
        </Alert>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={closeModal} centered animation>
        <Modal.Header closeButton>
          <Modal.Title className="fw-semibold">Generate Invoice</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">From Date</Form.Label>
              <Form.Control
                className="modern-input"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-semibold">To Date</Form.Label>
              <Form.Control
                className="modern-input"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="light"
            className="modern-btn-light"
            onClick={closeModal}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            className="modern-btn"
            onClick={handleGenerateInvoice}
            disabled={!fromDate || !toDate}
          >
            Generate
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

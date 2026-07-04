import { Modal, Button, Form, FormGroup, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { useAppDispatch } from "Hook/hooks";
import { deleteInventoryTranscations } from "../../Redux/Ducks/reportSlice";

const DeleteInventoryModal = ({
  showDeleteModal,
  setShowDeleteModal,
  selectedRow,
  openDeleteModal,
}: {
  showDeleteModal: boolean;
  setShowDeleteModal: any;
  selectedRow: any;
  openDeleteModal: any;
}) => {
  const dispatch = useAppDispatch();

  const handleDelete = async (id: number) => {
    if (!id) return;
    dispatch(deleteInventoryTranscations(id));
    setShowDeleteModal(false);
  };
  return (
    <Modal
      show={showDeleteModal}
      onHide={() => setShowDeleteModal(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {selectedRow && (
          <p>
            Are you sure you want to delete inventory record for{" "}
            <strong>{selectedRow.item_name}</strong>?
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={() => {
            handleDelete(selectedRow.id);
          }}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteInventoryModal;

import {
  Modal,
  Button,
  Form,
  FormGroup,
  Col,
  Dropdown,
  Row,
} from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../Hook/hooks";
import { Order } from "../../Redux/Ducks/orderSlice";
import { addInventoryTranscations } from "../../Redux/Ducks/reportSlice";
import { Item } from "Models/item";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import { Select } from "@mui/material";

const CreateInventoryModal = ({
  show,
  setShow,
  store_id,
  items,
}: {
  show: boolean;
  setShow: any;
  store_id: number;
  items: Item[];
}) => {
  const dispatch = useAppDispatch();

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchItem, setSearchItem] = useState("");

  const filteredItems = useMemo(() => {
    if (!items) return [];

    const term = searchItem.trim();
    if (!term) return items;

    return items.filter((i) => i.id.toString().includes(term));
  }, [searchItem, items]);

  const types = ["adjustment"];

  const [formData, setFormData] = useState({
    store_id: store_id,
    item_id: 0,
    quantity: 0,
    reference: "",
    unit: "0",
    type: "adjustment",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "unit" ? value.toString() : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedItem) {
      return;
    }
    const payload = {
      ...formData,
      item_id: selectedItem?.id,
      store_id: store_id,
    };

    dispatch(addInventoryTranscations(payload));
    console.log(payload);

    // Reset form and close modal
    setFormData({
      store_id: store_id,
      item_id: 0,
      quantity: 0,
      reference: "",
      unit: "0",
      type: "adjustment",
    });
    setShow(false);
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        setShow(false);
        setSelectedItem(null);
      }}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Item Adjustment Form</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {items.length > 0 ? (
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md="12" className="p-6">
                {/* Order Selection */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Select Item</Form.Label>

                  <Dropdown className="w-100">
                    <Dropdown.Toggle
                      className="w-100 text-start text-primary fw-semibold"
                      variant="outline-secondary"
                    >
                      {selectedItem
                        ? `Item #${selectedItem.id} - ${selectedItem.name}`
                        : "Choose an item"}
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                      className="w-100 p-2 shadow-sm order-dropdown-menu "
                      style={{ maxHeight: 300, overflowY: "auto" }}
                    >
                      {/* Search Input */}
                      <Form.Group className="mb-2">
                        <Form.Label className="small text-muted">
                          Search by Item ID
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. 6042"
                          value={searchItem}
                          onChange={(e) =>
                            setSearchItem(e.target.value.toLowerCase())
                          }
                          size="sm"
                        />
                      </Form.Group>

                      <Dropdown.Divider />

                      {/* Orders List */}
                      {filteredItems?.length > 0 ? (
                        filteredItems.map((item) => (
                          <Dropdown.Item
                            key={item.id}
                            className="py-2"
                            onClick={() => {
                              setSelectedItem(item);
                            }}
                          >
                            <div className="fw-medium">
                              #{item.id} - {item.name}
                            </div>
                            <div className="small text-muted">
                              Click to view details
                            </div>
                          </Dropdown.Item>
                        ))
                      ) : (
                        <div className="text-muted text-center small py-2">
                          No matching items found
                        </div>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>

              <Col md="12" className="p-6 mb-4">
                <Form.Text className="text-muted">
                  Select an item to enable inventory actions.
                </Form.Text>
              </Col>

              <Col md="6" className="p-6">
                <FormGroup className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    size="lg"
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    disabled={!selectedItem}
                  />
                </FormGroup>
              </Col>

              <Col md="6" className="p-6">
                <FormGroup className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Control
                    size="lg"
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    disabled={!selectedItem}
                  />
                </FormGroup>
              </Col>

              <Col md="6" className="p-6">
                <FormGroup className="mb-3">
                  <Form.Label>Type</Form.Label>

                  <Form.Select
                    size="lg"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    disabled={!selectedItem}
                  >
                    <option value="">Select Type</option>

                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type.toUpperCase()}
                      </option>
                    ))}
                  </Form.Select>
                </FormGroup>
              </Col>

              <Col md="6" className="p-6 ">
                <FormGroup className="mb-3">
                  <Form.Label>Reference</Form.Label>
                  <Form.Control
                    size="lg"
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    required
                    disabled={!selectedItem}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShow(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create
              </Button>
            </Modal.Footer>
          </Form>
        ) : (
          <div className="text-muted text-center small">
            Please Wait, Loading Items...
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CreateInventoryModal;

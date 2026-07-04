import FeatherIcon from "feather-icons-react";
import { CreateItemRequest } from "Models/item";
import React, { useState } from "react";
import {
  Accordion,
  Button,
  Col,
  FloatingLabel,
  Form,
  Row,
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ImagePicker from "../../Components/ImagePicker";
import { saveItem } from "../../Redux/Ducks/homeSlice";
import ScheduleForm from "Components/Scheduler/Scheduler";

const initialModel: CreateItemRequest = {
  name: "",
  type: "product",
  description: "",
  price: 0,
  min: 0,
  max: 0,
  image: "",
  is_active: true,
  vat_percent: 0,
  item_availability: "available",
  eligible_online_discount: true,
  eligible_collection_discount: true,
  allow_coupon: true,
  excluded_free_gift: true,
  contains_alcohol: false,
  contains_tobacco: false,
  food_type: "",
  offer: "",
  barcode: "",
  calories: "",
  serving_size: "",
  store_id: 0,
  categories: [],
  stock: 1,
  unit: "1",
  default_discount: 0,
  default_discount_type: "amount",
  default_quantity: 1,

  available_for_delivery: true,
  available_for_pickup: true,

  schedule: "NONE",
  schedule_config: null,
};

const AddItem: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id } = useParams();
  const [model, setModel] = useState<CreateItemRequest>(initialModel);
  const [vat_enabled, set_vat_enabled] = useState<boolean>(true);

  const handleChange = (field: keyof CreateItemRequest, value: any) => {
    setModel((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    dispatch(
      saveItem(
        { ...model, categories: [parseInt(id as any)] },
        {
          onSuccess: () => {
            back();
            setModel(initialModel);
          },
        },
      ),
    );
  };

  const back = () => {
    navigate(-1);
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
    <div>
      <div className="form-header">
        <a role="button" onClick={back}>
          <FeatherIcon icon="chevron-left" size={16} />
        </a>
        <span>Add Item</span>
      </div>

      <div className="form-container">
        <div className="form-section">
          <Row>
            <Col md="6">
              <Row>
                <Col md="12">
                  <FloatingLabel
                    controlId="name"
                    label="Item Name"
                    className="mb-3"
                  >
                    <Form.Control
                      size="sm"
                      type="text"
                      value={model.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                  </FloatingLabel>
                </Col>
                <Col md="6">
                  <FloatingLabel
                    controlId="price"
                    label="Price"
                    className="mb-3"
                  >
                    <Form.Control
                      type="number"
                      value={model.price}
                      onChange={(e) =>
                        handleChange("price", parseFloat(e.target.value))
                      }
                      placeholder="VAT %"
                    />
                  </FloatingLabel>
                </Col>
                <Col md="3">
                  <FloatingLabel controlId="min" label="Min" className="mb-3">
                    <Form.Control
                      type="number"
                      value={model.min}
                      onChange={(e) =>
                        handleChange("min", parseFloat(e.target.value))
                      }
                      placeholder="Min"
                    />
                  </FloatingLabel>
                </Col>
                <Col md="3">
                  <FloatingLabel controlId="max" label="Max" className="mb-3">
                    <Form.Control
                      type="number"
                      value={model.max}
                      onChange={(e) =>
                        handleChange("max", parseFloat(e.target.value))
                      }
                      placeholder="Max"
                    />
                  </FloatingLabel>
                </Col>
                <Col md="4">
                  <Form.Check
                    type="switch"
                    label="VAT"
                    checked={vat_enabled}
                    onChange={(e: any) => set_vat_enabled(e.target.checked)}
                  />
                </Col>
                <Col md="4">
                  <FloatingLabel
                    controlId="vat_percent"
                    label="Vat %"
                    className="mb-3"
                  >
                    <Form.Control
                      type="number"
                      value={model.vat_percent}
                      disabled={!vat_enabled}
                      onChange={(e) =>
                        handleChange("vat_percent", parseFloat(e.target.value))
                      }
                      placeholder="VAT %"
                    />
                  </FloatingLabel>
                </Col>
              </Row>
            </Col>
            <Col md="6">
              <ImagePicker
                value={model.image || ""}
                onImageSelect={(base64) => handleChange("image", base64)}
              />
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <FloatingLabel
                controlId="description"
                label="Description"
                className="mb-3"
              >
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={model.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </FloatingLabel>
            </Col>

            <Col md="3">
              <FloatingLabel controlId="stock" label="Stock" className="mb-3">
                <Form.Control
                  type="number"
                  value={model.stock}
                  onChange={(e) =>
                    handleChange("stock", parseFloat(e.target.value))
                  }
                  placeholder="Stock"
                />
              </FloatingLabel>
            </Col>
            <Col md="3">
              <FloatingLabel controlId="unit" label="Unit" className="mb-3">
                <Form.Control
                  type="number"
                  value={model.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                  placeholder="Unit"
                />
              </FloatingLabel>
            </Col>
            <Col md="3">
              <FloatingLabel
                controlId="Default Quanitity"
                label="Default Quanitity"
                className="mb-3"
              >
                <Form.Control
                  type="number"
                  value={model.default_quantity}
                  onChange={(e) =>
                    handleChange("default_quantity", parseFloat(e.target.value))
                  }
                  placeholder="Default Quanitity"
                />
              </FloatingLabel>
            </Col>

            <Col md="4">
              <FloatingLabel
                controlId="default_discount_type"
                label="Default Discount Type"
                className="mb-3"
              >
                <Form.Select
                  value={model.default_discount_type}
                  onChange={(e) =>
                    handleChange("default_discount_type", e.target.value)
                  }
                >
                  <option value="amount">Amount</option>
                  <option value="percentage">Percentage</option>
                </Form.Select>
              </FloatingLabel>
            </Col>

            <Col md="3">
              <FloatingLabel
                controlId="Default Discount"
                label={`Default Discount ${model.default_discount_type}`}
                className="mb-3"
              >
                <Form.Control
                  size="sm"
                  type="number"
                  value={model.default_discount}
                  onChange={(e) =>
                    handleChange("default_discount", parseFloat(e.target.value))
                  }
                  placeholder={`Default Discount ${model.default_discount_type}`}
                />
              </FloatingLabel>
            </Col>
          </Row>
        </div>

        {renderAccordion(
          "Availability",
          <div className="form-section">
            <Row>
              <Col md="4">
                <FloatingLabel
                  controlId="item_availability"
                  label="Item Availability"
                  className="mb-3"
                >
                  <Form.Select
                    value={model.item_availability}
                    onChange={(e) =>
                      handleChange("item_availability", e.target.value)
                    }
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="soldout">Sold Out</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md="3">
                <Form.Check
                  type="switch"
                  label="Available for Delivery"
                  checked={model.available_for_delivery}
                  onChange={(e: any) =>
                    handleChange("available_for_delivery", e.target.checked)
                  }
                />
              </Col>
              <Col md="3">
                <Form.Check
                  type="switch"
                  label="Available for Pickup"
                  checked={model.available_for_pickup}
                  onChange={(e: any) =>
                    handleChange("available_for_pickup", e.target.checked)
                  }
                />
              </Col>
              <ScheduleForm<CreateItemRequest>
                model={model}
                setModel={setModel}
              />{" "}
            </Row>
          </div>,
        )}

        {renderAccordion(
          "Eligibility",
          <div className="form-section">
            <Row>
              <Col md="3">
                <Form.Check
                  type="switch"
                  label="Eligible for Online Discount"
                  checked={model.eligible_online_discount}
                  onChange={(e: any) =>
                    handleChange("eligible_online_discount", e.target.checked)
                  }
                />
              </Col>
              <Col md="3">
                <Form.Check
                  type="switch"
                  label="Eligible for Collection Discount"
                  checked={model.eligible_collection_discount}
                  onChange={(e: any) =>
                    handleChange(
                      "eligible_collection_discount",
                      e.target.checked,
                    )
                  }
                />
              </Col>
              <Col md="3">
                <Form.Check
                  type="switch"
                  label="Allow Coupon"
                  checked={model.allow_coupon}
                  onChange={(e: any) =>
                    handleChange("allow_coupon", e.target.checked)
                  }
                />
              </Col>
              <Col md="3">
                <Form.Check
                  type="switch"
                  label="Excluded Free Gift"
                  checked={model.excluded_free_gift}
                  onChange={(e: any) =>
                    handleChange("excluded_free_gift", e.target.checked)
                  }
                />
              </Col>
            </Row>
          </div>,
        )}

        {renderAccordion(
          "Food Type",
          <div className="form-section">
            <Row>
              <Col md="3">
                <Form.Check
                  type="switch"
                  label="Contains Alcohol"
                  checked={model.contains_alcohol}
                  onChange={(e: any) =>
                    handleChange("contains_alcohol", e.target.checked)
                  }
                />
              </Col>
              <Col md="3">
                <Form.Check
                  type="switch"
                  label="Contains Tobacco"
                  checked={model.contains_tobacco}
                  onChange={(e: any) =>
                    handleChange("contains_tobacco", e.target.checked)
                  }
                />
              </Col>
              <Col md="3">
                <FloatingLabel
                  controlId="food_type"
                  label="Food Type"
                  className="mb-3"
                >
                  <Form.Select
                    value={model.food_type}
                    onChange={(e) => handleChange("food_type", e.target.value)}
                  >
                    <option>Gluten Free</option>
                    <option>Vegan</option>
                    <option>Vegetarian</option>
                    <option>Non Vegeterian</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
            </Row>
          </div>,
        )}

        <div className="form-section">
          <Row>
            <Col md="3">
              <FloatingLabel controlId="offer" label="Offers" className="mb-3">
                <Form.Select
                  value={model.offer}
                  onChange={(e) => handleChange("offer", e.target.value)}
                >
                  <option value="">None</option>
                  <option value="BOGOFF">BOGOFF</option>
                </Form.Select>
              </FloatingLabel>
            </Col>
          </Row>
        </div>
      </div>

      <div className="form-footer">
        <Button variant="primary" className="ms-auto" onClick={handleSave}>
          SAVE
        </Button>
      </div>
    </div>
  );
};

export default AddItem;

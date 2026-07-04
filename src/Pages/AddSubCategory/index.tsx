import FeatherIcon from "feather-icons-react";
import { CreateCategoryRequest } from "Models/category";
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
import { saveCategory } from "../../Redux/Ducks/homeSlice";
import ScheduleFormCategory from "Components/Scheduler-Category/Scheduler";

const initialModel: CreateCategoryRequest = {
  name: "",
  description: "",
  image: "",
  status: "active",
  vat_percent: 0,
  category_availability: "Available",
  available_for_delivery: true,
  available_for_pickup: true,
  eligible_online_discount: true,
  eligible_collection_discount: true,
  allow_coupon: true,
  excluded_free_gift: true,
  food_section: "",
  offer: "",
  store_id: 0,
  parent_id: null,
  schedule: "NONE",
  schedule_config: null,
};

const AddSubCategory: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id } = useParams();
  const [model, setModel] = useState<CreateCategoryRequest>(initialModel);
  const [vat_enabled, set_vat_enabled] = useState<boolean>(true);

  const handleChange = (field: keyof CreateCategoryRequest, value: any) => {
    setModel((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    dispatch(
      saveCategory(
        { ...model, parent_id: parseInt(id as any) },
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
        <span>Add Sub Category</span>
      </div>

      <div className="form-container">
        <div className="form-section">
          <Row>
            <Col md="6">
              <Row>
                <Col md="12">
                  <FloatingLabel
                    controlId="name"
                    label="Sub Category Name"
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
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
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
        </div>

        {renderAccordion(
          "Availability",

          <Row>
            <Col md="4">
              <FloatingLabel
                controlId="category_availability"
                label="Category Availability"
                className="mb-3"
              >
                <Form.Select
                  value={model.category_availability}
                  onChange={(e) =>
                    handleChange("category_availability", e.target.value)
                  }
                >
                  <option>Available</option>
                  <option>Unavailable</option>
                  <option>Sold Out</option>
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
            <ScheduleFormCategory<CreateCategoryRequest>
              model={model}
              setModel={setModel}
            />{" "}
          </Row>,
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
                  label="Allow Coupon for this Category"
                  checked={model.allow_coupon}
                  onChange={(e: any) =>
                    handleChange("allow_coupon", e.target.checked)
                  }
                />
              </Col>
              <Col md="3">
                <Form.Check
                  type="switch"
                  label="Excluded for Free Gift"
                  checked={model.excluded_free_gift}
                  onChange={(e: any) =>
                    handleChange("excluded_free_gift", e.target.checked)
                  }
                />
              </Col>
              {/* <Col md="3">
                            <FloatingLabel
                                controlId="Food Section"
                                label="food_section"
                                className="mb-3"
                            >
                                <Form.Select value={model.food_section} onChange={(e) => handleChange('food_section', e.target.value)}>
                                    <option value="">Please select</option>
                                    <option value="Starters">Starters</option>
                                    <option value="Main Course">Main Course</option>
                                    <option value="Deserts">Deserts</option>
                                    <option value="Drink">Drink</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col> */}
            </Row>
          </div>,
        )}

        {renderAccordion(
          "Miscellaneous",

          <div className="form-section">
            <Row>
              <Col md="3">
                <FloatingLabel
                  controlId="offer"
                  label="Offers"
                  className="mb-3"
                >
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
          </div>,
        )}
      </div>

      <div className="form-footer">
        <Button variant="primary" className="ms-auto" onClick={handleSave}>
          SAVE
        </Button>
      </div>
    </div>
  );
};

export default AddSubCategory;

import ModifierGroupGrid from "Components/ModifierGroupGrid";
import FeatherIcon from "feather-icons-react";
import React, { useEffect, useState } from "react";
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
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import { requestGetItem } from "../../Redux/Sagas/Requests/home";
import { Item, UpdateItemRequest } from "Models/item";
import {
  getCategories,
  removeItem,
  updateItem,
} from "../../Redux/Ducks/homeSlice";
import { useAppSelector } from "Hook/hooks";
import { ModifierGroup } from "Models/modifierGroup";
import ScheduleForm from "Components/Scheduler/Scheduler";

const initialModel: UpdateItemRequest = {
  name: "",
  type: "product",
  description: "",
  price: 0,
  min: 0,
  max: 0,
  image: "",
  is_active: true,
  vat_percent: 0,
  item_availability: "",
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
  allergens: [],
  categories: [],
  modifier_groups: [],
  id: 0,
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

const EditItem: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id }: any = useParams();
  const [model, setModel] = useState<UpdateItemRequest>(initialModel);
  const [vat_enabled, set_vat_enabled] = useState<boolean>(true);
  const store_id = useAppSelector((x) => x.Home.selected_store) as any;
  // const ModifiersGroupsData = useAppSelector((x) => x.Home.categories);
  const handleChange = (field: keyof UpdateItemRequest, value: any) => {
    console.log(field, value);
    setModel((prev) => ({ ...prev, [field]: value }));
  };

  console.log(model);
  // const handleSave = async () => {
  //   dispatch(toggleLoader(true));

  //   let resModel: UpdateItemRequest = model;
  //   console.log("resModel", resModel);
  //   resModel.categories = resModel.categories.map((x: any) => x.id);
  //   resModel.allergens = resModel.allergens.map((x: any) => x.id);
  //   resModel.modifier_groups = resModel.modifier_groups.map((x: any) => x.id);
  //   await dispatch(
  //     updateItem(model, {
  //       onSuccess: async () => {
  //         back();
  //         setModel(initialModel);
  //         dispatch(toggleLoader(false));
  //         dispatch(getCategories(store_id));
  //         loadItem();
  //       },
  //     }),
  //   );
  // };

  const handleSave = async () => {
    dispatch(toggleLoader(true));

    // Create a deep copy of the model to avoid mutation
    let resModel: UpdateItemRequest = JSON.parse(JSON.stringify(model));

    console.log("resModel", resModel);
    resModel.categories = resModel.categories.map((x: any) => x.id);
    resModel.allergens = resModel.allergens.map((x: any) => x.id);
    resModel.modifier_groups = resModel.modifier_groups.map((x: any) => x.id);

    try {
      await dispatch(
        updateItem(resModel, {
          // Use resModel instead of model
          onSuccess: async () => {
            back();
            setModel(initialModel);
            dispatch(toggleLoader(false));
            dispatch(getCategories(store_id));
            loadItem();
          },
        }),
      );
    } catch (error) {
      dispatch(toggleLoader(false));
      console.error("Error saving item:", error);
      // Don't clear or modify the model state on error
    }
  };

  const handleModifierGroupsUpdate = (updatedGroups: any) => {
    setModel((prev) => ({
      ...prev,
      modifier_groups: updatedGroups,
    }));
  };

  const handleDelete = () => {
    dispatch(removeItem(parseInt(id)));
  };

  const back = () => {
    navigate(-1);
  };

  const loadItem = async () => {
    if (!id) return;
    dispatch(toggleLoader(true));
    const res = await requestGetItem(parseInt(id));
    // dispatch(setItem(res.data));
    setModel(res.data);

    if (parseInt(res.data.vat_percent) > 0) {
      set_vat_enabled(true);
    }

    dispatch(toggleLoader(false));
  };

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

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
        <span>Edit Item</span>
      </div>

      <div className="form-container">
        <div
          className=""
          style={{
            width: "100%",
            overflowX: "hidden",
          }}
        >
          {renderAccordion(
            "General",
            <>
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
                      <FloatingLabel
                        controlId="min"
                        label="Min"
                        className="mb-3"
                      >
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
                      <FloatingLabel
                        controlId="max"
                        label="Max"
                        className="mb-3"
                      >
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
                            handleChange(
                              "vat_percent",
                              parseFloat(e.target.value),
                            )
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
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                    />
                  </FloatingLabel>
                </Col>

                <Col md="3">
                  <FloatingLabel
                    controlId="stock"
                    label="Stock"
                    className="mb-3"
                  >
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
                      size="sm"
                      type="number"
                      value={model.default_quantity}
                      onChange={(e) =>
                        handleChange(
                          "default_quantity",
                          parseFloat(e.target.value),
                        )
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
                    label={`Default Discount ${model.default_discount_type ?? "amount"}`}
                    className="mb-3"
                  >
                    <Form.Control
                      size="sm"
                      type="number"
                      value={model.default_discount ?? 0}
                      onChange={(e) =>
                        handleChange(
                          "default_discount",
                          parseFloat(e.target.value),
                        )
                      }
                      placeholder={`Default Discount ${model.default_discount_type ?? "amount"}`}
                    />
                  </FloatingLabel>
                </Col>
              </Row>
            </>,
          )}
        </div>

        <Accordion defaultActiveKey="modifiers">
          <Accordion.Item eventKey="modifiers">
            <Accordion.Header>Modifer Groups</Accordion.Header>
            <Accordion.Body>
              <ModifierGroupGrid
                itemId={parseInt(id)}
                data={(model as any).modifier_groups || []}
                onModifierGroupChange={handleModifierGroupsUpdate}
              />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

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

              <ScheduleForm<UpdateItemRequest>
                model={model}
                setModel={setModel}
              />
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

        {renderAccordion(
          "Offers",

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
        <Button
          variant="outline-danger"
          className="ms-auto"
          onClick={handleDelete}
        >
          DELETE
        </Button>
        <Button variant="primary" onClick={handleSave}>
          SAVE
        </Button>
      </div>
    </div>
  );
};

export default EditItem;

import FeatherIcon from "feather-icons-react";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import {
  CreateModifierRequest,
  Modifier,
  UpdateModifierRequest,
} from "Models/modifier";
import { ModifierGroup } from "Models/modifierGroup";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Button, Col, FloatingLabel, Form, Modal, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  getCategories,
  removeModifier,
  saveModifier,
  updateModifier,
} from "../../Redux/Ducks/homeSlice";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import {
  requestGetModifier,
  requestGetModifierGroups,
} from "../../Redux/Sagas/Requests/home";
import ScheduleFormModifier from "Components/Scheduler-Modifier/Scheduler";

const initialModel: any = {
  modifier_group_id: 0,
  name: "",
  vat_percent: 0,
  price: 0,
  allow_multiple: false,
  min: 0,
  max: 0,
  is_active: false,
  store_id: 0,
  availability: "available",
  next_modifier_group_id: null,
  contains_alcohol: false,
  contains_tobacco: false,
  schedule: "NONE",
  schedule_config: null,
  available_for_delivery: true,
  available_for_pickup: true,
};

const ModifierGrid = ({
  data,
  modifierGroupId,
  onUpdate,
}: {
  data: Modifier[];
  modifierGroupId: number;
  onUpdate?: (updatedData: Modifier[]) => void;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [items, setItems] = useState<Modifier[]>([]);
  const [addModifierModal, toggleAddModifierModal] = useState<boolean>(false);
  const [modifier, setModifier] = useState<Modifier>(initialModel);
  const [moreModal, toggleMoreModal] = useState<boolean>(false);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const store_id = useAppSelector((x) => x.Home.selected_store) as any;
  const { ModifierGroups } = useAppSelector((x) => x.manage);

  const getModifierGroups = async () => {
    dispatch(toggleLoader(true));
    const res = await requestGetModifierGroups(store_id);
    setModifierGroups(res.data);
    dispatch(toggleLoader(false));
  };

  useEffect(() => {
    if (
      ModifierGroups === null ||
      ModifierGroups === undefined ||
      ModifierGroups.length === 0
    ) {
      getModifierGroups();
    } else if (store_id !== 0) {
      setModifierGroups(ModifierGroups);
    }
  }, [store_id]);

  useEffect(() => {
    setItems(data);
  }, [data]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [movedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, movedItem);
    setItems(newItems);
  };

  const handleChange = (id: any, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleBlur = (item: Modifier) => {
    const model: any = {
      ...item,
      min: Number(item.min),
      max: Number(item.max),
      sort: Number(item.sort),
    };

    // Send updated array back to parent
    onUpdate?.(model);

    dispatch(updateModifier(model));
    dispatch(getCategories(store_id));
    closeModal();
    closeMore();
  };

  const addModifier = () => {
    dispatch(toggleLoader(true));

    const model: any = {
      ...modifier,
      modifier_group_id: modifierGroupId,
    };
    dispatch(
      saveModifier(model, {
        onSuccess: (data) => {
          setItems([...items, data]);
        },
      }),
    );

    dispatch(toggleLoader(false));
    dispatch(getCategories(store_id));
    closeModal();
  };

  const openModal = () => {
    toggleAddModifierModal(true);
  };

  const closeModal = () => {
    toggleAddModifierModal(false);
    setModifier(initialModel);
  };

  const onChange = (field: keyof Modifier, value: any) => {
    let parsedValue = value;
    if (field === "min" || field === "max" || field === "sort") {
      parsedValue = parseFloat(value);
    }
    setModifier((prev: any) => ({ ...prev, [field]: parsedValue }));
  };

  const deleteModifier = (id: number) => {
    dispatch(removeModifier(id));
    setItems(items.filter((x) => x.id != id));
    dispatch(getCategories(store_id));
  };

  const openMore = (id: number) => {
    dispatch(toggleLoader(true));
    setModifier(items.find((x) => x.id == id) as any);

    toggleMoreModal(true);
    dispatch(toggleLoader(false));
  };

  const closeMore = () => {
    toggleMoreModal(false);
    setModifier(initialModel);
  };

  return (
    <>
      {/* More Modifier Modal */}
      <Modal show={moreModal} onHide={closeMore} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>More Modifier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md="12">
              <FloatingLabel
                controlId="modifier_groups"
                label="Next Modifier Group"
                className="mb-3"
              >
                <Form.Select
                  value={modifier.next_modifier_group_id}
                  onChange={(e) =>
                    onChange("next_modifier_group_id", e.target.value)
                  }
                >
                  <option value="">Select Modifier Group</option>
                  {modifierGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </Col>
            <Col md="3">
              <Form.Check
                type="switch"
                label="Available for Delivery"
                checked={modifier.available_for_delivery}
                onChange={(e: any) =>
                  onChange("available_for_delivery", e.target.checked)
                }
              />
            </Col>
            <Col md="3">
              <Form.Check
                type="switch"
                label="Available for Pickup"
                checked={modifier.available_for_pickup}
                onChange={(e: any) =>
                  onChange("available_for_pickup", e.target.checked)
                }
              />
            </Col>
            <ScheduleFormModifier<UpdateModifierRequest>
              model={modifier}
              setModel={setModifier as any}
            />
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeMore}>
            CANCEL
          </Button>
          <Button variant="primary" onClick={() => handleBlur(modifier)}>
            SAVE
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Modifier Modal */}
      <Modal show={addModifierModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Modifier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md="12">
              <FloatingLabel
                controlId="name"
                label="Modifier Name"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  value={modifier.name}
                  onChange={(e) => onChange("name", e.target.value)}
                />
              </FloatingLabel>
            </Col>
            <Col md="12">
              <FloatingLabel controlId="price" label="Price" className="mb-3">
                <Form.Control
                  size="sm"
                  type="number"
                  value={modifier.price}
                  onChange={(e) => onChange("price", e.target.value)}
                />
              </FloatingLabel>
            </Col>
            <Col md="3">
              <FloatingLabel controlId="min" label="Min" className="mb-3">
                <Form.Control
                  size="sm"
                  type="number"
                  value={modifier.min}
                  onChange={(e) => onChange("min", e.target.value)}
                />
              </FloatingLabel>
            </Col>
            <Col md="3">
              <FloatingLabel controlId="max" label="Max" className="mb-3">
                <Form.Control
                  size="sm"
                  type="number"
                  value={modifier.max}
                  onChange={(e) => onChange("max", e.target.value)}
                />
              </FloatingLabel>
            </Col>

            <Col md="3">
              <FloatingLabel
                controlId="vat_percent"
                label="Vat %"
                className="mb-3"
              >
                <Form.Control
                  size="sm"
                  type="number"
                  value={modifier.vat_percent}
                  onChange={(e) => onChange("vat_percent", e.target.value)}
                />
              </FloatingLabel>
            </Col>

            <Col md={4}>
              <FloatingLabel
                controlId="availability"
                label="Modifier Availability"
                className="mb-3"
              >
                <Form.Select
                  value={modifier.availability}
                  onChange={(e) => onChange("availability", e.target.value)}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="soldout">Sold Out</option>
                </Form.Select>
              </FloatingLabel>
            </Col>

            <ScheduleFormModifier<CreateModifierRequest>
              model={modifier}
              setModel={setModifier as any}
            />
            <Col md={3}>
              <div className="d-flex align-items-center h-100">
                <Form.Check
                  type="switch"
                  label="Allow Multiple"
                  checked={modifier.allow_multiple}
                  onChange={(e: any) =>
                    onChange("allow_multiple", e.target.checked)
                  }
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-center h-100">
                <Form.Check
                  type="switch"
                  label="Contains Alchohol"
                  checked={modifier.contains_alcohol}
                  onChange={(e: any) =>
                    onChange("contains_alcohol", e.target.checked)
                  }
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-center h-100">
                <Form.Check
                  type="switch"
                  label="Contains Tobacco"
                  checked={modifier.contains_tobacco}
                  onChange={(e: any) =>
                    onChange("contains_tobacco", e.target.checked)
                  }
                />
              </div>
            </Col>
            <Col md="3">
              <Form.Check
                type="switch"
                label="Available for Delivery"
                checked={modifier.available_for_delivery}
                onChange={(e: any) =>
                  onChange("available_for_delivery", e.target.checked)
                }
              />
            </Col>
            <Col md="3">
              <Form.Check
                type="switch"
                label="Available for Pickup"
                checked={modifier.available_for_pickup}
                onChange={(e: any) =>
                  onChange("available_for_pickup", e.target.checked)
                }
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeModal}>
            CANCEL
          </Button>
          <Button variant="primary" onClick={addModifier}>
            CREATE
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Listing */}
      <div className="container-fluid p-0">
        <Row className="data-grid-header">
          <Col xs={2}>Name</Col>
          <Col xs={1}>VAT%</Col>
          <Col xs={1}>Sort</Col>
          <Col xs={1}>Price</Col>
          <Col xs={1}>Allow Multiple</Col>
          <Col xs={1}>Min</Col>
          <Col xs={1}>Max</Col>
          <Col xs={2}>Status</Col>
          <Col xs={2} className="text-center">
            Actions
          </Col>
        </Row>

        <div>
          {items.map((item, index) => (
            <Row className="data-grid-row">
              <Col xs={2}>
                <FloatingLabel
                  controlId={`name-${item.id}`}
                  label="Name"
                  className="mb-2"
                >
                  <Form.Control
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleChange(item.id, "name", e.target.value)
                    }
                    onBlur={() => handleBlur(item)}
                  />
                </FloatingLabel>
              </Col>

              {/* VAT% */}
              <Col xs={1} className="text-center">
                <FloatingLabel
                  controlId={`min-${item.id}`}
                  label="Vat"
                  className="mb-2"
                >
                  <Form.Control
                    type="number"
                    value={item.vat_percent}
                    onChange={(e) =>
                      handleChange(
                        item.vat_percent,
                        "vat_percent",
                        e.target.value,
                      )
                    }
                    onBlur={() => handleBlur(item)}
                  />
                </FloatingLabel>
              </Col>

              <Col xs={1}>
                <FloatingLabel
                  controlId={`sort-${item.id}`}
                  label="Sort"
                  className="mb-2"
                >
                  <Form.Control
                    type="text"
                    value={item.sort}
                    onChange={(e) =>
                      handleChange(item.id, "sort", e.target.value)
                    }
                    onBlur={() => handleBlur(item)}
                  />
                </FloatingLabel>
              </Col>

              {/* Price */}
              <Col xs={1}>
                <FloatingLabel
                  controlId={`price-${item.id}`}
                  label="Price"
                  className="mb-2"
                >
                  <Form.Control
                    type="text"
                    value={item.price}
                    onChange={(e) =>
                      handleChange(item.id, "price", e.target.value)
                    }
                    onBlur={() => handleBlur(item)}
                  />
                </FloatingLabel>
              </Col>

              {/* Allow Multiple */}
              <Col xs={1} className="text-center">
                <Form.Check
                  type="checkbox"
                  checked={Boolean(item.allow_multiple)}
                  onChange={(e) =>
                    handleChange(item.id, "allow_multiple", e.target.checked)
                  }
                  onBlur={() => handleBlur(item)}
                />
              </Col>

              {/* Min */}
              <Col xs={1}>
                <FloatingLabel
                  controlId={`min-${item.id}`}
                  label="Min"
                  className="mb-2"
                >
                  <Form.Control
                    type="number"
                    value={item.min}
                    onChange={(e) =>
                      handleChange(item.id, "min", e.target.value)
                    }
                    onBlur={() => handleBlur(item)}
                  />
                </FloatingLabel>
              </Col>

              {/* Max */}
              <Col xs={1}>
                <FloatingLabel
                  controlId={`max-${item.id}`}
                  label="Max"
                  className="mb-2"
                >
                  <Form.Control
                    type="number"
                    value={item.max}
                    onChange={(e) =>
                      handleChange(item.id, "max", e.target.value)
                    }
                    onBlur={() => handleBlur(item)}
                  />
                </FloatingLabel>
              </Col>

              {/* Status */}
              <Col xs={2}>
                <FloatingLabel
                  controlId={`status-${item.id}`}
                  label="Status"
                  className="mb-2"
                >
                  <Form.Select
                    value={item.availability}
                    onChange={(e) =>
                      handleChange(item.id, "availability", e.target.value)
                    }
                    onBlur={() => handleBlur(item)}
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>

              <Col xs={2}>
                <div className="d-flex gap-1 align-items-center justify-content-center">
                  <Button
                    variant="light"
                    onClick={() => deleteModifier(item.id)}
                  >
                    Delete
                  </Button>
                  <Button variant="light" onClick={() => openMore(item.id)}>
                    More
                  </Button>
                </div>
              </Col>
            </Row>
          ))}
        </div>

        {modifierGroupId != 0 && (
          <Row className="data-grid-row">
            <Col xs="12">
              <a
                role="button"
                className="nav-link"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal();
                }}
              >
                <FeatherIcon icon="plus" size={16} className="me-2" />
                Add Modifier
              </a>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
};

export default ModifierGrid;

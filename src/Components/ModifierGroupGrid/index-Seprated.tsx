import DragIcon from "Components/DragIcon";
import FeatherIcon from "feather-icons-react";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import {
  CreateModifierGroupRequest,
  ModifierGroup,
} from "Models/modifierGroup";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Button, Col, FloatingLabel, Form, Modal, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  getCategories,
  removeModifierGroup,
  saveModifierGroup,
  unlinkModifierGroup,
  updateModifierGroup,
  updateModifierGroupSort,
} from "../../Redux/Ducks/homeSlice";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import {
  requestGetModifierGroup,
  requestGetModifierGroups,
} from "../../Redux/Sagas/Requests/home";

const initialModel: CreateModifierGroupRequest = {
  name: "",
  description: "",
  min: 0,
  max: 0,
  is_required: false,
  is_multi_selection: false,
  half_and_half: false,
  allow_custom_selection: false,
  store_id: 0,
  items: [],
  schedule: "NONE",
  schedule_config: null,
  available_for_delivery: true,
  available_for_pickup: true,
};

const ModifierGroupGridSeprated = ({
  data,
  itemId,
}: {
  data: ModifierGroup[];
  itemId: number;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [items, setItems] = useState<ModifierGroup[]>([]);
  const [addModifierGroupModal, toggleModifierGroupModal] =
    useState<boolean>(false);
  const [modifierGroup, setModifierGroup] =
    useState<CreateModifierGroupRequest>(initialModel);
  const [copyModifierGroup, setCopyModifierGroup] = useState<number>(0);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const store_id = useAppSelector((x) => x.Home.selected_store) as any;

  // const getModifierGroups = async () => {
  //   dispatch(toggleLoader(true));
  //   const res = await requestGetModifierGroups(store_id);
  //   setModifierGroups(res.data);
  //   dispatch(toggleLoader(false));
  // };

  // useEffect(() => {
  //   if (!(modifierGroups.length >= 1)) {
  //     getModifierGroups();
  //   }
  // });

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
    const parsedValue =
      field.endsWith("sort") || field === "min" || field === "max"
        ? Number(value)
        : value;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (field.startsWith("pivot.")) {
          // Ensure pivot exists
          const pivot = item.pivot ?? {
            item_id: id,
            modifier_group_id: item.id,
            sort: 0,
          };

          return {
            ...item,
            pivot: {
              ...pivot,
              [field.split(".")[1]]: parsedValue,
            },
          };
        }

        return {
          ...item,
          [field]: parsedValue,
        };
      }),
    );
  };

  const addModifierGroup = () => {
    dispatch(toggleLoader(true));

    const model = {
      ...modifierGroup,
      items: [itemId],
    };
    dispatch(
      saveModifierGroup(model, {
        onSuccess: (data) => {
          setItems([...items, data]);
        },
      }),
    );

    dispatch(toggleLoader(false));
    dispatch(getCategories(store_id));

    closeModal();
  };

  const linkModifierGroup = async () => {
    dispatch(toggleLoader(true));

    const res = await requestGetModifierGroup(copyModifierGroup);
    const model = {
      ...res.data,
      items: [...res.data.items.map((x: any) => x.id), itemId],
    };
    dispatch(
      updateModifierGroup(model, {
        onSuccess: (data) => {
          setItems([...items, data]);
        },
      }),
    );

    dispatch(toggleLoader(false));
    dispatch(getCategories(store_id));
    closeModal();
  };

  const handleBlur = async (item: ModifierGroup, type: string) => {
    dispatch(toggleLoader(true));

    if (type === "qty") {
      const res = await requestGetModifierGroup(item.id);

      // Clean item IDs
      const cleanedItemIds = res.data.items
        ?.map((x: any) => (typeof x === "object" ? x.id : x))
        .filter((id: any) => typeof id === "number" && !isNaN(id));

      const allItems =
        itemId !== 0
          ? Array.from(new Set([...cleanedItemIds, itemId]))
          : cleanedItemIds;

      // Clone the item and remove outer sort
      const { sort, ...itemWithoutSort } = item;

      const model = {
        ...res.data,
        ...itemWithoutSort,
        items: allItems,
      };

      dispatch(
        updateModifierGroup(model, {
          onSuccess: () => {},
        }),
      );
    } else if (type === "sort") {
      const model = {
        item_id: item.pivot?.item_id,
        modifier_group_id: item.pivot?.modifier_group_id,
        sort: item.pivot.sort,
        id: item.pivot.id,
      };

      dispatch(
        updateModifierGroupSort(model, {
          onSuccess: () => {},
        }),
      );
    } else if (type === "allow_custom_selection") {
      dispatch(toggleLoader(true));

      const res = await requestGetModifierGroup(item.id);

      // Clean item IDs
      const cleanedItemIds = res.data.items
        ?.map((x: any) => (typeof x === "object" ? x.id : x))
        .filter((id: any) => typeof id === "number" && !isNaN(id));

      const allItems =
        itemId !== 0
          ? Array.from(new Set([...cleanedItemIds, itemId]))
          : cleanedItemIds;

      // Clone the item and remove outer sort
      const { sort, ...itemWithoutSort } = item;

      const model = {
        ...res.data,
        ...itemWithoutSort,
        items: allItems,
      };

      dispatch(
        updateModifierGroup(model, {
          onSuccess: () => {},
        }),
      );
    }
    dispatch(getCategories(store_id));
    dispatch(toggleLoader(false));
  };

  const editModifierGroup = (id: number) => {
    navigate(`/edit-modifier-group/${id}`);
  };

  const openModal = () => {
    toggleModifierGroupModal(true);
  };

  const closeModal = () => {
    toggleModifierGroupModal(false);
    setCopyModifierGroup(0);
    setModifierGroup(initialModel);
  };

  const onChange = (field: keyof ModifierGroup, value: any) => {
    setModifierGroup((prev: any) => ({ ...prev, [field]: value }));
  };

  const deleteModifierGroup = (id: number) => {
    dispatch(removeModifierGroup(id));
    setItems(items.filter((x) => x.id != id));
    dispatch(getCategories(store_id));
  };

  const unLinkkModifierGroup = (id: number) => {
    const payload = {
      item_id: itemId,
      modifier_group_id: id,
    };
    dispatch(unlinkModifierGroup(payload));
    setItems(items.filter((x) => x.id != id));
  };

  return (
    <>
      <Modal show={addModifierGroupModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Modifier Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md="6">
              <FloatingLabel
                controlId="groupName"
                label="Group Name"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  value={modifierGroup.name}
                  onChange={(e) => onChange("name", e.target.value)}
                />
              </FloatingLabel>
            </Col>
            <Col md="6">
              <FloatingLabel
                controlId="groupDescription"
                label="Group Description"
                className="mb-3"
              >
                <Form.Control
                  size="sm"
                  type="text"
                  value={modifierGroup.description}
                  onChange={(e) => onChange("description", e.target.value)}
                />
              </FloatingLabel>
            </Col>
            <Col md="3">
              <FloatingLabel controlId="min" label="Min" className="mb-3">
                <Form.Control
                  size="sm"
                  type="number"
                  value={modifierGroup.min}
                  onChange={(e) => onChange("min", e.target.value)}
                />
              </FloatingLabel>
            </Col>
            <Col md="3">
              <FloatingLabel controlId="max" label="Max" className="mb-3">
                <Form.Control
                  size="sm"
                  type="number"
                  value={modifierGroup.max}
                  onChange={(e) => onChange("max", e.target.value)}
                />
              </FloatingLabel>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center h-100">
                <Form.Check
                  type="switch"
                  label="Is Required"
                  checked={modifierGroup.is_required}
                  onChange={(e: any) =>
                    onChange("is_required", e.target.checked)
                  }
                />
              </div>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center h-100">
                <Form.Check
                  type="switch"
                  label="Half and Half"
                  checked={modifierGroup.half_and_half}
                  onChange={(e: any) =>
                    onChange("half_and_half", e.target.checked)
                  }
                />
              </div>
            </Col>
            <Col md="3">
              <Form.Check
                type="switch"
                label="Available for Delivery"
                checked={modifierGroup.available_for_delivery}
                onChange={(e: any) =>
                  onChange("available_for_delivery", e.target.checked)
                }
              />
            </Col>
            <Col md="3">
              <Form.Check
                type="switch"
                label="Available for Pickup"
                checked={modifierGroup.available_for_pickup}
                onChange={(e: any) =>
                  onChange("available_for_pickup", e.target.checked)
                }
              />
            </Col>

            <Col md="12" className="text-center my-3">
              OR
            </Col>
            <Col md="10">
              <FloatingLabel
                controlId="modifier_groups"
                label="Link Modifier Groups"
                className="mb-3"
              >
                <Form.Select
                  value={copyModifierGroup}
                  onChange={(e) =>
                    setCopyModifierGroup(parseInt(e.target.value))
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
            <Col md="2">
              <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                <Button variant="light" onClick={linkModifierGroup}>
                  LINK
                </Button>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeModal}>
            CANCEL
          </Button>
          <Button variant="primary" onClick={addModifierGroup}>
            CREATE
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="container-fluid p-0">
        <Row className="data-grid-header">
          <Col xs={3}>Name</Col>
          {/* <Col xs={2}>Sort</Col> */}
          <Col xs={2}>Min</Col>
          <Col xs={2}>Max</Col>
          <Col xs={2}>Allow Custom Selection</Col>

          <Col xs={2}>Action</Col>
        </Row>

        <div>
          {items.map((item, index) => (
            <Row className="data-grid-row" key={item.id}>
              <Col xs={3}>
                <div className="d-flex align-items-center gap-2">
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {item.name}
                  </span>
                </div>
              </Col>

              {/* <Col xs={2}>
                          <FloatingLabel
                            controlId={`sort-${item.id}`}
                            label="Sort"
                            className="mb-2"
                          >
                            <Form.Control
                              type="text"
                              value={item?.pivot?.sort ?? 0}
                              onChange={(e) =>
                                handleChange(
                                  item.id,
                                  "pivot.sort",
                                  e.target.value
                                )
                              }
                              onBlur={() => handleBlur(item, "sort")}
                            />
                          </FloatingLabel>
                        </Col> */}

              <Col xs={2}>
                <FloatingLabel
                  controlId={`min-${item.id}`}
                  label="Min"
                  className="mb-2"
                >
                  <Form.Control
                    type="text"
                    value={item.min}
                    onChange={(e) =>
                      handleChange(item.id, "min", e.target.value)
                    }
                    onBlur={() => handleBlur(item, "qty")}
                  />
                </FloatingLabel>
              </Col>

              <Col xs={2}>
                <FloatingLabel
                  controlId={`max-${item.id}`}
                  label="Max"
                  className="mb-2"
                >
                  <Form.Control
                    type="text"
                    value={item.max}
                    onChange={(e) =>
                      handleChange(item.id, "max", e.target.value)
                    }
                    onBlur={() => handleBlur(item, "qty")}
                  />
                </FloatingLabel>
              </Col>

              <Col xs={1} className="text-center">
                <Form.Check
                  type="checkbox"
                  checked={Boolean(item.allow_custom_selection)}
                  onChange={(e) =>
                    handleChange(
                      item.id,
                      "allow_custom_selection",
                      e.target.checked,
                    )
                  }
                  onBlur={() => handleBlur(item, "allow_custom_selection")}
                />
              </Col>

              <Col xs={2}>
                <div className="d-flex gap-1 align-items-center justify-content-center">
                  <Button
                    variant="light"
                    onClick={() => editModifierGroup(item.id)}
                  >
                    Edit
                  </Button>
                  {/* <Button
                              variant="light"
                              onClick={() => unLinkkModifierGroup(item.id)}
                            >
                              Unlink
                            </Button> */}
                  <Button
                    variant="light"
                    onClick={() => deleteModifierGroup(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Col>
            </Row>
          ))}
        </div>

        {itemId != 0 && (
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
                Add Modifier Group
              </a>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
};

export default ModifierGroupGridSeprated;

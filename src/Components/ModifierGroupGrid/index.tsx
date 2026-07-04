import DragIcon from "Components/DragIcon";
import FeatherIcon from "feather-icons-react";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import {
  CreateModifierGroupRequest,
  ModifierGroup,
  UpdateModifierGroupRequest,
} from "Models/modifierGroup";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Button, Col, FloatingLabel, Form, Modal, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  getCategories,
  LinkModifierGroup,
  removeModifierGroup,
  saveModifierGroup,
  unlinkModifierGroup,
  updateModifierGroup,
  updateModifierGroupSort,
} from "../../Redux/Ducks/homeSlice";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import {
  requestGetItem,
  requestGetModifierGroup,
  requestGetModifierGroups,
} from "../../Redux/Sagas/Requests/home";
import { setModifierGroupsData } from "../../Redux/Ducks/manageSlice";
import ScheduleFormModifierGroup from "Components/Scheduler-ModifierGroup/Scheduler";

const initialModel: CreateModifierGroupRequest = {
  name: "",
  description: "",
  min: 0,
  max: 0,
  is_required: false,
  is_multi_selection: false,
  half_and_half: false,
  store_id: 0,
  allow_custom_selection: false,
  items: [],
  schedule: "NONE",
  schedule_config: null,
  available_for_delivery: true,
  available_for_pickup: true,
};

const ModifierGroupGrid = ({
  data,
  itemId,
  onModifierGroupChange,
}: {
  data: ModifierGroup[];
  itemId: number;
  onModifierGroupChange: (updated: ModifierGroup[]) => void;
}) => {
  console.log("data from edit-item", data);
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
  // }, []);

  useEffect(() => {
    const getModifierGroups = async () => {
      if (modifierGroups.length > 0 || !store_id || store_id <= 0) return;
      dispatch(toggleLoader(true));
      try {
        const res = await requestGetModifierGroups(store_id);
        setModifierGroups(res.data || []);
        dispatch(setModifierGroupsData(res.data || []));
      } catch (err) {
        console.error("Failed to fetch modifier groups", err);
      } finally {
        dispatch(toggleLoader(false));
      }
    };

    getModifierGroups();
  }, [store_id, modifierGroups.length]);

  useEffect(() => {
    setItems(data);
    onModifierGroupChange?.(data);
  }, [data]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [movedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, movedItem);
    setItems(newItems);
  };
  const handleChange = (
    mgId: number,
    field: string,
    value: any,
    pivotId?: number,
  ) => {
    const parsedValue =
      field.endsWith("sort") || field === "min" || field === "max"
        ? Number(value)
        : value;

    setItems((prev) =>
      prev.map((mg) => {
        if (mg.id === mgId) {
          // If pivotId exists and doesn't match, skip update
          if (pivotId && mg.pivot?.id !== pivotId) return mg;

          // If the field is a pivot field (e.g., "pivot.sort")
          if (field.startsWith("pivot.")) {
            const pivot = mg.pivot ?? {
              item_id: 0,
              modifier_group_id: mgId,
              sort: 0,
              id: pivotId,
            };

            return {
              ...mg,
              pivot: {
                ...pivot,
                [field.split(".")[1]]: parsedValue,
              },
            };
          }

          // Else it's a top-level field like "min", "max", "is_required"
          return {
            ...mg,
            [field]: parsedValue,
          };
        }

        return mg;
      }),
    );
  };

  const addModifierGroup = async () => {
    dispatch(toggleLoader(true));

    const model = {
      ...modifierGroup,
      items: [itemId],
    };

    await dispatch(
      saveModifierGroup(model, {
        onSuccess: async () => {
          const updatedList = await requestGetItem(itemId);
          setItems(updatedList?.data?.modifier_groups || []);
          onModifierGroupChange?.(updatedList?.data?.modifier_groups || []);
          setItems(updatedList?.data?.modifier_groups || []);
        },
      }),
    );

    closeModal();

    dispatch(toggleLoader(false));
  };

  // const linkModifierGroup = async () => {
  //   dispatch(toggleLoader(true));

  //   const res = await requestGetModifierGroup(copyModifierGroup);
  //   const model = {
  //     ...res.data,
  //     items: [...res.data.items.map((x: any) => x.id), itemId],
  //   };

  //   dispatch(
  //     updateModifierGroup(model, {
  //       onSuccess: async () => {
  //         const updatedList = await requestGetItem(itemId);
  //         setItems(updatedList?.data?.modifier_groups || []);
  //         onModifierGroupChange?.(updatedList?.data?.modifier_groups || []);

  //         dispatch(toggleLoader(false));
  //       },
  //     })
  //   );

  //   closeModal();
  //   dispatch(toggleLoader(false));
  // };

  const handleBlur = async (item: ModifierGroup, type: string) => {
    dispatch(toggleLoader(true));

    if (type === "qty") {
      dispatch(toggleLoader(true));

      // Step 1: Get updated group details
      const res = await requestGetModifierGroup(item.id);

      // Clean item IDs
      const cleanedItemIds = res.data.items
        ?.map((x: any) => (typeof x === "object" ? x.id : x))
        .filter((id: any) => typeof id === "number" && !isNaN(id));

      const allItems =
        itemId !== 0
          ? Array.from(new Set([...cleanedItemIds, itemId]))
          : cleanedItemIds;

      // Remove outer `sort` from item (in case it's leaking into payload)
      const { sort, ...itemWithoutSort } = item;

      // Prepare payload for updating
      const model = {
        ...res.data,
        ...itemWithoutSort,
        items: allItems,
      };

      // Step 2: Update group

      await dispatch(
        updateModifierGroup(model, {
          onSuccess: async () => {
            const updatedList = await requestGetItem(itemId);
            const newGroups: ModifierGroup[] =
              updatedList?.data?.modifier_groups || [];
            const updatedGroupId = item.id;

            setItems((prevItems) => {
              const finalGroups = prevItems.map((g) =>
                g.id === updatedGroupId
                  ? newGroups.find((x) => x.id === updatedGroupId) || g
                  : g,
              );
              onModifierGroupChange?.(finalGroups);
              return finalGroups;
            });

            dispatch(toggleLoader(false));
          },
        }),
      );
    } else if (type === "sort") {
      const model = {
        item_id: item.pivot?.item_id ?? 0,
        modifier_group_id: item.pivot?.modifier_group_id ?? 0,
        sort: item?.pivot?.sort ?? 0,
        id: item?.pivot?.id ?? 0,
      };

      dispatch(
        updateModifierGroupSort(model, {
          onSuccess: () => {
            dispatch(toggleLoader(false));
          },
        }),
      );
    } else if (type === "allow_custom_selection") {
      dispatch(toggleLoader(true));

      // Step 1: Get updated group details
      const res = await requestGetModifierGroup(item.id);

      // Clean item IDs
      const cleanedItemIds = res.data.items
        ?.map((x: any) => (typeof x === "object" ? x.id : x))
        .filter((id: any) => typeof id === "number" && !isNaN(id));

      const allItems =
        itemId !== 0
          ? Array.from(new Set([...cleanedItemIds, itemId]))
          : cleanedItemIds;

      // Remove outer `sort` from item (in case it's leaking into payload)
      const { sort, ...itemWithoutSort } = item;

      // Prepare payload for updating
      const model = {
        ...res.data,
        ...itemWithoutSort,
        items: allItems,
      };

      // Step 2: Update group

      await dispatch(
        updateModifierGroup(model, {
          onSuccess: async () => {
            const updatedList = await requestGetItem(itemId);
            const newGroups: ModifierGroup[] =
              updatedList?.data?.modifier_groups || [];
            const updatedGroupId = item.id;

            setItems((prevItems) => {
              const finalGroups = prevItems.map((g) =>
                g.id === updatedGroupId
                  ? newGroups.find((x) => x.id === updatedGroupId) || g
                  : g,
              );
              onModifierGroupChange?.(finalGroups);
              return finalGroups;
            });

            dispatch(toggleLoader(false));
          },
        }),
      );
    }
    dispatch(getCategories(store_id));
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
    const newList = items.filter((x) => x.id != id);
    setItems(newList);
    onModifierGroupChange?.(newList);
  };

  const linkModifierGroup = async (id: number, groupId: any) => {
    dispatch(toggleLoader(true));

    const payload = {
      item_id: itemId,
      modifier_group_id: groupId,
    };
    await dispatch(
      LinkModifierGroup(payload, {
        onSuccess: async () => {
          const updatedList = await requestGetItem(itemId);
          const newGroups = updatedList?.data?.modifier_groups || [];
          setItems(newGroups);
          onModifierGroupChange?.(newGroups);

          dispatch(getCategories(store_id));

          dispatch(toggleLoader(false));
        },
      }),
    );

    closeModal();
  };

  const unLinkModifierGroup = async (
    id: number,
    groupId: number,
    pivotId: number,
  ) => {
    dispatch(toggleLoader(true));

    const payload = {
      item_id: itemId,
      modifier_group_id: groupId,
      id: pivotId,
    };
    dispatch(
      unlinkModifierGroup(payload, {
        onSuccess: async () => {
          const updatedList = await requestGetItem(itemId);
          const newGroups = updatedList?.data?.modifier_groups || [];
          setItems(newGroups);
          onModifierGroupChange?.(newGroups);
          dispatch(getCategories(store_id));

          dispatch(toggleLoader(false));
        },
      }),
    );
  };

  return (
    <>
      {/* Add Modal */}
      <Modal
        show={addModifierGroupModal}
        onHide={closeModal}
        centered
        size="lg"
      >
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
                  label="Allow Custom Selection"
                  checked={modifierGroup.allow_custom_selection}
                  onChange={(e: any) =>
                    onChange("allow_custom_selection", e.target.checked)
                  }
                />
              </div>
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
            <ScheduleFormModifierGroup<CreateModifierGroupRequest>
              model={modifierGroup}
              setModel={setModifierGroup}
            />
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
                  {modifierGroups.length === 0 ? (
                    <option value="" disabled>
                      Loading modifier groups...
                    </option>
                  ) : (
                    modifierGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))
                  )}
                </Form.Select>
              </FloatingLabel>
            </Col>

            <Col md="2">
              <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                <Button
                  variant="light"
                  onClick={() => {
                    linkModifierGroup(itemId, copyModifierGroup);
                  }}
                >
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

      {/* Listing */}
      <div className="container-fluid p-0">
        <div className="data-grid-wrapper ">
          <Row className="data-grid-header flex-nowrap">
            <Col xs={3}>Name</Col>
            <Col xs={2}>Sort</Col>
            <Col xs={2}>Min</Col>
            <Col xs={2}>Max</Col>
            <Col xs={2}>Allow Custom Selection</Col>
            <Col xs={2}>Action</Col>
          </Row>

          <div>
            {items.map((item, index) => {
              const pivotId = item.pivot?.id ?? 0;
              return (
                <Row className="data-grid-row flex-nowrap">
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
                  <Col xs={2} key={`mg-${item.id}-pivot-${pivotId}`}>
                    <FloatingLabel
                      controlId={`sort-${item.id}-${pivotId}`}
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
                            e.target.value,
                            pivotId,
                          )
                        }
                        onBlur={() => handleBlur(item, "sort")}
                      />
                    </FloatingLabel>
                  </Col>

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
                      <Button
                        variant="light"
                        onClick={() =>
                          unLinkModifierGroup(
                            item.id ?? 0,
                            item.pivot.modifier_group_id ?? 0,
                            item.pivot.id ?? 0,
                          )
                        }
                      >
                        Unlink
                      </Button>
                      {/* <Button
                              variant="light"
                              onClick={() => deleteModifierGroup(item.id)}
                            >
                              Delete
                            </Button> */}
                    </div>
                  </Col>
                </Row>
              );
            })}
          </div>

          {itemId != 0 && (
            <Row className="data-grid-row flex-nowrap">
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
      </div>
    </>
  );
};

export default ModifierGroupGrid;

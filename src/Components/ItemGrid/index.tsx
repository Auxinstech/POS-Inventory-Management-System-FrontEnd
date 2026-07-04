import { getUserPhoto } from "Base/Methods";
import DragIcon from "Components/DragIcon";
import FeatherIcon from "feather-icons-react";
import { useAppDispatch } from "Hook/hooks";
import { Item } from "Models/item";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Button, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { removeItem, updateItem } from "../../Redux/Ducks/homeSlice";

const ItemGrid = ({ data, subCatId }: { data: Item[]; subCatId: number }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);

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
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    navigate(`/add-item/${subCatId}`);
  };

  const handleBlur = (item: Item) => {
    const model = {
      ...item,
      allergens: item.allergens.map((x) => x.id),
      modifier_groups: item.modifier_groups.map((x) => x.id),
      categories:
        subCatId != 0
          ? [parseInt(subCatId as any)]
          : item.categories.map((x) => x.id),
    };
    dispatch(updateItem(model));
  };

  const editItem = (id: number) => {
    navigate(`/edit-item/${id}`);
  };

  const deleteItem = (id: number) => {
    dispatch(removeItem(id));
  };

  return (
    <div className="container-fluid p-0">
      <div>
        {items.map((item, index) => (
          <Row className="data-grid-row">
            {subCatId != 0 ? (
              <>
                {/* <Col xs={1} className='text-center'
                                                            {...provided.dragHandleProps}  // <--- Drag Handle here
                                                        >
                                                            <DragIcon />
                                                        </Col> */}
                <Col xs={4}>
                  <div className="d-flex align-items-center gap-2">
                    <img src={item.image} alt="" className="data-grid-img" />
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
              </>
            ) : (
              <Col xs={5}>
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={getUserPhoto(item.image)}
                    alt=""
                    className="data-grid-img"
                  />
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
            )}

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

            <Col xs={2}>
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

            <Col xs={3}>
              <FloatingLabel
                controlId={`status-${item.id}`}
                label="Availability"
                className="mb-2"
              >
                <Form.Select
                  value={item.item_availability}
                  onChange={(e) =>
                    handleChange(item.id, "item_availability", e.target.value)
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
                <Button variant="light" onClick={() => editItem(item.id)}>
                  Edit
                </Button>
                <Button variant="light" onClick={() => deleteItem(item.id)}>
                  Delete
                </Button>
              </div>
            </Col>
          </Row>
        ))}
      </div>

      {subCatId != 0 && (
        <Row className="data-grid-row">
          <Col xs="12">
            <a
              role="button"
              className="nav-link"
              onClick={(e) => {
                e.stopPropagation();
                addItem();
              }}
            >
              <FeatherIcon icon="plus" size={16} className="me-2" />
              Add Item
            </a>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ItemGrid;

import ModifierGrid from "Components/ModifierGrid";
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
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import {
  CreateModifierGroupRequest,
  ModifierGroup,
  UpdateModifierGroupRequest,
} from "Models/modifierGroup";
import { requestGetModifierGroup } from "../../Redux/Sagas/Requests/home";
import {
  getCategories,
  removeModifierGroup,
  updateModifierGroup,
} from "../../Redux/Ducks/homeSlice";
import { useAppSelector } from "Hook/hooks";
import ScheduleFormModifierGroup from "Components/Scheduler-ModifierGroup/Scheduler";

const initialModel: ModifierGroup = {
  id: 0,
  name: "",
  description: "",
  sort: 0,
  min: 0,
  max: 0,
  is_required: false,
  is_multi_selection: false,
  allow_custom_selection: false,
  half_and_half: false,
  store_id: 0,
  created_at: "",
  deleted_at: "",
  updated_at: "",
  modifiers: [],
  pivot: {
    item_id: 0,
    modifier_group_id: 0,
    sort: 0,
    id: 0,
  },
  schedule: "NONE",
  schedule_config: null,
  available_for_delivery: true,
  available_for_pickup: true,
};

const EditModifierGroup: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id }: any = useParams();
  const [model, setModel] = useState<ModifierGroup>(initialModel);
  const [tempData, setTempData] = useState<ModifierGroup>(initialModel);
  const store_id = useAppSelector((x) => x.Home.selected_store) as any;

  const handleChange = (
    field: keyof CreateModifierGroupRequest,
    value: any,
  ) => {
    setModel((prev) => ({ ...prev, [field]: value }));
  };
  const handleSave = async () => {
    const res = await requestGetModifierGroup(parseInt(id));

    // Normalize both arrays
    const resModifiers = Array.isArray(res.data.modifiers)
      ? res.data.modifiers
      : res.data.modifiers
        ? [res.data.modifiers]
        : [];

    const updatedModifiers = Array.isArray(tempData?.modifiers)
      ? tempData.modifiers
      : tempData?.modifiers
        ? [tempData.modifiers]
        : [];

    // Merge: replace existing modifiers with updated ones if IDs match
    const mergedModifiers = resModifiers.map((mod: any) => {
      const updated = updatedModifiers.find((u: any) => u.id === mod.id);
      return updated || mod;
    });

    const resModel = {
      ...res.data,
      ...model,
      items: [...res.data.items.map((x: any) => x.id)],
      modifiers: mergedModifiers,
    };

    dispatch(
      updateModifierGroup(resModel, {
        onSuccess: () => {
          back();
          setModel(initialModel);
          setTempData(initialModel);
          dispatch(getCategories(store_id));
        },
      }),
    );
  };

  const handleDelete = () => {
    dispatch(removeModifierGroup(id));
    dispatch(getCategories(store_id));

    navigate(-1);
  };

  const back = () => {
    navigate(-1);
  };

  const loadModifierGroup = async () => {
    if (!id) return;
    dispatch(toggleLoader(true));

    const res = await requestGetModifierGroup(parseInt(id));
    setModel(res.data);

    dispatch(toggleLoader(false));
  };

  useEffect(() => {
    if (id) {
      loadModifierGroup();
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
        <span>Edit Modifier Group</span>
      </div>

      <div className="form-container">
        <Accordion defaultActiveKey="modifierGroup">
          <Accordion.Item eventKey="modifierGroup">
            <Accordion.Header>Modifier Group</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <FloatingLabel
                    controlId="name"
                    label="Modifier Group Name"
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
                <Col md={6}>
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
                <Col md={2}>
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
                <Col md={2}>
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
                <Col md={2}>
                  <div className="d-flex align-items-center h-100">
                    <Form.Check
                      type="switch"
                      label="Is Required"
                      checked={model.is_required}
                      onChange={(e: any) =>
                        handleChange("is_required", e.target.checked)
                      }
                    />
                  </div>
                </Col>
                <Col md={2}>
                  <div className="d-flex align-items-center h-100">
                    <Form.Check
                      type="switch"
                      label="Half and Half"
                      checked={model.half_and_half}
                      onChange={(e: any) =>
                        handleChange("half_and_half", e.target.checked)
                      }
                    />
                  </div>
                </Col>
                <Col md={2}>
                  <div className="d-flex align-items-center h-100">
                    <Form.Check
                      type="switch"
                      label="Multi Selection"
                      checked={model.is_multi_selection}
                      onChange={(e: any) =>
                        handleChange("is_multi_selection", e.target.checked)
                      }
                    />
                  </div>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <Accordion defaultActiveKey="modifiers">
          <Accordion.Item eventKey="modifiers">
            <Accordion.Header>Modifiers</Accordion.Header>
            <Accordion.Body>
              <ModifierGrid
                data={
                  Array.isArray(model.modifiers)
                    ? model.modifiers
                    : [model.modifiers]
                } // ✅ Normalize data passed to grid
                modifierGroupId={model.id}
                onUpdate={(updatedModifiers) => {
                  setTempData({
                    ...tempData,
                    modifiers: Array.isArray(updatedModifiers)
                      ? updatedModifiers
                      : [updatedModifiers], // ✅ Ensure modifiers is always an array
                  });
                  console.log("Updated Data:", updatedModifiers);
                }}
              />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {renderAccordion(
          "Availability",
          <Row>
            <ScheduleFormModifierGroup<UpdateModifierGroupRequest>
              model={model}
              setModel={setModel as any}
            />
            ,
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
          </Row>,
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

export default EditModifierGroup;

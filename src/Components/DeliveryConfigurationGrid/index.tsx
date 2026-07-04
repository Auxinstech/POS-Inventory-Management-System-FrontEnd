import FeatherIcon from "feather-icons-react";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { DeliveryConfiguration } from "Models/deliveryConfiguration";
import { useState } from "react";
import { Button, Col, FloatingLabel, Form, Modal, Row } from "react-bootstrap";
import {
  saveDeliveryConfiguration,
  deleteDeliveryConfiguration,
  updateDeliveryConfiguration,
} from "../../Redux/Ducks/settingSlice";

const initialModel: DeliveryConfiguration = {
  store_id: 0,
  code: "",
  status: "include",
  min_order: 0.0,
  charges: 0.0,
  driver_fee: 0.0,
  free_delivery_amount: 0.0,
  distance_limit: true,
  id: 0,
};

const DeliveryConfigurationGrid = () => {
  const dispatch = useAppDispatch();

  const deliveryConfigurations = useAppSelector(
    (state) => state.Setting.delivery_configuration
  );
  const selected_store = useAppSelector(
    (state) => state.Home.selected_store
  ) as any;

  const [addDeliveryConfigurationModal, toggleAddDeliveryConfigurationModal] =
    useState<boolean>(false);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [deliveryConfiguration, setDeliveryConfiguration] =
    useState<DeliveryConfiguration>(initialModel);

  const createFunc = () => {
    const model = {
      ...deliveryConfiguration,
      store_id: selected_store as any,
    };
    dispatch(saveDeliveryConfiguration(model));

    closeModal();
  };

  const updateFunc = () => {
    const model = {
      ...deliveryConfiguration,
      store_id: selected_store as any,
    };
    dispatch(updateDeliveryConfiguration(model));

    closeModal();
  };

  const openModal = () => {
    toggleAddDeliveryConfigurationModal(true);
  };

  const closeModal = () => {
    toggleAddDeliveryConfigurationModal(false);
    setDeliveryConfiguration(initialModel);
    setActiveCode(null);
  };

  const onChange = (field: keyof DeliveryConfiguration, value: any) => {
    setDeliveryConfiguration((prev: any) => ({ ...prev, [field]: value }));
  };

  const deleteFunc = (code: string) => {
    dispatch(deleteDeliveryConfiguration(code));
  };

  const editFunc = (code: string) => {
    setActiveCode(code);
    const existingConfig = deliveryConfigurations.find(
      (dc) => dc.id.toString() == code
    );
    if (existingConfig) {
      setDeliveryConfiguration(existingConfig);
    }
    openModal();
  };
  console.log(deliveryConfigurations);
  return (
    <>
      <Modal show={addDeliveryConfigurationModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delivery Configuration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md="6">
              <FloatingLabel controlId="code" label="Code" className="mb-3">
                <Form.Control
                  type="text"
                  value={deliveryConfiguration.code}
                  onChange={(e) => onChange("code", e.target.value)}
                />
              </FloatingLabel>
            </Col>
            <Col md="6">
              <FloatingLabel controlId="status" label="Status" className="mb-3">
                <Form.Select
                  value={deliveryConfiguration.status}
                  onChange={(e) => onChange("status", e.target.value)}
                >
                  <option value="include">Include</option>
                  <option value="exclude">Exclude</option>
                </Form.Select>
              </FloatingLabel>
            </Col>
            {deliveryConfiguration.status === "include" && (
              <>
                <Col md="3">
                  <FloatingLabel
                    controlId="min_order"
                    label="Min order"
                    className="mb-3"
                  >
                    <Form.Control
                      size="sm"
                      type="number"
                      value={deliveryConfiguration.min_order}
                      onChange={(e) => onChange("min_order", e.target.value)}
                    />
                  </FloatingLabel>
                </Col>
                <Col md="3">
                  <FloatingLabel
                    controlId="charges"
                    label="Charges"
                    className="mb-3"
                  >
                    <Form.Control
                      size="sm"
                      type="number"
                      value={deliveryConfiguration.charges}
                      onChange={(e) => onChange("charges", e.target.value)}
                    />
                  </FloatingLabel>
                </Col>
                <Col md="3">
                  <FloatingLabel
                    controlId="driver_fee"
                    label="Driver Free"
                    className="mb-3"
                  >
                    <Form.Control
                      size="sm"
                      type="number"
                      value={deliveryConfiguration.driver_fee}
                      onChange={(e) => onChange("driver_fee", e.target.value)}
                    />
                  </FloatingLabel>
                </Col>
                <Col md="3">
                  <FloatingLabel
                    controlId="free_delivery_amount"
                    label="Free Delivery Amount"
                    className="mb-3"
                  >
                    <Form.Control
                      size="sm"
                      type="number"
                      value={deliveryConfiguration.free_delivery_amount}
                      onChange={(e) =>
                        onChange("free_delivery_amount", e.target.value)
                      }
                    />
                  </FloatingLabel>
                </Col>
                <Col md="6">
                  <Form.Check
                    type="switch"
                    label="Distance Limit"
                    checked={deliveryConfiguration.distance_limit}
                    onChange={(e: any) =>
                      onChange("distance_limit", e.target.checked)
                    }
                  />
                </Col>
              </>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeModal}>
            CANCEL
          </Button>
          {activeCode ? (
            <Button variant="primary" onClick={updateFunc}>
              SAVE
            </Button>
          ) : (
            <Button variant="primary" onClick={createFunc}>
              CREATE
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      <div className="container-fluid p-0">
        <Row className="data-grid-header">
          <Col xs={2}>Code</Col>
          <Col xs={2}>Min Order</Col>
          <Col xs={2}>Charges</Col>
          <Col xs={2}>Driver Fee</Col>
          <Col xs={2}>Free Above</Col>
          <Col xs={2} className="text-center">
            Actions
          </Col>
        </Row>
        {deliveryConfigurations.map((dc: any, index) => (
          <Row className="data-grid-row" key={dc.code}>
            <Col xs={2}>{dc.code}</Col>
            <Col xs={2}>{parseFloat(dc.min_order).toFixed(2)}</Col>
            <Col xs={2}>{parseFloat(dc.charges).toFixed(2)}</Col>
            <Col xs={2}>{parseFloat(dc.driver_fee).toFixed(2)}</Col>
            <Col xs={2}>{parseFloat(dc.free_delivery_amount).toFixed(2)}</Col>
            <Col xs={2}>
              <div className="d-flex gap-1 align-items-center justify-content-center">
                <Button variant="light" onClick={() => editFunc(dc.id)}>
                  Edit
                </Button>
                <Button variant="light" onClick={() => deleteFunc(dc.id)}>
                  Delete
                </Button>
              </div>
            </Col>
          </Row>
        ))}
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
              Add Delivery Configuration
            </a>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default DeliveryConfigurationGrid;

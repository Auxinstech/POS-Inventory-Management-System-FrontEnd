import DeliveryConfigurationGrid from "Components/DeliveryConfigurationGrid";
import React from "react";
import { Accordion, Col, FloatingLabel, Form, Row } from "react-bootstrap";

const DeliveryConfiguration = () => {
  return (
    <div className="setting-form">
      <div className="form-header">
        <span>Delivery Configuration</span>
      </div>
      <div className="form-container">
        <div
          style={{
            width: "100%",
            overflowX: "hidden",
          }}
        >
          <Accordion defaultActiveKey="deliveryConfiguration" className="mt-3">
            <Accordion.Item eventKey="deliveryConfiguration">
              <Accordion.Header>Distance Limit</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={3}>
                    <FloatingLabel
                      controlId="distanceLimit"
                      label="Distance Limit"
                      className="mb-3"
                    >
                      <Form.Control
                        size="sm"
                        type="text"
                        value={""}
                        onChange={(e) => {}}
                      />
                    </FloatingLabel>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        <Accordion defaultActiveKey="deliveryConfiguration" className="mt-3">
          <Accordion.Item eventKey="deliveryConfiguration">
            <Accordion.Header>Delivery Configuration</Accordion.Header>
            <Accordion.Body>
              <DeliveryConfigurationGrid />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
};

export default DeliveryConfiguration;

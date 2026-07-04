import {
  Container,
  Row,
  Col,
  Tab,
  Nav,
  Button,
  Table,
  Form,
  Dropdown,
} from "react-bootstrap";
import React, { useEffect, useMemo, useState } from "react";
import FeatherIcon from "feather-icons-react";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import {
  getOrdersByID,
  Order,
  printOrder,
  setActiveOrderRefund,
  setActiveOrderReports,
  toggleOrderDetail,
  updateOrderStatus,
} from "../../Redux/Ducks/orderSlice";
import { TDeliverTimings } from "Pages/Setting/Store";
import { useLocation } from "react-router-dom";
import { ITimezoneOption } from "react-timezone-select";

import Countdown from "Components/Countdown";

const InvoiceRefundGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const all_orders = useAppSelector((state) => state.Order.orders_by_id);
  const active_order = useAppSelector(
    (state) => state.Order.active_order_refund
  );
  const is_order_detail_open = useAppSelector(
    (state) => state.Order.is_order_detail_open
  );

  const store_id = useAppSelector((state) => state.Home.selected_store);

  // const store_id = useAppSelector((state) => state.Home.selected_store);

  const settings = useAppSelector((state) => state.Setting.settings);
  const [currencySymbol, setCurrencySymbol] = useState<string>("");
  const users = useAppSelector((x) => x.Users.users);
  const [selectedTimezone, setSelectedTimezone] = useState<ITimezoneOption>({
    value: "",
    label: "",
    offset: 0,
    abbrev: "",
    altName: "",
  });

  // Sync color state when settings change
  useEffect(() => {
    const findTZValue = settings.find((x) => x.key === "timezone");
    if (findTZValue?.value) {
      const parsedTZ = JSON.parse(findTZValue.value);
      if (parsedTZ) setSelectedTimezone(parsedTZ);
    }
  }, [settings]);

  // Find currency symbol from the settings object
  useEffect(() => {
    if (settings.find((x) => x.key == "currency-symbol")?.value)
      setCurrencySymbol(
        settings.find((x) => x.key == "currency-symbol")?.value as any
      );
  }, [settings]);

  const defaultDeliveryTimings = {
    delivery_time: "10",
    pickup_time: "10",
    instore_time: "10",
  };

  const [deliveryTimings, setDeliveryTimings] = useState<TDeliverTimings>(
    defaultDeliveryTimings
  );

  // sync delivery timings state when setting changes
  useEffect(() => {
    // delivery timings
    const deliveryTime = settings.find(
      (x) => x.key == "delivery_timings_delivery_time"
    );
    const pickupTime = settings.find(
      (x) => x.key == "delivery_timings_pickup_time"
    );
    const instoreTime = settings.find(
      (x) => x.key == "delivery_timings_instore_time"
    );

    setDeliveryTimings({
      delivery_time: deliveryTime?.value || "10",
      pickup_time: pickupTime?.value || "10",
      instore_time: instoreTime?.value || "10",
    });
  }, [settings]);

  // now filter against server UTC created_at
  // const todaysOrdersSorted = [...(all_orders || [])]
  //   .sort((a, b) => a.daily_sequence - b.daily_sequence)
  //   .reverse();
  // Set active order when orders list updates

  const openOrder = (order: Order) => {
    dispatch(setActiveOrderRefund(order));
  };

  const toggleOrderDetailFunc = (e: any) => {
    e.preventDefault();
    dispatch(toggleOrderDetail());
  };

  const delivery_type_time = (type_name: string) => {
    if (type_name === "Delivery") {
      return Number(deliveryTimings.delivery_time);
    } else if (type_name === "Pick Up") {
      return Number(deliveryTimings.pickup_time);
    } else if (type_name === "In Store") {
      return Number(deliveryTimings.instore_time);
    } else return 0;
  };

  const findUser = (user_id: any) => {
    const user = users.find((x) => x.id === user_id);
    return user?.name;
  };

  const calculateDiscount = (
    service_charges: string,
    delivery_charges: string,
    amount: string,
    total: string
  ): number => {
    const sc = parseFloat(service_charges) || 0;
    const dc = parseFloat(delivery_charges) || 0;
    const amt = parseFloat(amount) || 0;
    const totalCharged = parseFloat(total) || 0;

    const totalAmount = sc + dc + amt;
    const discount = totalAmount - totalCharged;

    return parseFloat(discount.toFixed(2));
  };

  const getRiderName = (user_id: any) => {
    const user = users.find((x) => x.id === user_id);
    return user?.name;
  };

  useEffect(() => {
    if (store_id) {
      dispatch(getOrdersByID({ store_id: store_id, fetchAll: true }));
    }
  }, [store_id]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchOrder, setSearchOrder] = useState("");

  const filteredOrders = useMemo(() => {
    if (!all_orders) return [];

    const term = searchOrder.trim();
    if (!term) return all_orders;

    return all_orders.filter((order) => order.id.toString().includes(term));
  }, [searchOrder, all_orders]);

  const refundOrder = (status: string) => {
    dispatch(updateOrderStatus(status));
  };

  return (
    <div className="orders">
      <Row>
        {/* <Col md="4" className="p-2">
          <Dropdown className="w-100">
            <Dropdown.Toggle className="w-100" variant="secondary">
              {selectedOrder ? `Order #${selectedOrder.id}` : "Select Order"}
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="w-100 p-2"
              style={{ maxHeight: 300, overflowY: "auto" }}
            >
              <Form.Control
                type="text"
                placeholder="Search order ID..."
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value.toLowerCase())}
                className="mb-2"
              />

              {filteredOrders?.length > 0 ? (
                filteredOrders.map((order) => (
                  <Dropdown.Item
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      openOrder(order);
                    }}
                  >
                    Order #{order.id}
                  </Dropdown.Item>
                ))
              ) : (
                <div className="text-muted text-center small">
                  No orders found
                </div>
              )}
            </Dropdown.Menu>
          </Dropdown>

          <Button
            variant="danger"
            className="w-100 mt-3"
            disabled={!selectedOrder}
            onClick={() => {
              refundOrder("Refunded");
            }}
          >
            Refund
          </Button>
        </Col> */}

        <Col md="4" className="p-6">
          {/* Order Selection */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Select Order</Form.Label>

            <Dropdown className="w-100">
              <Dropdown.Toggle
                className="w-100 text-start text-danger fw-semibold"
                variant="outline-secondary"
              >
                {selectedOrder
                  ? `Order #${selectedOrder.id}`
                  : "Choose an order"}
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="w-100 p-2 shadow-sm order-dropdown-menu "
                style={{ maxHeight: 300, overflowY: "auto" }}
              >
                {/* Search Input */}
                <Form.Group className="mb-2">
                  <Form.Label className="small text-muted">
                    Search by Order ID
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. 6042"
                    value={searchOrder}
                    onChange={(e) =>
                      setSearchOrder(e.target.value.toLowerCase())
                    }
                    size="sm"
                  />
                </Form.Group>

                <Dropdown.Divider />

                {/* Orders List */}
                {filteredOrders?.length > 0 ? (
                  filteredOrders.map((order) => (
                    <Dropdown.Item
                      key={order.id}
                      className="py-2"
                      onClick={() => {
                        setSelectedOrder(order);
                        openOrder(order);
                      }}
                    >
                      <div className="fw-medium">Order #{order.id}</div>
                      <div className="small text-muted">
                        Click to view details
                      </div>
                    </Dropdown.Item>
                  ))
                ) : (
                  <div className="text-muted text-center small py-2">
                    No matching orders found
                  </div>
                )}
              </Dropdown.Menu>
            </Dropdown>

            <Form.Text className="text-muted">
              Select an order to enable refund actions.
            </Form.Text>
          </Form.Group>

          {/* Refund Action */}
          <Form.Group>
            <Form.Label className="fw-semibold">Refund Action</Form.Label>

            <Button
              variant="danger"
              className="w-100"
              disabled={!selectedOrder}
              onClick={() => refundOrder("Refunded")}
            >
              Refund Selected Order
            </Button>
          </Form.Group>
        </Col>

        <Col md="8" className="p-0">
          {is_order_detail_open && active_order ? (
            <div className="order-details">
              <div className="order-details-header">
                <a href="" role="button" onClick={toggleOrderDetailFunc}>
                  <FeatherIcon icon="chevron-left" size={14} />
                </a>
                Order Details
              </div>
              <div className="container-fluid">
                {active_order.order_type != "In Store" && (
                  <>
                    <Row className="order-details-row">
                      <Col
                        md="6"
                        className="order-details-label"
                        style={{ fontSize: "14px" }}
                      >
                        Customer
                      </Col>
                      <Col
                        md="6"
                        className="order-details-value"
                        style={{ fontSize: "14px" }}
                      >
                        {active_order.first_name} {active_order.last_name}
                      </Col>
                    </Row>
                    <Row className="order-details-row">
                      <Col
                        md="6"
                        className="order-details-label"
                        style={{ fontSize: "14px" }}
                      >
                        Customer No
                      </Col>
                      <Col
                        md="6"
                        className="order-details-value"
                        style={{ fontSize: "14px" }}
                      >
                        {active_order.phone_number}
                      </Col>
                    </Row>
                  </>
                )}
                <Row className="order-details-row">
                  <Col
                    md="6"
                    className="order-details-label"
                    style={{ fontSize: "14px" }}
                  >
                    Order #
                  </Col>
                  <Col
                    md="6"
                    className="order-details-value"
                    style={{ fontSize: "14px" }}
                  >
                    {active_order.id}
                  </Col>
                </Row>
                <Row className="order-details-row">
                  <Col
                    md="6"
                    className="order-details-label"
                    style={{ fontSize: "14px" }}
                  >
                    Order Id
                  </Col>
                  <Col
                    md="6"
                    className="order-details-value"
                    style={{ fontSize: "14px" }}
                  >
                    {active_order.order_number}
                  </Col>
                </Row>

                <Row className="order-details-row">
                  <Col
                    md="6"
                    className="order-details-label"
                    style={{ fontSize: "14px" }}
                  >
                    Placed
                  </Col>
                  <Col
                    md="6"
                    className="order-details-value"
                    style={{ fontSize: "14px" }}
                  >
                    {new Date(active_order.created_at).toDateString()}
                  </Col>
                </Row>
                <Row className="order-details-row">
                  <Col
                    md="6"
                    className="order-details-label"
                    style={{ fontSize: "14px" }}
                  >
                    Source
                  </Col>
                  <Col
                    md="6"
                    className="order-details-value"
                    style={{ fontSize: "14px" }}
                  >
                    {active_order.source === "pos" ? "POS" : "Website"}
                  </Col>
                </Row>
                <Row className="order-details-row">
                  <Col
                    md="6"
                    className="order-details-label"
                    style={{ fontSize: "14px" }}
                  >
                    Taken By
                  </Col>
                  <Col
                    md="6"
                    className="order-details-value"
                    style={{ fontSize: "14px" }}
                  >
                    {findUser(active_order.created_by) || "Default/Website"}
                  </Col>
                </Row>
                <Row className="order-details-row">
                  <Col
                    md="6"
                    className="order-details-label"
                    style={{ fontSize: "14px" }}
                  >
                    Order Type
                  </Col>
                  <Col
                    md="6"
                    className="order-details-value"
                    style={{ fontSize: "14px" }}
                  >
                    {active_order.order_type}
                  </Col>
                </Row>
                <Row className="order-details-row">
                  <Col
                    md="6"
                    className="order-details-label"
                    style={{ fontSize: "14px" }}
                  >
                    Payment Method
                  </Col>
                  <Col
                    md="6"
                    className="order-details-value"
                    style={{ fontSize: "14px" }}
                  >
                    {active_order.payment_method}
                  </Col>
                </Row>
                <Row className="order-details-row">
                  <Col
                    md="6"
                    className="order-details-label"
                    style={{ fontSize: "14px" }}
                  >
                    Payment Status
                  </Col>
                  <Col
                    md="6"
                    className="order-details-value"
                    style={{ fontSize: "14px" }}
                  >
                    {active_order.payment_status.toUpperCase()}
                  </Col>
                </Row>
              </div>
            </div>
          ) : active_order ? (
            <div className="active-order">
              <div className="active-order-info-container">
                <div className="active-order-info" style={{ fontSize: "14px" }}>
                  {active_order.order_type === "Delivery" ? (
                    <FeatherIcon icon="truck" size="20" />
                  ) : active_order.order_type === "In Store" ? (
                    <FeatherIcon icon="home" size="20" />
                  ) : (
                    <FeatherIcon icon="shopping-bag" size="20" />
                  )}
                  <div className="active-order-detail ">
                    <h6 style={{ fontSize: "16px" }} className="fw-bold">
                      {active_order.daily_sequence}. {active_order.first_name}{" "}
                      {active_order.last_name}
                    </h6>
                    <span style={{ fontSize: "14px" }}>
                      {active_order.door_no}, {active_order.street},{" "}
                      {active_order.city}, {active_order.post_code}
                    </span>
                    <span style={{ fontSize: "14px" }}>
                      {active_order.phone_number}
                    </span>
                    <Row className="order-details-row"></Row>
                    <span>Order ID : {active_order.order_number}</span>
                    <span>
                      Source :{" "}
                      {active_order.source === "pos" ? "POS" : "Website"}
                    </span>
                    <span>
                      Refunded : {active_order.is_refund === 1 ? "Yes" : "No"}
                    </span>
                    {active_order.status === "Assigned" && (
                      <span>
                        Driver : {getRiderName(active_order.rider_id) || "N/A"}
                      </span>
                    )}
                  </div>
                  <div
                    className="active-order-time"
                    style={{ fontSize: "14px" }}
                  >
                    <Countdown
                      timezone={selectedTimezone}
                      durationMinutes={delivery_type_time(
                        active_order.order_type
                      )}
                      created_at={active_order.created_at}
                    />
                  </div>
                </div>
                <div className="active-order-info-buttons">
                  <button
                    type="button"
                    style={{ fontSize: "14px" }}
                    className="active-order-info-button border-0 outline-none bg-transparent"
                    onClick={toggleOrderDetailFunc}
                  >
                    <FeatherIcon icon="info" size="16" />
                    Details
                  </button>
                </div>
              </div>
              <div className="active-order-summary">
                {active_order.items.map((item, index) => (
                  <div className="active-order-item" key={index}>
                    <div className="item-info">
                      <h6 style={{ fontSize: "14px" }}>
                        {item.quantity} x {item.name}
                      </h6>

                      {item.modifiers.map((x) => (
                        <span style={{ fontSize: "14px" }}>
                          {x.name} {currencySymbol}({x.price})
                        </span>
                      ))}

                      {item.comment && (
                        <span
                          className="item-comment"
                          style={{ fontSize: "14px" }}
                        >
                          <FeatherIcon
                            icon="message-circle"
                            size="16"
                            className="summary-commment-icon"
                          />
                          {item.comment}
                        </span>
                      )}
                    </div>
                    <div className="item-price" style={{ fontSize: "14px" }}>
                      {currencySymbol}
                      {item.amount}
                    </div>
                  </div>
                ))}

                {active_order.comment && (
                  <div
                    className="active-order-comment"
                    style={{ fontSize: "14px" }}
                  >
                    <h6 style={{ fontSize: "14px" }}>Comments:</h6>
                    <span style={{ fontSize: "14px" }}>
                      {active_order.comment}
                    </span>
                  </div>
                )}
                <div
                  className="active-order-total"
                  style={{ fontSize: "14px" }}
                >
                  <h6 style={{ fontSize: "14px" }}>Service Charges:</h6>
                  <span style={{ fontSize: "14px" }}>
                    {currencySymbol}
                    {parseFloat(active_order.service_charges).toFixed(2)}
                  </span>
                </div>
                <div
                  className="active-order-total"
                  style={{ fontSize: "14px" }}
                >
                  <h6 style={{ fontSize: "14px" }}>Delivery Charges:</h6>
                  <span style={{ fontSize: "14px" }}>
                    {currencySymbol}
                    {Number(active_order.delivery_charges || 0).toFixed(2)}
                  </span>
                </div>
                <div
                  className="active-order-total"
                  style={{ fontSize: "14px" }}
                >
                  <h6 style={{ fontSize: "14px" }}>Discount:</h6>
                  <span style={{ fontSize: "14px" }}>
                    {currencySymbol}
                    {calculateDiscount(
                      active_order.service_charges,
                      active_order.delivery_charges,
                      active_order.amount,
                      active_order.total
                    ).toFixed(2)}
                  </span>
                </div>
                <div
                  className="active-order-total"
                  style={{ fontSize: "14px" }}
                >
                  <h6 style={{ fontSize: "14px" }}>Grand Total:</h6>
                  <span style={{ fontSize: "14px" }}>
                    {currencySymbol}
                    {parseFloat(active_order.total).toFixed(2)}
                  </span>
                </div>
              </div>
              {/* {active_order.status === "Pending" && (
                <div
                  className="active-order-buttons"
                  style={{ fontSize: "14px" }}
                >
                  <Button
                    variant="primary"
                    onClick={() => updateOrderStatusFunc("Processing")}
                  >
                    <FeatherIcon icon="check" size="16" />
                    Accept
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => updateOrderStatusFunc("Rejected")}
                  >
                    <FeatherIcon icon="x" size="16" />
                    Reject
                  </Button>
                </div>
              )} */}
            </div>
          ) : (
            <div className="order-wrapper">
              {/* <img
                  src={require("../../Assets/Images/order-bg.jpg")}
                  className="order-wrapper-bg"
                  alt="order background"
                /> */}
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default InvoiceRefundGrid;

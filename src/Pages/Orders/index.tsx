import {
  Container,
  Row,
  Col,
  Tab,
  Nav,
  Button,
  Table,
  Form,
} from "react-bootstrap";
import React, { useEffect, useState } from "react";
import FeatherIcon, { X } from "feather-icons-react";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import {
  assignRider,
  clearActiveOrder,
  editOrder,
  getOrders,
  Order,
  printOrder,
  removeEditOrder,
  setActiveOrder,
  toggleOrderDetail,
  updateOrderStatus,
} from "../../Redux/Ducks/orderSlice";
import AutoPrintPdf from "Components/PrintOrderByIframe";
import Countdown from "Components/Countdown";
import { TDeliverTimings } from "Pages/Setting/Store";
import { useLocation, useNavigate } from "react-router-dom";
import { ITimezoneOption } from "react-timezone-select";
import OrderOptions from "./OrderOptions";
import AssignRiderModal from "./assign-rider";
import { setToast } from "../../Redux/Ducks/toastSlice";
import { formatSave, getTime } from "Utils/date-formate";
import { useUserPermissions } from "Hook/permissions";
import { resetBooking } from "../../Redux/Ducks/homeSlice";
import { clearPuserState } from "../../Redux/Ducks/pusherSlice";

const Orders = () => {
  const { state } = useLocation();
  const order_data = (state as any)?.order_data;

  const dispatch = useAppDispatch();
  const orders_loaded = useAppSelector((state) => state.Order.orders_loaded);
  const all_orders = useAppSelector((state) => state.Order.orders);
  const active_order = useAppSelector((state) => state.Order.active_order);
  const is_order_detail_open = useAppSelector(
    (state) => state.Order.is_order_detail_open,
  );
  const OrderCreated = useAppSelector((state) => state.pusher.OrderCreated);
  const OrderUpdated = useAppSelector((state) => state.pusher.OrderUpdated);
  const store_id = useAppSelector((state) => state.Home.selected_store);

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

  useEffect(() => {
    if (order_data) {
      dispatch(setActiveOrder(order_data));
    }
  }, [order_data]);

  // Find currency symbol from the settings object
  useEffect(() => {
    if (settings.find((x) => x.key == "currency-symbol")?.value)
      setCurrencySymbol(
        settings.find((x) => x.key == "currency-symbol")?.value as any,
      );
  }, [settings]);

  const defaultDeliveryTimings = {
    delivery_time: "10",
    pickup_time: "10",
    instore_time: "10",
  };

  const [deliveryTimings, setDeliveryTimings] = useState<TDeliverTimings>(
    defaultDeliveryTimings,
  );

  useEffect(() => {
    console.log("clear on startup");
    dispatch(clearActiveOrder());
  }, []);

  // sync delivery timings state when setting changes
  useEffect(() => {
    // delivery timings
    const deliveryTime = settings.find(
      (x) => x.key == "delivery_timings_delivery_time",
    );
    const pickupTime = settings.find(
      (x) => x.key == "delivery_timings_pickup_time",
    );
    const instoreTime = settings.find(
      (x) => x.key == "delivery_timings_instore_time",
    );

    setDeliveryTimings({
      delivery_time: deliveryTime?.value || "10",
      pickup_time: pickupTime?.value || "10",
      instore_time: instoreTime?.value || "10",
    });
  }, [settings]);

  useEffect(() => {
    if (!orders_loaded && store_id) {
      const today = new Date();
      const day = formatSave(today);
      const storeId = Number(store_id);
      dispatch(getOrders({ store_id: storeId, day }));
    }
  }, [orders_loaded, store_id]);

  // now filter against server UTC created_at
  const todaysOrdersSorted = [...(all_orders || [])]
    .sort((a, b) => a.daily_sequence - b.daily_sequence)
    .reverse();
  // Set active order when orders list updates
  const [incomingOrderId, setIncomingOrderId] = useState<number | null>(null);

  useEffect(() => {
    // Run only if either value is not null/undefined
    if (OrderCreated != null || OrderUpdated != null) {
      console.log("Order changed, refetching...", {
        OrderCreated,
        OrderUpdated,
      });

      const today = new Date();
      const day = formatSave(today);
      const storeId = Number(store_id);

      dispatch(getOrders({ store_id: storeId, day }));
      dispatch(clearPuserState());
    }
  }, [OrderCreated, OrderUpdated]);

  useEffect(() => {
    if (incomingOrderId && todaysOrdersSorted.length) {
      const foundOrder = todaysOrdersSorted.find(
        (o) => o.id === incomingOrderId,
      );
      if (foundOrder) {
        dispatch(setActiveOrder(foundOrder));
        setIncomingOrderId(null); // clear so manual changes aren't overwritten
      }
    }
  }, [todaysOrdersSorted, incomingOrderId]);

  const openOrder = (order: Order) => {
    dispatch(setActiveOrder(order));
  };

  const updateOrderStatusFunc = async (status: string) => {
    await dispatch(updateOrderStatus(status));
    dispatch(removeEditOrder());
    dispatch(resetBooking());
  };

  const toggleOrderDetailFunc = (e: any) => {
    e.preventDefault();
    dispatch(toggleOrderDetail());
  };

  const printerOrder = (orderID: number) => {
    dispatch(printOrder(orderID));
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
    total: string,
  ): number => {
    const sc = parseFloat(service_charges) || 0;
    const dc = parseFloat(delivery_charges) || 0;
    const amt = parseFloat(amount) || 0;
    const totalCharged = parseFloat(total) || 0;

    const totalAmount = sc + dc + amt;
    const discount = totalAmount - totalCharged;

    return parseFloat(discount.toFixed(2));
  };

  const [riderModal, setRiderModal] = useState<boolean>(false);
  const triggerAssignRider = () => {
    setRiderModal(!riderModal);
  };

  const handleAssignRider = () => {
    triggerAssignRider();
  };

  const handleUnAssignRider = () => {
    dispatch(assignRider(null));
    dispatch(
      setToast({ message: "Rider unassigned successfully", type: "success" }),
    );
  };

  const getRiderName = (user_id: any) => {
    const user = users.find((x: any) => x.id === user_id);
    return user?.name;
  };

  const navigate = useNavigate();
  const hasPermissions = useUserPermissions();

  const EditOrder = async () => {
    if (active_order) {
      dispatch(editOrder(active_order));
      navigate("/menu");
    } else {
      alert("No active order");
    }
  };

  return (
    <div className="orders">
      <AutoPrintPdf />
      <AssignRiderModal show={riderModal} onHide={() => setRiderModal(false)} />
      <Container fluid>
        <Row>
          <Col md="6" className="p-0">
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
                      Pre Order
                    </Col>
                    <Col
                      md="6"
                      className="order-details-value"
                      style={{ fontSize: "14px" }}
                    >
                      {/* {active_order.is_preorder === true ? "Yes" : "No"} */}
                      {active_order.preorder_schedule || "No"}
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

                  {active_order.status === "Assigned" && (
                    <Row className="order-details-row">
                      <Col
                        md="6"
                        className="order-details-label"
                        style={{ fontSize: "14px" }}
                      >
                        Driver
                      </Col>
                      <Col
                        md="6"
                        className="order-details-value"
                        style={{ fontSize: "14px" }}
                      >
                        {getRiderName(active_order.rider_id) || "N/A"}
                      </Col>
                    </Row>
                  )}
                </div>
                {active_order.order_type == "Delivery" && (
                  <>
                    <div
                      className="order-details-header"
                      style={{ fontSize: "14px" }}
                    >
                      Delivery Details
                    </div>
                    <div className="container-fluid">
                      <Row className="order-details-row">
                        <Col
                          md="6"
                          className="order-details-label"
                          style={{ fontSize: "14px" }}
                        >
                          Address
                        </Col>
                        <Col
                          md="6"
                          className="order-details-value"
                          style={{ fontSize: "14px" }}
                        >
                          {active_order.door_no}, {active_order.street},{" "}
                          {active_order.city}, {active_order.post_code}
                        </Col>
                      </Row>
                    </div>
                  </>
                )}
              </div>
            ) : active_order ? (
              <div className="active-order">
                <div className="active-order-options">
                  {active_order.status == "Processing" && (
                    <div
                      className="active-order-option"
                      onClick={() => updateOrderStatusFunc("Ready")}
                      style={{ fontSize: "14px" }}
                    >
                      <FeatherIcon icon="check-circle" size="20" />
                      Ready
                    </div>
                  )}
                  {hasPermissions.some((p) => p.name === "manage-edit-order") &&
                    (active_order.status == "Pending" ||
                      active_order.status == "Processing") && (
                      <div
                        className="active-order-option"
                        onClick={EditOrder}
                        style={{ fontSize: "14px" }}
                      >
                        <FeatherIcon icon="edit" size="20" />
                        Edit
                      </div>
                    )}
                  {(active_order.status == "Ready" ||
                    active_order.status == "Assigned") &&
                    active_order.order_type == "Delivery" && (
                      <div
                        className="active-order-option"
                        style={{ fontSize: "14px" }}
                        onClick={() => updateOrderStatusFunc("On the Way")}
                      >
                        <FeatherIcon icon="check-circle" size="20" />
                        On The Way
                      </div>
                    )}

                  {active_order.status == "Ready" &&
                    active_order.order_type == "Delivery" && (
                      <div
                        className="active-order-option"
                        style={{ fontSize: "14px" }}
                        onClick={handleAssignRider}
                      >
                        <FeatherIcon icon="truck" size="20" />
                        Assign Driver
                      </div>
                    )}

                  {active_order.status == "Assigned" &&
                    active_order.order_type == "Delivery" && (
                      <div
                        className="active-order-option"
                        style={{ fontSize: "14px" }}
                        onClick={handleUnAssignRider}
                      >
                        <FeatherIcon icon="truck" size="20" />
                        Unassign
                      </div>
                    )}

                  {active_order.status == "On the Way" &&
                    active_order.order_type == "Delivery" && (
                      <div
                        style={{ fontSize: "14px" }}
                        className="active-order-option"
                        onClick={() => updateOrderStatusFunc("Completed")}
                      >
                        <FeatherIcon icon="check-circle" size="20" />
                        Complete
                      </div>
                    )}

                  {active_order.status == "Ready" &&
                    (active_order.order_type == "Pick Up" ||
                      active_order.order_type == "In Store") && (
                      <div
                        style={{ fontSize: "14px" }}
                        className="active-order-option"
                        onClick={() => updateOrderStatusFunc("Completed")}
                      >
                        <FeatherIcon icon="check-circle" size="20" />
                        Complete
                      </div>
                    )}

                  <div
                    style={{ fontSize: "14px" }}
                    className="active-order-option"
                    onClick={() => printerOrder(active_order.id)}
                  >
                    <FeatherIcon icon="printer" size="20" />
                    Print
                  </div>
                  {active_order.status == "Pending" && (
                    <div
                      style={{ fontSize: "14px" }}
                      className="active-order-option"
                      onClick={() => updateOrderStatusFunc("Cancelled")}
                    >
                      <FeatherIcon icon="x" size="20" />
                      Cancel
                    </div>
                  )}
                  <div
                    className="active-order-option"
                    style={{ fontSize: "14px" }}
                    onClick={() => updateOrderStatusFunc("Cancelled")}
                  >
                    <FeatherIcon icon="user-x" size="20" />
                    Void
                  </div>
                  <OrderOptions order_id={active_order.id} />
                </div>
                <div className="active-order-info-container">
                  <div
                    className="active-order-info"
                    style={{ fontSize: "14px" }}
                  >
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
                        Pre Order : {active_order.preorder_schedule || "No"}
                      </span>
                      {active_order.status === "Assigned" && (
                        <span>
                          Driver :{" "}
                          {getRiderName(active_order.rider_id) || "N/A"}
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
                          active_order.order_type,
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
                  <div className="list-group list-group-flush">
                    <div className="list-group list-group-flush">
                      <div className="cart-items">
                        {active_order.items.map((item, index) => {
                          const itemBasePrice = parseFloat(item.price) || 0;
                          const modifiersTotal = item.modifiers.reduce(
                            (sum, mod) => sum + (parseFloat(mod.price) || 0),
                            0,
                          );
                          const totalPerUnit = itemBasePrice + modifiersTotal;
                          const totalItemAmount = totalPerUnit * item.quantity;

                          const isLast =
                            index === active_order.items.length - 1;

                          return (
                            <div key={item.id || index}>
                              <div className="cart-item-card bg-white ">
                                {/* Header */}
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="item-header">
                                    <span className="item-quantity fw-bold text-primary me-2">
                                      {item.quantity}×
                                    </span>
                                    <span className="item-name fw-semibold">
                                      {item.name}
                                    </span>
                                  </div>
                                  <div className="item-total text-end">
                                    <div className="item-price fw-bold fs-5">
                                      {currencySymbol}
                                      {totalItemAmount.toFixed(2)}
                                    </div>
                                    <div className="unit-price text-muted small">
                                      ({currencySymbol}
                                      {item.price}/ea)
                                    </div>
                                  </div>
                                </div>

                                {/* Modifiers */}
                                {item.modifiers?.length > 0 && (
                                  <div className="item-modifiers ms-3">
                                    <div className="modifiers-label small text-muted mb-1">
                                      Modifiers:
                                    </div>
                                    {item.modifiers.map(
                                      (modifier, modIndex) => (
                                        <div
                                          key={modifier.id || modIndex}
                                          className="modifier-item d-flex justify-content-between small py-1"
                                        >
                                          <span>• {modifier.name}</span>
                                          <span className="text-muted">
                                            {currencySymbol}
                                            {parseFloat(
                                              modifier.price || "0",
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}

                                {/* Comment */}
                                {item.comment && (
                                  <div className="item-comment mt-3">
                                    <div className="comment-box bg-light p-2 rounded small d-flex gap-2">
                                      <FeatherIcon
                                        icon="message-circle"
                                        size="14"
                                        className="text-muted"
                                      />
                                      <span className="text-muted">
                                        <strong>Special instructions:</strong>{" "}
                                        {item.comment}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Separator */}
                              {!isLast && (
                                <div className="border-top my-2 opacity-50"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

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
                        active_order.total,
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
                {active_order.status === "Pending" && (
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
                )}
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
          <Col md="6" className="p-0">
            <div className="order-tab-container">
              <Tab.Container defaultActiveKey="current">
                <Nav variant="tabs" className="order-tab-nav">
                  <Nav.Item>
                    <Nav.Link eventKey="current">Current</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="onTheWay">On the Way</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="completed">Completed</Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content className="order-tab-content">
                  <Tab.Pane eventKey="current">
                    {todaysOrdersSorted
                      .filter(
                        (x) =>
                          x.status == "Pending" ||
                          x.status == "Processing" ||
                          x.status == "Ready" ||
                          x.status == "Assigned",
                      )
                      .map((order, index) => (
                        <div
                          className={`order-item ${
                            order.status === "Pending" &&
                            !order.is_preorder &&
                            "pulse-bg"
                          } ${
                            order.status === "Pending" &&
                            order.is_preorder &&
                            "pulse-bg-preorder"
                          }`}
                          onClick={() => openOrder(order)}
                        >
                          <div
                            className="order-number"
                            style={{ fontSize: "14px" }}
                          >
                            {order.daily_sequence}
                          </div>
                          <div
                            className="order-detail"
                            style={{ fontSize: "14px" }}
                          >
                            <h6
                              style={{ fontSize: "14px" }}
                              className="fw-bold"
                            >
                              {order.order_type} : {order.first_name}{" "}
                              {order.last_name}
                            </h6>

                            <h6 style={{ fontSize: "14px" }}>
                              {order.door_no}, {order.street}, {order.city},{" "}
                              {order.post_code}
                            </h6>
                          </div>
                          <div
                            className="order-time"
                            style={{ fontSize: "14px" }}
                          >
                            <FeatherIcon icon="clock" size="18" />
                            <Countdown
                              timezone={selectedTimezone}
                              durationMinutes={delivery_type_time(
                                order.order_type,
                              )}
                              created_at={order.created_at}
                            />
                          </div>
                        </div>
                      ))}
                  </Tab.Pane>
                  <Tab.Pane eventKey="onTheWay">
                    {todaysOrdersSorted
                      .filter((x) => x.status == "On the Way")
                      .map((order, index) => (
                        <div
                          className="order-item"
                          onClick={() => openOrder(order)}
                        >
                          <div
                            className="order-number p-4"
                            style={{ fontSize: "14px" }}
                          >
                            {order.daily_sequence}
                          </div>
                          <div
                            className="order-detail p-4"
                            style={{ fontSize: "14px" }}
                          >
                            <h6
                              style={{ fontSize: "14px" }}
                              className="fw-bold"
                            >
                              {order.order_type != "Delivery" && <>Pickup:</>}{" "}
                              {order.first_name} {order.last_name}
                            </h6>
                            {order.order_type == "Delivery" && (
                              <h6 style={{ fontSize: "14px" }}>
                                {order.door_no}, {order.street}, {order.city},{" "}
                                {order.post_code}
                              </h6>
                            )}

                            {/* <div className="driver-detail">
                                                    <FeatherIcon icon="truck" size="12" />
                                                    <span>Hamid Sb. | 0730-9883223</span>
                                                </div> */}
                          </div>
                          <div
                            className="order-time p-4"
                            style={{ fontSize: "14px" }}
                          >
                            <FeatherIcon icon="clock" size="18" />
                            <Countdown
                              timezone={selectedTimezone}
                              durationMinutes={delivery_type_time(
                                order.order_type,
                              )}
                              created_at={order.created_at}
                            />
                          </div>
                        </div>
                      ))}
                  </Tab.Pane>
                  <Tab.Pane eventKey="completed">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Type</th>
                          <th>Address</th>
                          <th>Time</th>
                          <th>Amt</th>
                          <th>Mode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todaysOrdersSorted
                          .filter(
                            (x) =>
                              x.status === "Completed" ||
                              x.status === "Rejected" ||
                              x.status === "Cancelled",
                          )
                          .map((order, index) => {
                            const rowClass =
                              order.status === "Rejected" ||
                              order.status === "Cancelled"
                                ? "bg-danger text-white cursor-pointer p-4"
                                : "cursor-pointer p-4";

                            return (
                              <tr
                                onClick={() => openOrder(order)}
                                key={index}
                                className="cursor-pointer"
                              >
                                <td
                                  className={rowClass}
                                  style={{ fontSize: "14px" }}
                                >
                                  {order.daily_sequence}
                                </td>
                                <td
                                  className={rowClass}
                                  style={{ fontSize: "14px" }}
                                >
                                  {order.order_type === "Delivery" ? (
                                    <FeatherIcon icon="truck" size="16" />
                                  ) : order.order_type === "In Store" ? (
                                    <FeatherIcon icon="home" size="16" />
                                  ) : (
                                    <FeatherIcon
                                      icon="shopping-bag"
                                      size="16"
                                    />
                                  )}
                                </td>

                                <td className={rowClass}>
                                  <div className="order-detail">
                                    {order.order_type === "Delivery" ? (
                                      <>
                                        <h6
                                          style={{ fontSize: "14px" }}
                                          className="fw-bold"
                                        >
                                          {order.first_name} {order.last_name}
                                        </h6>
                                        {/* <span>
                                          {order.door_no}, {order.street},{" "}
                                          {order.city}, {order.post_code}
                                        </span> */}
                                        <h6 style={{ fontSize: "14px" }}>
                                          {order.door_no}, {order.street},{" "}
                                          {order.city}, {order.post_code}
                                        </h6>
                                      </>
                                    ) : order.order_type === "Pick Up" ? (
                                      <h6 style={{ fontSize: "14px" }}>
                                        Pickup: {order.first_name}{" "}
                                        {order.last_name}
                                      </h6>
                                    ) : order.order_type === "In Store" ? (
                                      <h6 style={{ fontSize: "14px" }}>
                                        In Store: {order.first_name}{" "}
                                        {order.last_name}
                                      </h6>
                                    ) : null}
                                  </div>
                                </td>
                                <td
                                  className={rowClass}
                                  style={{ fontSize: "14px" }}
                                >
                                  {getTime(order?.created_at)}
                                </td>
                                <td
                                  className={rowClass}
                                  style={{ fontSize: "14px" }}
                                >
                                  {currencySymbol}
                                  {order.amount}
                                </td>
                                <td
                                  className={rowClass}
                                  style={{ fontSize: "14px" }}
                                >
                                  <FeatherIcon icon="credit-card" size="16" />
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </Table>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Orders;

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
import FeatherIcon from "feather-icons-react";
import { Ellipsis } from "react-bootstrap/esm/PageItem";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import {
  assignRider,
  getOrdersReport,
  Order,
  printOrder,
  setActiveOrderReports,
  toggleOrderDetail,
  updateOrderStatus,
} from "../../Redux/Ducks/orderSlice";
import { TDeliverTimings } from "Pages/Setting/Store";
import { useLocation } from "react-router-dom";
import { ITimezoneOption } from "react-timezone-select";
import { formatInTimeZone } from "date-fns-tz";
import { setToast } from "../../Redux/Ducks/toastSlice";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Countdown from "Components/Countdown";
import { DateTime } from "ts-luxon";
import { getTime } from "Utils/date-formate";

const StoreOrderReportGrid: React.FC = () => {
  const { state } = useLocation();
  const order_data = (state as any)?.order_data;

  const dispatch = useAppDispatch();
  const all_orders = useAppSelector((state) => state.Order.orders_report);
  const active_order = useAppSelector(
    (state) => state.Order.active_order_reports,
  );
  const is_order_detail_open = useAppSelector(
    (state) => state.Order.is_order_detail_open,
  );

  const { search } = useLocation();
  const store_id = search.split("=")[1];

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

  useEffect(() => {
    if (order_data) {
      dispatch(setActiveOrderReports(order_data));
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

  // now filter against server UTC created_at
  const todaysOrdersSorted = [...(all_orders || [])]
    .sort((a, b) => a.daily_sequence - b.daily_sequence)
    .reverse();
  // Set active order when orders list updates
  const [incomingOrderId, setIncomingOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (incomingOrderId && todaysOrdersSorted.length) {
      const foundOrder = todaysOrdersSorted.find(
        (o) => o.id === incomingOrderId,
      );
      if (foundOrder) {
        dispatch(setActiveOrderReports(foundOrder));
        setIncomingOrderId(null); // clear so manual changes aren't overwritten
      }
    }
  }, [todaysOrdersSorted, incomingOrderId]);

  const openOrder = (order: Order) => {
    dispatch(setActiveOrderReports(order));
  };

  const updateOrderStatusFunc = (status: string) => {
    dispatch(updateOrderStatus(status));
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
    const user = users.find((x) => x.id === user_id);
    return user?.name;
  };

  const tz = selectedTimezone.value;

  const [date, setDate] = useState(new Date()); // ✅ keep raw Date object

  useEffect(() => {
    if (store_id) {
      const today = new Date();
      const day = formatSave(today);
      const storeId = Number(store_id);
      dispatch(getOrdersReport({ store_id: storeId, day }));
    }
  }, [store_id]);

  // helper for saving (string in ddMMyyyy etc.)
  const formatSave = (d: Date) =>
    formatInTimeZone(d, tz, "dd-MM-yyyy hh:mm:ss");

  function formatForInput(d: Date | null, tz: any) {
    if (!d) return "";
    return DateTime.fromJSDate(d).setZone(tz).toFormat("yyyy-MM-dd'T'HH:mm");
  }

  const goNext = () => {
    const next = new Date(date);
    next.setDate(date.getDate() + 1); // move forward
    setDate(next);

    const day = formatSave(next);

    const storeId = Number(store_id);
    dispatch(getOrdersReport({ store_id: storeId, day }));
  };

  const goBack = () => {
    const prev = new Date(date);
    prev.setDate(date.getDate() - 1); // move back
    setDate(prev);

    const day = formatSave(prev);
    const storeId = Number(store_id);
    dispatch(getOrdersReport({ store_id: storeId, day }));
  };

  const handleFetchOrders = () => {
    if (store_id) {
      const day = formatSave(date);
      const storeId = Number(store_id);
      dispatch(getOrdersReport({ store_id: storeId, day }));
    }
  };

  const today = formatInTimeZone(new Date(), tz, "dd/MM/yy");
  const current = formatInTimeZone(new Date(date), tz, "dd/MM/yy");

  const handleExport = () => {
    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(todaysOrdersSorted);

    // Create a new workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "report");

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save as file
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "export_data.xlsx");
  };

  return (
    <div className="orders">
      <Row>
        <Col md="5" className="p-0">
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
                {/* {active_order.status == "Processing" && (
                  <div
                    className="active-order-option"
                    onClick={() => updateOrderStatusFunc("Ready")}
                    style={{ fontSize: "14px" }}
                  >
                    <FeatherIcon icon="check-circle" size="20" />
                    Ready
                  </div>
                )} */}
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
                {/* {active_order.status == "Pending" && (
                  <div
                    style={{ fontSize: "14px" }}
                    className="active-order-option"
                    onClick={() => updateOrderStatusFunc("Cancelled")}
                  >
                    <FeatherIcon icon="x" size="20" />
                    Cancel
                  </div>
                )} */}
                {/* <div
                  className="active-order-option"
                  style={{ fontSize: "14px" }}
                  onClick={() => updateOrderStatusFunc("Cancelled")}
                >
                  <FeatherIcon icon="user-x" size="20" />
                  Void
                </div> */}
                {/* <OrderOptions order_id={active_order.id} /> */}
              </div>
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
        <Col md="7" className="p-0">
          <div className="order-tab-container">
            <div className="d-flex align-items-center justify-content-between gap-2 px-2  py-2 border-bottom">
              <div className="d-flex align-items-center justify-content-center gap-2 px-2">
                <button
                  className="btn btn-outline-primary btn-xs"
                  onClick={goBack}
                  style={{
                    padding: "3px 10px",
                  }}
                >
                  <FeatherIcon icon="arrow-left" size={14} />
                </button>

                <input
                  type="datetime-local"
                  value={formatForInput(date, tz)}
                  onChange={(e) => {
                    const value = e.target.value; // "YYYY-MM-DDTHH:mm"

                    // Parse the value *as if it were in tz* (wall-clock),
                    // then convert to JS Date (an instant).
                    const dt = DateTime.fromISO(value, { zone: tz });
                    setDate(dt.toJSDate());
                  }}
                />

                {/* <span className="fw-bold">{formatSave(date)}</span> */}

                <button
                  disabled={current >= today} // 🚀 disable if current is today or after
                  style={{
                    padding: "3px 10px",
                    backgroundColor: current >= today ? "#ccc" : "",
                  }}
                  className="btn btn-outline-primary btn-xs"
                  onClick={goNext}
                >
                  <FeatherIcon icon="arrow-right" size={14} />
                </button>
                <button
                  className="btn btn-primary "
                  onClick={handleFetchOrders}
                  style={{
                    padding: "3px 10px ",
                  }}
                >
                  <FeatherIcon icon="search" size={16} /> Search
                </button>
              </div>

              <button
                className="btn btn-primary "
                onClick={handleExport}
                style={{
                  padding: "3px 10px ",
                }}
              >
                <FeatherIcon icon="download" size={16} /> Export
              </button>
            </div>
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

                {/* <Nav.Item as="div" className="control">
                    <FeatherIcon icon="search" />
                  </Nav.Item>
                  <Nav.Item as="div" className="control">
                    <FeatherIcon icon="more-vertical" />
                  </Nav.Item> */}
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
                          order.status === "Pending" && ""
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
                          <h6 style={{ fontSize: "14px" }} className="fw-bold">
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
                          <h6 style={{ fontSize: "14px" }} className="fw-bold">
                            {order.order_type != "Delivery" && <>Pickup:</>}{" "}
                            {order.first_name} {order.last_name}
                          </h6>
                          {order.order_type == "Delivery" && (
                            <h6 style={{ fontSize: "14px" }}>
                              {order.door_no}, {order.street}, {order.city},{" "}
                              {order.post_code}
                            </h6>
                          )}
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
                                  <FeatherIcon icon="shopping-bag" size="16" />
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
    </div>
  );
};

export default StoreOrderReportGrid;

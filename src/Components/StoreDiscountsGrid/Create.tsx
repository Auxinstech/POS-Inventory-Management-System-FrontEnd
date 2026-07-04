import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { useState } from "react";
import { useAppDispatch } from "../../Hook/hooks";
import { createDiscount } from "../../Redux/Ducks/homeSlice";
import { IDiscountCreatePayload } from "Models/discounts";

const CreateDiscountModal = ({
  show,
  setShow,
  store_id,
}: {
  show: boolean;
  setShow: any;
  store_id?: number;
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const discountTypes = ["delivery", "pickup", "both"];
  const discountModes = ["percent", "amount"];
  const weekDays = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const [formData, setFormData] = useState<IDiscountCreatePayload>({
    store_id: store_id || 0,
    item_id: null,
    is_active: true,
    discount_mode: "amount",
    percentage: null,
    amount: null,
    min_order_value: null,
    max_discount: null,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    start_time: "00:00:00", // Format: H:i:s (24-hour with leading zeros)
    end_time: "23:59:59", // Format: H:i:s (24-hour with leading zeros)
    discount_type: "delivery",
    first_time_users_only: false,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
    postcode: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev: any) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "discount_mode") {
      // Reset percentage/amount when mode changes
      setFormData((prev: any) => ({
        ...prev,
        discount_mode: value,
        percentage: null,
        amount: null,
      }));
    } else if (name === "start_time" || name === "end_time") {
      // Ensure time is in H:i:s format
      let timeValue = value;
      if (timeValue && timeValue.split(":").length === 2) {
        // If time is in HH:MM format, add seconds
        timeValue = `${timeValue}:00`;
      }
      setFormData((prev: any) => ({
        ...prev,
        [name]: timeValue,
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.store_id) {
      newErrors.store_id = "Store is required";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }
    if (
      formData.start_date &&
      formData.end_date &&
      formData.start_date > formData.end_date
    ) {
      newErrors.end_date = "End date must be after start date";
    }

    // Validate time format
    if (
      formData.start_time &&
      !/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(formData.start_time)
    ) {
      newErrors.start_time = "Start time must be in format HH:MM:SS";
    }
    if (
      formData.end_time &&
      !/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(formData.end_time)
    ) {
      newErrors.end_time = "End time must be in format HH:MM:SS";
    }

    if (formData.discount_mode === "percent") {
      if (
        !formData.percentage ||
        formData.percentage <= 0 ||
        formData.percentage > 100
      ) {
        newErrors.percentage = "Percentage must be between 1 and 100";
      }
    } else if (formData.discount_mode === "amount") {
      if (!formData.amount || formData.amount <= 0) {
        newErrors.amount = "Amount must be greater than 0";
      }
    }
    if (formData.min_order_value && formData.min_order_value < 0) {
      newErrors.min_order_value = "Min order value cannot be negative";
    }
    if (formData.max_discount && formData.max_discount < 0) {
      newErrors.max_discount = "Max discount cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    setLoading(true);

    // Prepare data with proper time format
    const submitData = {
      ...formData,
      start_time: formData.start_time || "00:00:00",
      end_time: formData.end_time || "23:59:59",
    };

    await dispatch(
      createDiscount(submitData, {
        onSuccess: () => {
          // Reset form and close modal
          setFormData({
            store_id: store_id || 0,
            item_id: null,
            is_active: true,
            discount_mode: "amount",
            percentage: null,
            amount: null,
            min_order_value: null,
            max_discount: null,
            start_date: new Date().toISOString().split("T")[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            start_time: "00:00:00",
            end_time: "23:59:59",
            discount_type: "delivery",
            first_time_users_only: false,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
            postcode: null,
          });
          setShow(false);
        },
      }),
    );

    setLoading(false);
  };

  const handleClose = () => {
    setShow(false);
    setErrors({});
    setFormData({
      store_id: store_id || 0,
      item_id: null,
      is_active: true,
      discount_mode: "amount",
      percentage: null,
      amount: null,
      min_order_value: null,
      max_discount: null,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      start_time: "00:00:00",
      end_time: "23:59:59",
      discount_type: "delivery",
      first_time_users_only: false,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
      postcode: null,
    });
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Discount</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            {/* Basic Information */}
            <Col md={12}>
              <h6 className="mb-3 text-primary">Basic Information</h6>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Discount Type <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="discount_type"
                  value={formData.discount_type}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {discountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Discount Mode <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="discount_mode"
                  value={formData.discount_mode}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {discountModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  {formData.discount_mode === "percent"
                    ? "Percentage (%)"
                    : "Amount"}{" "}
                  <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name={
                    formData.discount_mode === "percent"
                      ? "percentage"
                      : "amount"
                  }
                  value={
                    formData.discount_mode === "percent"
                      ? formData.percentage || ""
                      : formData.amount || ""
                  }
                  onChange={handleChange}
                  placeholder={
                    formData.discount_mode === "percent"
                      ? "e.g., 10"
                      : "e.g., 50"
                  }
                  isInvalid={
                    !!(formData.discount_mode === "percent"
                      ? errors.percentage
                      : errors.amount)
                  }
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {formData.discount_mode === "percent"
                    ? errors.percentage
                    : errors.amount}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Min Order Value</Form.Label>
                <Form.Control
                  type="number"
                  name="min_order_value"
                  value={formData.min_order_value || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  isInvalid={!!errors.min_order_value}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.min_order_value}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Max Discount</Form.Label>
                <Form.Control
                  type="number"
                  name="max_discount"
                  value={formData.max_discount || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  isInvalid={!!errors.max_discount}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.max_discount}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Item (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="item_id"
                  value={formData.item_id || ""}
                  onChange={handleChange}
                  placeholder="Item ID or leave empty for all items"
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Leave empty to apply to all items
                </Form.Text>
              </Form.Group>
            </Col> */}

            {/* Validity Period */}
            <Col md={12}>
              <h6 className="mb-3 mt-2 text-primary">Validity Period</h6>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Start Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  isInvalid={!!errors.start_date}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.start_date}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  End Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  isInvalid={!!errors.end_date}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.end_date}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Start Time</Form.Label>
                <Form.Control
                  type="time"
                  name="start_time"
                  value={formData.start_time.substring(0, 5)} // Show only HH:MM in input
                  onChange={handleChange}
                  isInvalid={!!errors.start_time}
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Format: HH:MM (24-hour)
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.start_time}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">End Time</Form.Label>
                <Form.Control
                  type="time"
                  name="end_time"
                  value={formData.end_time.substring(0, 5)} // Show only HH:MM in input
                  onChange={handleChange}
                  isInvalid={!!errors.end_time}
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Format: HH:MM (24-hour)
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.end_time}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Restrictions */}
            <Col md={12}>
              <h6 className="mb-3 mt-2 text-primary">Restrictions</h6>
            </Col>

            {/* <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Postcode</Form.Label>
                <Form.Control
                  type="text"
                  name="postcode"
                  value={formData.postcode || ""}
                  onChange={handleChange}
                  placeholder="Leave empty for all areas"
                  disabled={loading}
                />
              </Form.Group>
            </Col> */}

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="first_time_users_only"
                  label="First Time Users Only"
                  checked={formData.first_time_users_only}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="is_active"
                  label="Active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            {/* Available Days */}
            <Col md={12}>
              <h6 className="mb-3 mt-2 text-primary">Available Days</h6>
              <Row>
                {weekDays.map((day) => (
                  <Col md={3} key={day.key}>
                    <Form.Group className="mb-2">
                      <Form.Check
                        type="checkbox"
                        name={day.key}
                        label={day.label}
                        checked={
                          formData[
                            day.key as keyof IDiscountCreatePayload
                          ] as boolean
                        }
                        onChange={() => handleDayToggle(day.key)}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Discount"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateDiscountModal;

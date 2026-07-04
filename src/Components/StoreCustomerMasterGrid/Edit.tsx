import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../Hook/hooks";
import {
  updateCustomer,
  ICustomerCreatePayload,
  ICustomer,
} from "../../Redux/Ducks/customerSlice";

const EditCustomerModal = ({
  show,
  setShow,
  selectedCustomer,
  store_id,
}: {
  show: boolean;
  setShow: any;
  selectedCustomer: ICustomer | null;
  store_id?: number;
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const customerTypes = ["retail", "wholesale", "corporate"];

  const [formData, setFormData] = useState<Partial<ICustomerCreatePayload>>({
    code: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
    type: "retail",
    credit_limit: 0,
    balance: 0,
    status: true,
    store_id: store_id,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer && show) {
      setFormData({
        code: selectedCustomer.code || "",
        name: selectedCustomer.name || "",
        phone: selectedCustomer.phone || "",
        email: selectedCustomer.email || "",
        address: selectedCustomer.address || "",
        city: selectedCustomer.city || "",
        country: selectedCustomer.country || "",
        type: selectedCustomer.type || "retail",
        credit_limit: Number(selectedCustomer.credit_limit) || 0,
        balance: Number(selectedCustomer.balance) || 0,
        status: selectedCustomer.status ?? true,
        store_id: selectedCustomer.store_id || store_id,
      });
    }
  }, [selectedCustomer, show, store_id]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = "Customer code is required";
    }
    if (!formData.name?.trim()) {
      newErrors.name = "Customer name is required";
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city?.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.country?.trim()) {
      newErrors.country = "Country is required";
    }
    if ((formData.credit_limit || 0) < 0) {
      newErrors.credit_limit = "Credit limit cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!selectedCustomer?.id) {
      return;
    }

    setLoading(true);

    await dispatch(
      updateCustomer(
        { id: selectedCustomer.id, data: formData },
        {
          onSuccess: () => {
            // Close modal on success
            setShow(false);
            // Reset form
            setFormData({
              code: "",
              name: "",
              phone: "",
              email: "",
              address: "",
              city: "",
              country: "",
              type: "retail",
              credit_limit: 0,
              balance: 0,
              status: true,
              store_id: store_id,
            });
            setErrors({});
          },
        },
      ),
    );

    setLoading(false);
  };

  const handleClose = () => {
    setShow(false);
    setErrors({});
    // Reset form
    setFormData({
      code: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      country: "",
      type: "retail",
      credit_limit: 0,
      balance: 0,
      status: true,
      store_id: store_id,
    });
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Customer</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row>
            {/* Basic Information */}
            <Col md={12}>
              <h6 className="mb-3 text-primary">Basic Information</h6>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Customer Code <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., CUST-001"
                  isInvalid={!!errors.code}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.code}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Customer Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  isInvalid={!!errors.name}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Phone <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., 03001234567"
                  isInvalid={!!errors.phone}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                  isInvalid={!!errors.email}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Address Information */}
            <Col md={12}>
              <h6 className="mb-3 mt-2 text-primary">Address Information</h6>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter street address"
                  isInvalid={!!errors.address}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  City <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  isInvalid={!!errors.city}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.city}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Country <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                  isInvalid={!!errors.country}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.country}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Financial Information */}
            <Col md={12}>
              <h6 className="mb-3 mt-2 text-primary">Financial Information</h6>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Customer Type <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {customerTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Credit Limit</Form.Label>
                <Form.Control
                  type="number"
                  name="credit_limit"
                  value={formData.credit_limit}
                  onChange={handleChange}
                  placeholder="0.00"
                  isInvalid={!!errors.credit_limit}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.credit_limit}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Balance</Form.Label>
                <Form.Control
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleChange}
                  placeholder="0.00"
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Current outstanding balance
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="status"
                  label="Active Customer"
                  checked={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Inactive customers cannot make purchases
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Customer"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditCustomerModal;

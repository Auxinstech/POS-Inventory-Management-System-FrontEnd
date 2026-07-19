import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { setToast } from "../../Redux/Ducks/toastSlice"; // adjust path if needed
import { loginUser } from "../../Redux/Ducks/userSlice";
import { fetchPermissionList } from "../../Redux/Ducks/rpSlice";

interface IModel {
  email: string;
}

export default function Login() {
  const [model, setModel] = useState<IModel>({ email: "" });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedEmail = localStorage.getItem("loginEmail");
    if (savedEmail) {
      setModel({ email: savedEmail });
    }
  }, []);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const onChange = (fieldId: string, value: any) => {
    setModel({ ...model, [fieldId]: value });
  };

  const signIn = () => {
    if (!validateEmail(model.email)) {
      dispatch(
        setToast({
          message: "Invalid email format. Please enter a valid email address.",
          type: "error",
        })
      );
      return;
    }

    localStorage.setItem("loginEmail", model.email);
    dispatch(loginUser(model));
  };

  return (
    <Container fluid className="login-page-bg">
      <div className="login-card">
        <div className="login-panel-left">
          <div className="brand-mark">
            <img
              src={require("../../Assets/Images/pos-logo.png")}
              alt="POS Sales Management System"
            />
            <span>POS Sales</span>
          </div>
          <div className="login-text">
            <h6>Welcome Back</h6>
            <span>Enter your email to receive a code in your inbox</span>
          </div>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              signIn();
            }}
            className="w-100"
          >
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter Email"
                value={model.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={signIn}>
              Next
            </Button>
          </Form>
          <div className="footer">© 2026 POS Sales Management System. All rights reserved.</div>
        </div>
        <div className="login-panel-right">
          <img
            src={require("../../Assets/Images/login-wood-panel.jpg")}
            alt=""
          />
        </div>
      </div>
    </Container>
  );
}

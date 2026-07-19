import { useAppDispatch } from "Hook/hooks";
import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { loginUser, verifyUser } from "../../Redux/Ducks/userSlice";
import { useSearchParams } from "react-router-dom";
import { setToast } from "../../Redux/Ducks/toastSlice";

interface IModel {
  email: string;
  otp: string;
}

export default function Verify() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [model, setModel] = useState<IModel>({ email: "", otp: "" });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let email = searchParams.get("email");
    if (email) {
      onChange("email", email);
    } else {
      navigate("login");
    }
  }, []);

  const handleVerify = () => {
    dispatch(verifyUser(model));
  };

  const onChange = (fieldId: string, value: any) => {
    setModel({ ...model, [fieldId]: value });
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const signIn = () => {
    const savedEmail = localStorage.getItem("loginEmail");
    if (!savedEmail || !validateEmail(model.email)) {
      dispatch(
        setToast({
          message: "Invalid email format. Please enter a valid email address.",
          type: "error",
        })
      );
      return;
    }

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
            <h6>Verify</h6>
            <span>Enter the code sent to your inbox</span>
          </div>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="w-100"
          >
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter OTP"
                value={model.otp}
                onChange={(e) => onChange("otp", e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleVerify}>
              Verify
            </Button>
            <Button variant="info" onClick={signIn} className="mt-2">
              Reset OTP
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

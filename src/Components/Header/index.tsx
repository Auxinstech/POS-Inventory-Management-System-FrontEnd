import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import StoreSelector from "./StoreSelector";
import ProfileCircle from "Components/Profile";
import ReloadSite from "Components/Refresh";
import TestMqttButton from "./TestMqttButton";

const Header = () => {
  return (
    <Navbar className="header" expand="lg" bg="white">
      <Container fluid>
        <Navbar.Brand className="d-flex align-items-center gap-3">
          {/* <img
            alt=""
            src={require("../../Assets/Images/FoodLift-Red.png")}
            height="50px"
            width="58px"
            className="d-inline-block align-top rounded"
          />{" "} */}
          <img
            alt=""
            src={require("../../Assets/Images/foodslift.png")}
            height="50px"
            width="90px"
            className="d-inline-block align-top rounded"
          />{" "}
        </Navbar.Brand>

        <div className="d-flex align-items-center justify-content-end gap-2">
          <TestMqttButton />
          <ReloadSite />
          <StoreSelector />
          <ProfileCircle />
        </div>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
      </Container>
    </Navbar>
  );
};

export default Header;

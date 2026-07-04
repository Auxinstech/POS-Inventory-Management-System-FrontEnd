import { useEffect, useMemo } from "react";
// import ReactHintFactory from "react-hint";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "../../Hook/hooks";
import { Container } from "react-bootstrap";
import Header from "../../Components/Header";
import Aside from "../../Components/Aside";
import Loader from "Components/Loader";
import AutoBeepPlayer from "Components/BeepSound";
import { useUserPermissions } from "Hook/permissions";
import PusherClient from "services/pusher";
import SocketConnect from "services/socket-connect";
import MqttConnect from "services/mqtt";

const AuthorizeLayout = ({ sideBarState, ...props }: any) => {
  const userPermissions = useUserPermissions();

  return (
    <Container fluid className="authLayout">
      <Header />
      <Aside />
      <Loader />
      {/* <SocketConnect /> */}
      {/* <PusherClient /> */}
      <MqttConnect />
      <AutoBeepPlayer />
      <div className="content">{props.children}</div>
    </Container>
  );
};

export default AuthorizeLayout;

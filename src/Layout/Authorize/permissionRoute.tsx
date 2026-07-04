import { Navigate } from "react-router-dom";
import AuthorizeLayout from "../Authorize/index";
import { useUserPermissions } from "../../Hook/permissions";

interface Props {
  permission: string;
  element: React.ReactNode;
}

const PermissionRoute = ({ permission, element }: Props) => {
  const userPermissions = useUserPermissions();

  const hasAccess = userPermissions.some((p) => p.name === permission);

  return hasAccess ? (
    <AuthorizeLayout>{element}</AuthorizeLayout>
  ) : (
    <Navigate to="/" />
  );
};

export default PermissionRoute;

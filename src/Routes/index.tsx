import { Navigate, Route, Routes } from "react-router-dom";
import AuthorizeLayout from "../Layout/Authorize";
import Home from "../Pages/Home";
import Login from "../Pages/Login";
import Verify from "../Pages/Verify";
import Orders from "../Pages/Orders";
import Menu from "../Pages/Menu";
import Setting from "../Pages/Setting";
import AddCategory from "../Pages/AddCategory";
import { PrivateRoute } from "./PrivateRoute";
import AddSubCategory from "../Pages/AddSubCategory";
import AddItem from "../Pages/AddItem";
import EditModifierGroup from "Pages/EditModifierGroup";
import Manage from "../Pages/Manage";
import EditItem from "Pages/EditItem";
import EditCategory from "Pages/EditCategory";
import EditSubCategory from "Pages/EditSubCategory";
import Reports from "Pages/Reports";
import PermissionRoute from "Layout/Authorize/permissionRoute";
import OrdersReport from "Pages/Reports/Orders-Report";
import Invoice from "Pages/Invoice";
import Inventory from "Pages/Inventory";
import Customers from "Pages/Customers";
import Vendors from "Pages/Vendors";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<Verify />} />

      {/* Private Routes */}
      <Route path="/" element={<PrivateRoute />}>
        <Route
          path=""
          element={
            <AuthorizeLayout>
              <Home />
            </AuthorizeLayout>
          }
        />
        <Route
          path="orders"
          element={
            // <PermissionRoute permission="manage-orders" element={<Orders />} />
            <AuthorizeLayout>
              <Orders />
            </AuthorizeLayout>
          }
        />
        <Route
          path="menu"
          element={
            <PermissionRoute permission="manage-menus" element={<Menu />} />

            // <AuthorizeLayout>
            //   <Menu />
            // </AuthorizeLayout>
          }
        />
        <Route
          path="settings"
          element={
            <PermissionRoute
              permission="manage-settings"
              element={<Setting />}
            />

            // <AuthorizeLayout>
            //   <Setting />
            // </AuthorizeLayout>
          }
        />
        <Route
          path="add-category"
          element={
            <AuthorizeLayout>
              <AddCategory />
            </AuthorizeLayout>
          }
        />
        <Route
          path="edit-category/:id"
          element={
            <AuthorizeLayout>
              <EditCategory />
            </AuthorizeLayout>
          }
        />
        <Route
          path="add-sub-category/:id"
          element={
            <AuthorizeLayout>
              <AddSubCategory />
            </AuthorizeLayout>
          }
        />
        <Route
          path="edit-sub-category/:id"
          element={
            <AuthorizeLayout>
              <EditSubCategory />
            </AuthorizeLayout>
          }
        />
        <Route
          path="add-item/:id"
          element={
            <AuthorizeLayout>
              <AddItem />
            </AuthorizeLayout>
          }
        />
        <Route
          path="edit-modifier-group/:id"
          element={
            <AuthorizeLayout>
              <EditModifierGroup />
            </AuthorizeLayout>
          }
        />
        <Route
          path="edit-item/:id"
          element={
            <AuthorizeLayout>
              <EditItem />
            </AuthorizeLayout>
          }
        />
        <Route
          path="manage"
          element={
            // <PermissionRoute permission="manage-manage" element={<Manage />} />
            <AuthorizeLayout>
              <Manage />
            </AuthorizeLayout>
          }
        />

        <Route
          path="invoice-and-payment"
          element={
            // <PermissionRoute permission="manage-manage" element={<Manage />} />
            <AuthorizeLayout>
              <Invoice />
            </AuthorizeLayout>
          }
        />
        <Route
          path="inventory"
          element={
            // <PermissionRoute permission="manage-manage" element={<Manage />} />
            <AuthorizeLayout>
              <Inventory />
            </AuthorizeLayout>
          }
        />

        <Route
          path="customers"
          element={
            <PermissionRoute
              permission="manage-customers"
              element={<Customers />}
            />
          }
        />

        <Route
          path="vendors"
          element={
            <PermissionRoute
              permission="manage-vendors"
              element={<Vendors />}
            />
          }
        />
        <Route
          path="reports"
          element={
            <PermissionRoute
              permission="manage-reports"
              element={<Reports />}
            />

            // <AuthorizeLayout>
            //   <Reports />
            // </AuthorizeLayout>
          }
        />

        <Route
          path="reports/orders"
          element={
            <PermissionRoute
              permission="manage-reports"
              element={<OrdersReport />}
            />
          }
        />
      </Route>

      {/* Optional fallback */}
      {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
    </Routes>
  );
};

export default AppRoutes;

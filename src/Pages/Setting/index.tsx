import React, { act, useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { getStoreSettings } from "../../Redux/Ducks/settingSlice";
import Store from "./Store";
import DeliveryConfiguration from "./DeliveryConfiguration";
import User from "./User";
import { SubMenu } from "Utils/Menu";
import RolesAndPermissions from "./RolesAndPermissions";
import { useUserPermissions } from "Hook/permissions";

const Setting = () => {
  const dispatch = useAppDispatch();
  const [activeSetting, setActiveSetting] = useState<string>("");

  const user_permissions = useUserPermissions();
  const hasPermission = (permissionName: string) =>
    user_permissions.some((perm) => perm.name === permissionName);

  return (
    <div className="setting">
      <div className="setting-menu">
        {/* {SubMenu.SETTINGS.map((x) => {
          return (
            <div
              className={classNames([
                "setting-menu-item",
                { active: activeSetting == x.value },
              ])}
              onClick={() => setActiveSetting(x.value)}
            >
              {x.label}
            </div>
          );
        })} */}
        {hasPermission("settings-delivery-configuration") && (
          <div
            className={classNames([
              "setting-menu-item",
              { active: activeSetting == "deliveryConfiguration" },
            ])}
            onClick={() => setActiveSetting("deliveryConfiguration")}
          >
            Delivery Configuration
          </div>
        )}

        {hasPermission("settings-store") && (
          <div
            className={classNames([
              "setting-menu-item",
              { active: activeSetting == "store" },
            ])}
            onClick={() => setActiveSetting("store")}
          >
            Store
          </div>
        )}

        {hasPermission("settings-user") && (
          <div
            className={classNames([
              "setting-menu-item",
              { active: activeSetting == "user" },
            ])}
            onClick={() => setActiveSetting("user")}
          >
            User
          </div>
        )}
        {hasPermission("settings-roles-and-permissions") && (
          <div
            className={classNames([
              "setting-menu-item",
              { active: activeSetting == "rolesAndPermissions" },
            ])}
            onClick={() => setActiveSetting("rolesAndPermissions")}
          >
            Roles and Permissions
          </div>
        )}
      </div>

      {activeSetting === "user" ? (
        <User />
      ) : activeSetting === "rolesAndPermissions" ? (
        <RolesAndPermissions />
      ) : activeSetting === "deliveryConfiguration" ? (
        <DeliveryConfiguration />
      ) : activeSetting === "store" ? (
        <Store />
      ) : null}
    </div>
  );
};

export default Setting;

import classNames from "classnames";
import { useAppDispatch } from "Hook/hooks";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  clearActiveOrder,
  clearActiveOrderRefund,
  clearActiveOrderReports,
} from "../../Redux/Ducks/orderSlice";

const ManageMenu = ({
  activeMenu,
  setActiveMenu,
}: {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}) => {
  const dispatch = useAppDispatch();
  const resetAllActiveOrders = () => {
    dispatch(clearActiveOrder());
    dispatch(clearActiveOrderRefund());
    dispatch(clearActiveOrderReports());
  };
  return (
    <div className="manage-menu">
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "sales-summary" },
        ])}
        onClick={() => {
          setActiveMenu("sales-summary");
        }}
      >
        Sales Summary
      </div>

      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "orders-summary" },
        ])}
        onClick={() => {
          setActiveMenu("orders-summary");
          resetAllActiveOrders();
        }}
      >
        Order Summary
      </div>

      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "driver-summary" },
        ])}
        onClick={() => {
          setActiveMenu("driver-summary");
          resetAllActiveOrders();
        }}
      >
        Driver Summary
      </div>

      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "orders-report" },
        ])}
        onClick={() => {
          setActiveMenu("orders-report");
          resetAllActiveOrders();
        }}
      >
        Daily Orders Detail
      </div>
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "inventory-report" },
        ])}
        onClick={() => {
          setActiveMenu("inventory-report");
          resetAllActiveOrders();
        }}
      >
        Inventory Report
      </div>
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "detailed-report" },
        ])}
        onClick={() => {
          setActiveMenu("detailed-report");
          resetAllActiveOrders();
        }}
      >
        Detailed Report
      </div>
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "stripe-report" },
        ])}
        onClick={() => {
          setActiveMenu("stripe-report");
        }}
      >
        Stripe Report
      </div>
    </div>
  );
};

export default ManageMenu;

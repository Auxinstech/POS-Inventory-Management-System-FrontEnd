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
          { active: activeMenu === "invoice-summary" },
        ])}
        onClick={() => {
          setActiveMenu("invoice-summary");
          resetAllActiveOrders();
        }}
      >
        Invoice Report
      </div>
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "generate-invoice" },
        ])}
        onClick={() => {
          setActiveMenu("generate-invoice");
          resetAllActiveOrders();
        }}
      >
        Generate Invoice
      </div>
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "refund" },
        ])}
        onClick={() => {
          setActiveMenu("refund");
          resetAllActiveOrders();
        }}
      >
        Refund
      </div>
    </div>
  );
};

export default ManageMenu;

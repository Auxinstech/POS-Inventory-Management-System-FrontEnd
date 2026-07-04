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
          { active: activeMenu === "inventory" },
        ])}
        onClick={() => {
          setActiveMenu("inventory");
          resetAllActiveOrders();
        }}
      >
        Item Adjustment
      </div>
    </div>
  );
};

export default ManageMenu;

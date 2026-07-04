import React, { useState } from "react";
import ManageMenu from "./ManageMenu";
import ManageCategory from "./ManageCategory";
import ManageItems from "./ManageItems";
import ManageModifierGroups from "./ManageModifierGroups";
import ManageModifiers from "./ManageModifiers";
import Discounts from "./Discounts";

const Manage = () => {
  const [activeMenu, setActiveMenu] = useState<string>("categories");

  return (
    <div className="d-flex">
      <ManageMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="manage-wrapper">
        {activeMenu === "categories" ? (
          <ManageCategory />
        ) : activeMenu === "items" ? (
          <ManageItems />
        ) : activeMenu === "modifierGroups" ? (
          <ManageModifierGroups />
        ) : activeMenu === "modifiers" ? (
          <ManageModifiers />
        ) : activeMenu === "discounts" ? (
          <Discounts />
        ) : null}
      </div>
    </div>
  );
};

export default Manage;

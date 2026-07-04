import classNames from "classnames";
import React, { useState } from "react";
import { SubMenu } from "Utils/Menu";

const ManageMenu = ({
  activeMenu,
  setActiveMenu,
}: {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}) => {
  return (
    <div className="manage-menu">
      {SubMenu.MANAGE.map((x) => {
        return (
          <div
            className={classNames([
              "manage-menu-item",
              { active: activeMenu == x.value },
            ])}
            onClick={() => setActiveMenu(x.value)}
          >
            {x.label}
          </div>
        );
      })}
      {/* <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "categories" },
        ])}
        onClick={() => setActiveMenu("categories")}
      >
        Categories
      </div>
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "items" },
        ])}
        onClick={() => setActiveMenu("items")}
      >
        Items
      </div>
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "modifierGroups" },
        ])}
        onClick={() => setActiveMenu("modifierGroups")}
      >
        Modifier Groups
      </div>
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "modifiers" },
        ])}
        onClick={() => setActiveMenu("modifiers")}
      >
        Modifiers
      </div>
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "itemsOutOfStock" },
        ])}
      >
        Items Out of Stock
      </div>
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "sectionPrinters" },
        ])}
      >
        Section Printers
      </div> */}
    </div>
  );
};

export default ManageMenu;

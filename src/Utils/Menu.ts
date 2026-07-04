export const Menu = {
  ORDERS: "Orders",
  MENU: "Menu",
  REPORTS: "Reports",
  MANAGE: "Manage",
  SETTINGS: "Settings",
};

export const SubMenu = {
  ORDERS: [],
  MENU: [],
  REPORTS: [],
  MANAGE: [
    {
      label: "Categories",
      value: "categories",
    },
    {
      label: "Items",
      value: "items",
    },
    {
      label: "Modifier Groups",
      value: "modifierGroups",
    },
    {
      label: "Modifiers",
      value: "modifiers",
    },
    {
      label: "Items Out Of Stock",
      value: "itemsOutOfStock",
    },
    {
      label: "Section Printers",
      value: "sectionPrinters",
    },
    {
      label: "Discounts",
      value: "discounts",
    },
  ],
  SETTINGS: [
    {
      label: "Delivery Configuration",
      value: "deliveryConfiguration",
    },
    {
      label: "Store",
      value: "store",
    },
    {
      label: "User",
      value: "user",
    },
    {
      label: "Roles And Permissions",
      value: "rolesAndPermissions",
    },
  ],
};

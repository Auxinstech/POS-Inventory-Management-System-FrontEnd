import classNames from "classnames";

const ManageMenu = ({
  activeMenu,
  setActiveMenu,
}: {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}) => {
  return (
    <div className="manage-menu">
      <div
        className={classNames([
          "manage-menu-item",
          { active: activeMenu === "vendor-master" },
        ])}
        onClick={() => {
          setActiveMenu("vendor-master");
        }}
      >
        Vendor Master
      </div>
    </div>
  );
};

export default ManageMenu;

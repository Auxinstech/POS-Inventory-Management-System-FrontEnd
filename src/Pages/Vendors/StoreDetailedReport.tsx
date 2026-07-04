import React, { useEffect, useState } from "react";
import ManageMenu from "./ManageMenu";
import { useAppSelector } from "Hook/hooks";
import VendorMaster from "./VendorMaster";

function StoreDetailedReport() {
  const [activeMenu, setActiveMenu] = useState<string>("vendor-master");
  const active_store = useAppSelector((state) => state.Home.selected_store);

  return (
    <div className="d-flex">
      <ManageMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="manage-wrapper flex-grow-1">
        {activeMenu === "vendor-master" ? (
          <VendorMaster store_id={active_store || 0} />
        ) : null}
      </div>
    </div>
  );
}

export default StoreDetailedReport;

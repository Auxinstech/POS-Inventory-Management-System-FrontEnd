import { useAppDispatch, useAppSelector } from "Hook/hooks";
import StoreDetailedReportGrid from "Components/StoreDetailedReportGrid";

export default function DetailedReport({
  store_id,
  setActiveMenu,
}: {
  store_id: number;
  setActiveMenu: (menu: string) => void;
}) {
  const dispatch = useAppDispatch();

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="p-2">
          <StoreDetailedReportGrid
            store_id={store_id}
            setActiveMenu={setActiveMenu}
          />
        </div>
      </div>
    </div>
  );
}

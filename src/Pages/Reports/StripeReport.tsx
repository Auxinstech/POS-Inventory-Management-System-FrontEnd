import StoreStripeReportGrid from "Components/StoreStripeReportGrid";

export default function StripeReport({
  store_id,
  setActiveMenu,
}: {
  store_id: number;
  setActiveMenu: (menu: string) => void;
}) {
  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="p-2">
          <StoreStripeReportGrid
            store_id={store_id}
            setActiveMenu={setActiveMenu}
          />
        </div>
      </div>
    </div>
  );
}

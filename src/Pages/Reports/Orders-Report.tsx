import StoreOrderReportGrid from "Components/StoreOrdersReport";

export default function OrdersReport() {
  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="p-2">
          <StoreOrderReportGrid />
        </div>
      </div>
    </div>
  );
}

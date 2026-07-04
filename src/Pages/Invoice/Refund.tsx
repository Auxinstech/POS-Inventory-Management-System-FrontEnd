import InvoiceRefundGrid from "Components/InvoiceRefundGrid";

export default function Refund({ store_id }: { store_id: number }) {
  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="p-2">
          <InvoiceRefundGrid />
        </div>
      </div>
    </div>
  );
}

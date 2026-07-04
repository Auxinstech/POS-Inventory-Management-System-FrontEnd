import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ReportEntry } from "../../Redux/Ducks/reportSlice";

interface ReportsGridProps {
  items: ReportEntry[];
}

const ReportsGrid: React.FC<ReportsGridProps> = ({ items }) => {
  const navigate = useNavigate();

  const handleRowClick = (id: number) => {
    navigate(`/reports/?store_id=${id}`);
  };

  const calculateTotal = (items: ReportEntry[]) =>
    items.reduce((sum, x) => sum + Number(x.total || 0), 0);

  const calculateOrders = (items: ReportEntry[]) => {
    let orders_count = 0;
    items.forEach((item) => {
      orders_count += parseFloat(Number(item.orders_count).toFixed(2));
    });
    return orders_count;
  };

  const calculateServiceCharges = (items: ReportEntry[]) => {
    let service_charges = 0;
    items.forEach((item) => {
      service_charges += parseFloat(Number(item.service_charges).toFixed(2));
    });
    return service_charges;
  };

  return (
    <div className="container-fluid p-0">
      <Row className="data-grid-header fw-bold border-bottom p-2 py-3">
        <Col xs={3}>Store</Col>
        <Col xs={3}>Orders</Col>
        <Col xs={3}>Service Charges</Col>
        <Col xs={3}>Total Amount</Col>
      </Row>

      {items.map((item) => (
        <Row
          key={item.store_id}
          onClick={() => handleRowClick(item.store_id)}
          className="data-grid-row py-2 border-bottom align-items-center hover-bg"
          style={{ cursor: "pointer" }}
        >
          <Col xs={3}>{item.store.name.toUpperCase()}</Col>
          <Col xs={3}>{item.orders_count}</Col>
          <Col xs={3}>{item.service_charges}</Col>
          <Col xs={3}>{item.total}</Col>
        </Row>
      ))}
      <Row
        className="data-grid-header fw-bold border-bottom p-2 py-3"
        style={{
          backgroundColor: "#f1f1f1",
        }}
      >
        <Col xs={3}>Summary</Col>
        <Col xs={3}>{calculateOrders(items) || 0}</Col>
        <Col xs={3}>{calculateServiceCharges(items)?.toFixed(2) || "0.00"}</Col>

        <Col xs={3}>{calculateTotal(items)?.toFixed(2) || "0.00"}</Col>
      </Row>
    </div>
  );
};

export default ReportsGrid;

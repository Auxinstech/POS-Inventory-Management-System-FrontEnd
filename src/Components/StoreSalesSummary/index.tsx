import * as React from "react";
import Box from "@mui/material/Box";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import {
  getOrdersByID,
  Order,
  setActiveOrderReports,
} from "../../Redux/Ducks/orderSlice";
import { useState, useMemo } from "react";
import { Form, FormGroup } from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FeatherIcon from "feather-icons-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const COLORS = ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fee2e2"];

interface OrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  amount: string;
}

interface OrderData {
  id: number;
  order_type: string;
  payment_method: string;
  total: string;
  amount: string;
  service_charges: string;
  delivery_charges: string;
  created_at: string;
  source?: string;
  items?: OrderItem[];
  phone_number?: string;
  email?: string;
}

interface SourceData {
  name: string;
  count: number;
  revenue: number;
  percentage: string;
}

interface PaymentData {
  name: string;
  count: number;
  amount: number;
  percentage: string;
}

interface OrderTypeData {
  name: string;
  count: number;
  revenue: number;
  averageValue: string;
}

interface DailySalesData {
  date: string;
  sales: number;
  orders: number;
  avgOrder: number;
}

interface StatsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  serviceCharges: number;
  deliveryCharges: number;
  totalDiscount: number;
  peakHour: string;
  peakOrders: number;
  repeatRate: number;
  repeatCustomers: number;
  uniqueCustomers: number;
}

interface OrderTypeStats {
  delivery: { count: number; revenue: number };
  pickup: { count: number; revenue: number };
  instore: { count: number; revenue: number };
}

export default function AnalyticsDashboard({
  store_id,
  orders,
  setActiveMenu,
}: {
  store_id: number;
  orders: OrderData[];
  setActiveMenu: (menu: string) => void;
}) {
  const dispatch = useAppDispatch();
  const users = useAppSelector((x) => x.Users.users);
  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [activeView, setActiveView] = useState<
    "overview" | "sources" | "payments" | "orders" | "trends"
  >("overview");

  const processedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      source: order.source || (order.order_type === "pos" ? "POS" : "Website"),
      date: order.created_at?.split("T")[0],
      amount: parseFloat(order.total || "0"),
      serviceCharges: parseFloat(order.service_charges || "0"),
      deliveryCharges: parseFloat(order.delivery_charges || "0"),
      discount:
        parseFloat(order.amount || "0") - parseFloat(order.total || "0"),
      orderType: order.order_type?.toLowerCase() || "instore",
    }));
  }, [orders]);

  const sourceData: SourceData[] = useMemo(() => {
    const sources: { [key: string]: { count: number; revenue: number } } = {};

    processedOrders.forEach((order) => {
      const source = order.source || "Unknown";
      if (!sources[source]) {
        sources[source] = { count: 0, revenue: 0 };
      }
      sources[source].count++;
      sources[source].revenue += order.amount;
    });

    return Object.entries(sources).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
      percentage: ((data.count / processedOrders.length) * 100).toFixed(1),
    }));
  }, [processedOrders]);

  const paymentData: PaymentData[] = useMemo(() => {
    const payments: { [key: string]: { count: number; amount: number } } = {};

    processedOrders.forEach((order) => {
      const method = order.payment_method || "Unknown";
      if (!payments[method]) {
        payments[method] = { count: 0, amount: 0 };
      }
      payments[method].count++;
      payments[method].amount += order.amount;
    });

    return Object.entries(payments).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: data.count,
      amount: data.amount,
      percentage: ((data.count / processedOrders.length) * 100).toFixed(1),
    }));
  }, [processedOrders]);

  const orderTypeData: OrderTypeData[] = useMemo(() => {
    const types: { [key: string]: { count: number; revenue: number } } = {};

    processedOrders.forEach((order) => {
      let type = order.orderType;
      if (type === "delivery") type = "Delivery";
      else if (type === "pickup") type = "Pickup";
      else type = "In-store";

      if (!types[type]) {
        types[type] = { count: 0, revenue: 0 };
      }
      types[type].count++;
      types[type].revenue += order.amount;
    });

    return Object.entries(types).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
      averageValue: (data.revenue / data.count).toFixed(2),
    }));
  }, [processedOrders]);

  const orderTypeStats: OrderTypeStats = useMemo(() => {
    const stats = {
      delivery: { count: 0, revenue: 0 },
      pickup: { count: 0, revenue: 0 },
      instore: { count: 0, revenue: 0 },
    };

    processedOrders.forEach((order) => {
      const type = order.orderType;
      if (type === "delivery") {
        stats.delivery.count++;
        stats.delivery.revenue += order.amount;
      } else if (type === "pickup") {
        stats.pickup.count++;
        stats.pickup.revenue += order.amount;
      } else {
        stats.instore.count++;
        stats.instore.revenue += order.amount;
      }
    });

    return stats;
  }, [processedOrders]);

  const dailySalesData: DailySalesData[] = useMemo(() => {
    const daily: {
      [key: string]: {
        date: string;
        sales: number;
        orders: number;
        avgOrder: number;
      };
    } = {};

    processedOrders.forEach((order) => {
      const date = order.date;
      if (!daily[date]) {
        daily[date] = { date, sales: 0, orders: 0, avgOrder: 0 };
      }
      daily[date].sales += order.amount;
      daily[date].orders++;
    });

    Object.keys(daily).forEach((date) => {
      daily[date].avgOrder = daily[date].sales / daily[date].orders;
    });

    return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));
  }, [processedOrders]);

  const additionalStats: StatsData = useMemo(() => {
    const totalRevenue = processedOrders.reduce(
      (sum, order) => sum + order.amount,
      0,
    );
    const totalOrders = processedOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const serviceCharges = processedOrders.reduce(
      (sum, order) => sum + order.serviceCharges,
      0,
    );
    const deliveryCharges = processedOrders.reduce(
      (sum, order) => sum + order.deliveryCharges,
      0,
    );
    const totalDiscount = processedOrders.reduce(
      (sum, order) => sum + order.discount,
      0,
    );

    const hourDistribution: { [key: number]: number } = {};
    processedOrders.forEach((order) => {
      if (order.created_at) {
        const hour = new Date(order.created_at).getHours();
        hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
      }
    });

    const peakHourEntry = Object.entries(hourDistribution).sort(
      (a, b) => b[1] - a[1],
    )[0];

    const customerFrequency: { [key: string]: number } = {};
    processedOrders.forEach((order) => {
      const customerId = order.phone_number || order.email;
      if (customerId) {
        customerFrequency[customerId] =
          (customerFrequency[customerId] || 0) + 1;
      }
    });

    const repeatCustomers = Object.values(customerFrequency).filter(
      (count) => count > 1,
    ).length;
    const repeatRate =
      totalOrders > 0 ? (repeatCustomers / totalOrders) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      serviceCharges,
      deliveryCharges,
      totalDiscount,
      peakHour: peakHourEntry ? `${peakHourEntry[0]}:00` : "N/A",
      peakOrders: peakHourEntry ? peakHourEntry[1] : 0,
      repeatRate,
      repeatCustomers,
      uniqueCustomers: Object.keys(customerFrequency).length,
    };
  }, [processedOrders]);
  console.log("additionalStats", additionalStats);

  const hourlyData = useMemo(() => {
    const hours: { [key: number]: number } = {};
    for (let i = 0; i < 24; i++) hours[i] = 0;

    processedOrders.forEach((order) => {
      if (order.created_at) {
        const hour = new Date(order.created_at).getHours();
        hours[hour]++;
      }
    });

    return Object.entries(hours).map(([hour, count]) => ({
      hour: `${hour}:00`,
      orders: count,
    }));
  }, [processedOrders]);

  const handleSubmit = () => {
    dispatch(
      getOrdersByID({
        store_id: store_id,
        from_date: fromDate,
        to_date: toDate,
      }),
    );
  };

  const handleExport = () => {
    let dataToExport = orders;

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "report");

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 10 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 40 },
      { wch: 20 },
      { wch: 20 },
    ];

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `orders_${fromDate}_to_${toDate}.xlsx`);
  };

  const StatCard = ({ title, value, subtitle, gradient }: any) => (
    <div className="col-lg-3 col-md-6 mb-3">
      <div
        className="card h-100 border-0 shadow-sm"
        style={{
          background: gradient,
          color: "white",
          transition: "transform 0.2s ease-in-out",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div className="card-body">
          <h6 className="card-title mb-2 opacity-75">{title}</h6>
          <h3 className="mb-2">{value}</h3>
          <small className="opacity-75">{subtitle}</small>
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children }: any) => (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3">{title}</h5>
        <div style={{ width: "100%", height: 350 }}>{children}</div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid px-2 py-3">
      {/* Filter Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <FormGroup>
                <Form.Label className="mb-1">From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </FormGroup>
            </div>
            <div className="col-md-3">
              <FormGroup>
                <Form.Label className="mb-1">To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </FormGroup>
            </div>
            <div className="col-md-3">
              <button
                className="btn w-100"
                onClick={handleSubmit}
                style={{
                  background:
                    "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  color: "white",
                  border: "none",
                }}
              >
                <FeatherIcon icon="filter" size={18} className="me-2" />
                Apply Filter
              </button>
            </div>
            <div className="col-md-3">
              <button
                className="btn w-100"
                onClick={handleExport}
                style={{
                  background:
                    "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  color: "white",
                  border: "none",
                }}
              >
                <FeatherIcon icon="download" size={18} className="me-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="row mb-4">
        <StatCard
          title="Total Revenue"
          value={`$${additionalStats.totalRevenue.toFixed(2)}`}
          subtitle={`From ${additionalStats.totalOrders} orders`}
          gradient="linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"
        />
        <StatCard
          title="Average Order Value"
          value={`$${additionalStats.averageOrderValue.toFixed(2)}`}
          subtitle="Per transaction"
          gradient="linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
        />
        <StatCard
          title="Repeat Customer Rate"
          value={`${additionalStats.repeatRate.toFixed(1)}%`}
          subtitle={`${additionalStats.repeatCustomers} repeat customers`}
          gradient="linear-gradient(135deg, #f87171 0%, #dc2626 100%)"
        />
        <StatCard
          title="Peak Hour"
          value={additionalStats.peakHour}
          subtitle={`${additionalStats.peakOrders} orders`}
          gradient="linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)"
        />
      </div>

      {/* Order Type Stats Cards Row */}
      <div className="row mb-4">
        <StatCard
          title="🚚 Delivery Orders"
          value={orderTypeStats.delivery.count}
          subtitle={`Revenue: $${orderTypeStats.delivery.revenue.toFixed(2)}`}
          gradient="linear-gradient(135deg, #dc2626 0%, #9b2c2c 100%)"
        />
        <StatCard
          title="📦 Pickup Orders"
          value={orderTypeStats.pickup.count}
          subtitle={`Revenue: $${orderTypeStats.pickup.revenue.toFixed(2)}`}
          gradient="linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
        />
        <StatCard
          title="🏪 In-Store Orders"
          value={orderTypeStats.instore.count}
          subtitle={`Revenue: $${orderTypeStats.instore.revenue.toFixed(2)}`}
          gradient="linear-gradient(135deg, #f87171 0%, #dc2626 100%)"
        />
        <StatCard
          title="📊 Total Orders"
          value={additionalStats.totalOrders}
          subtitle={`Avg Value: $${additionalStats.averageOrderValue.toFixed(2)}`}
          gradient="linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)"
        />
      </div>

      {/* Navigation Tabs - Red Theme */}
      <div className="mb-4">
        <ul
          className="nav nav-tabs"
          style={{ borderBottom: "2px solid #fecaca" }}
        >
          <li className="nav-item">
            <button
              className={`nav-link ${activeView === "overview" ? "active" : ""}`}
              onClick={() => setActiveView("overview")}
              style={{
                cursor: "pointer",
                color: activeView === "overview" ? "#dc2626" : "#6b7280",
                border: "none",
                backgroundColor: "transparent",
                fontWeight: activeView === "overview" ? "600" : "400",
                borderBottom:
                  activeView === "overview"
                    ? "3px solid #dc2626"
                    : "3px solid transparent",
                marginRight: "20px",
                padding: "10px 0",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (activeView !== "overview") {
                  e.currentTarget.style.color = "#dc2626";
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== "overview") {
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
            >
              <FeatherIcon icon="bar-chart-2" size={16} className="me-1" />
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeView === "sources" ? "active" : ""}`}
              onClick={() => setActiveView("sources")}
              style={{
                cursor: "pointer",
                color: activeView === "sources" ? "#dc2626" : "#6b7280",
                border: "none",
                backgroundColor: "transparent",
                fontWeight: activeView === "sources" ? "600" : "400",
                borderBottom:
                  activeView === "sources"
                    ? "3px solid #dc2626"
                    : "3px solid transparent",
                marginRight: "20px",
                padding: "10px 0",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (activeView !== "sources") {
                  e.currentTarget.style.color = "#dc2626";
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== "sources") {
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
            >
              <FeatherIcon icon="globe" size={16} className="me-1" />
              Sources
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeView === "payments" ? "active" : ""}`}
              onClick={() => setActiveView("payments")}
              style={{
                cursor: "pointer",
                color: activeView === "payments" ? "#dc2626" : "#6b7280",
                border: "none",
                backgroundColor: "transparent",
                fontWeight: activeView === "payments" ? "600" : "400",
                borderBottom:
                  activeView === "payments"
                    ? "3px solid #dc2626"
                    : "3px solid transparent",
                marginRight: "20px",
                padding: "10px 0",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (activeView !== "payments") {
                  e.currentTarget.style.color = "#dc2626";
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== "payments") {
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
            >
              <FeatherIcon icon="credit-card" size={16} className="me-1" />
              Payments
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeView === "orders" ? "active" : ""}`}
              onClick={() => setActiveView("orders")}
              style={{
                cursor: "pointer",
                color: activeView === "orders" ? "#dc2626" : "#6b7280",
                border: "none",
                backgroundColor: "transparent",
                fontWeight: activeView === "orders" ? "600" : "400",
                borderBottom:
                  activeView === "orders"
                    ? "3px solid #dc2626"
                    : "3px solid transparent",
                marginRight: "20px",
                padding: "10px 0",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (activeView !== "orders") {
                  e.currentTarget.style.color = "#dc2626";
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== "orders") {
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
            >
              <FeatherIcon icon="truck" size={16} className="me-1" />
              Order Types
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeView === "trends" ? "active" : ""}`}
              onClick={() => setActiveView("trends")}
              style={{
                cursor: "pointer",
                color: activeView === "trends" ? "#dc2626" : "#6b7280",
                border: "none",
                backgroundColor: "transparent",
                fontWeight: activeView === "trends" ? "600" : "400",
                borderBottom:
                  activeView === "trends"
                    ? "3px solid #dc2626"
                    : "3px solid transparent",
                marginRight: "20px",
                padding: "10px 0",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (activeView !== "trends") {
                  e.currentTarget.style.color = "#dc2626";
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== "trends") {
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
            >
              <FeatherIcon icon="trending-up" size={16} className="me-1" />
              Trends
            </button>
          </li>
        </ul>
      </div>

      {/* Charts Content */}
      {activeView === "overview" && (
        <div className="row g-4">
          <div className="col-12">
            <ChartCard title="Sales & Orders Trend">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    stroke="#dc2626"
                    name="Sales ($)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#ef4444"
                    name="Orders"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="col-md-6">
            <ChartCard title="Revenue by Source">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
                    outerRadius={120}
                    fill="#dc2626"
                    dataKey="revenue"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="col-md-6">
            <ChartCard title="Orders by Type">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent !== undefined ? percent * 100 : 0).toFixed(1)}%`
                    }
                    outerRadius={120}
                    fill="#dc2626"
                    dataKey="count"
                  >
                    {orderTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {activeView === "sources" && (
        <div className="row g-4">
          <div className="col-md-6">
            <ChartCard title="Source Distribution (Orders)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#dc2626" name="Number of Orders" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="col-md-6">
            <ChartCard title="Source Distribution (Revenue)">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                    outerRadius={120}
                    fill="#dc2626"
                    dataKey="revenue"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {activeView === "payments" && (
        <div className="row g-4">
          <div className="col-md-6">
            <ChartCard title="Payment Methods (Orders)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#ef4444" name="Number of Orders" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="col-md-6">
            <ChartCard title="Payment Methods (Revenue)">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) =>
                      `${name}: ${(percent !== undefined ? percent * 100 : 0).toFixed(1)}%`
                    }
                    outerRadius={120}
                    fill="#dc2626"
                    dataKey="amount"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {activeView === "orders" && (
        <div className="row g-4">
          <div className="col-md-6">
            <ChartCard title="Order Type Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#f87171" name="Number of Orders" />
                  <Bar dataKey="revenue" fill="#dc2626" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="col-md-6">
            <ChartCard title="Average Order Value by Type">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="averageValue"
                    fill="#ef4444"
                    name="Avg Order Value ($)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {activeView === "trends" && (
        <div className="row g-4">
          <div className="col-12">
            <ChartCard title="Daily Sales Trend">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stackId="1"
                    stroke="#dc2626"
                    fill="#dc2626"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgOrder"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="col-md-6">
            <ChartCard title="Hourly Order Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={3}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="col-md-6">
            <ChartCard title="Fee Breakdown">
              <div className="p-3">
                {/* Delivery Charges */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-semibold">Delivery Charges</span>
                    <span className="text-success fw-bold">
                      +${additionalStats.deliveryCharges.toFixed(2)}
                    </span>
                  </div>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-success"
                      style={{
                        width: `${Math.min(100, (additionalStats.deliveryCharges / (additionalStats.totalRevenue + Math.abs(additionalStats.totalDiscount))) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Service Charges */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-semibold">Service Charges</span>
                    <span className="text-info fw-bold">
                      +${additionalStats.serviceCharges.toFixed(2)}
                    </span>
                  </div>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-info"
                      style={{
                        width: `${Math.min(100, (additionalStats.serviceCharges / (additionalStats.totalRevenue + Math.abs(additionalStats.totalDiscount))) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Discounts */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-semibold">Discounts</span>
                    <span className="text-warning fw-bold">
                      -${Math.abs(additionalStats.totalDiscount).toFixed(2)}
                    </span>
                  </div>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{
                        width: `${Math.min(100, (Math.abs(additionalStats.totalDiscount) / (additionalStats.totalRevenue + Math.abs(additionalStats.totalDiscount))) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Net Impact */}
                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Net Impact on Revenue</span>
                    <span
                      className={`fw-bold ${additionalStats.deliveryCharges + additionalStats.serviceCharges - Math.abs(additionalStats.totalDiscount) >= 0 ? "text-success" : "text-danger"}`}
                    >
                      {additionalStats.deliveryCharges +
                        additionalStats.serviceCharges -
                        Math.abs(additionalStats.totalDiscount) >=
                      0
                        ? "+"
                        : "-"}
                      $
                      {Math.abs(
                        additionalStats.deliveryCharges +
                          additionalStats.serviceCharges -
                          Math.abs(additionalStats.totalDiscount),
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}

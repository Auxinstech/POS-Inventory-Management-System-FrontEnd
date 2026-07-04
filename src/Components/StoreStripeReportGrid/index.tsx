import * as React from "react";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  GridFooter,
  useGridApiRef,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { fetchStripeReport } from "../../Redux/Ducks/reportSlice";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Form, FormGroup } from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FeatherIcon from "feather-icons-react";

// Define the Stripe payment log interface
export interface StripePaymentLog {
  id: number;
  order_id: number;
  gateway: string;
  payment_intent_id: string;
  transaction_id: string | null;
  amount: string;
  currency: string;
  status: string;
  gateway_response: any;
  created_at: string;
  updated_at: string;
  order: {
    id: number;
    order_number: string;
    order_type: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    amount: string;
    total: string;
    payment_method: string;
    payment_status: string;
    status: string;
    created_at: string;
  };
}

// Define the grid row interface
export interface StripeReportGridRow {
  id: number;
  payment_id: number;
  order_id: number;
  order_number: string;
  order_type: string;
  customer_name: string;
  phone_number: string;
  email: string;
  amount: number;
  currency: string;
  payment_status: string;
  stripe_status: string;
  payment_method: string;
  created_at: string;
  payment_intent_id: string;
}

// API Response interface with pagination
export interface StripeReportApiResponse {
  success: boolean;
  status_code: number;
  message: string[];
  data: {
    current_page: number;
    data: StripePaymentLog[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: any[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

const columns: GridColDef<StripeReportGridRow>[] = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "order_number",
    headerName: "Order #",
    width: 120,
    headerClassName: "fw-bold",
  },
  {
    field: "order_type",
    headerName: "Order Type",
    width: 120,
  },
  {
    field: "customer_name",
    headerName: "Customer Name",
    width: 180,
    valueGetter: (params) => params || "-",
  },
  {
    field: "phone_number",
    headerName: "Phone",
    width: 130,
  },
  {
    field: "email",
    headerName: "Email",
    width: 200,
  },
  {
    field: "amount",
    headerName: "Amount",
    type: "number",
    width: 100,
    valueFormatter: (value: number) => `£${Number(value).toFixed(2)}`,
  },
  {
    field: "currency",
    headerName: "Currency",
    width: 80,
    valueFormatter: (value: string) => (value || "GBP").toUpperCase(),
  },
  {
    field: "payment_method",
    headerName: "Payment Method",
    width: 130,
  },
  {
    field: "stripe_status",
    headerName: "Stripe Status",
    width: 140,
    cellClassName: (params) => {
      const status = params.value;
      if (status === "succeeded" || status === "paid") return "text-success";
      if (status === "processing") return "text-warning";
      if (status === "failed") return "text-danger";
      return "";
    },
  },
  {
    field: "payment_status",
    headerName: "Order Payment",
    width: 120,
    cellClassName: (params) => {
      const status = params.value;
      if (status === "Paid") return "text-success";
      if (status === "Not Paid") return "text-warning";
      if (status === "Failed") return "text-danger";
      return "";
    },
  },
  {
    field: "created_at",
    headerName: "Date",
    type: "string",
    width: 120,
    valueGetter: (params: string) => params?.split("T")[0] || "-",
  },
  {
    field: "payment_intent_id",
    headerName: "Payment Intent ID",
    width: 250,
    valueFormatter: (value: string) => {
      if (!value) return "-";
      return value.length > 30 ? value.slice(0, 30) + "..." : value;
    },
  },
];

export default function StoreStripeReportGrid({
  store_id,
  setActiveMenu,
}: {
  store_id: number;
  setActiveMenu: (menu: string) => void;
}) {
  const dispatch = useAppDispatch();
  const apiRef = useGridApiRef();

  // Get data from Redux with pagination info
  const stripeReportData = useAppSelector((x) => x.report.stripeReport);
  const stripeLogs = stripeReportData?.data || [];
  const paginationInfo = stripeReportData;

  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // Pagination state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // Fetch data with pagination
  const fetchData = useCallback(() => {
    if (!store_id) return;

    dispatch(
      fetchStripeReport({
        store_id: store_id,
        from_date: fromDate,
        to_date: toDate,
        page: paginationModel.page + 1, // DataGrid uses 0-based, API uses 1-based
        per_page: paginationModel.pageSize,
        paginate: 1, // Enable pagination
      }),
    );
  }, [store_id, paginationModel.page, paginationModel.pageSize, dispatch]);

  // Initial load and when filters/pagination change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle pagination change
  const handlePaginationModelChange = (
    newPaginationModel: GridPaginationModel,
  ) => {
    setPaginationModel(newPaginationModel);
  };

  // Transform Stripe logs to grid rows
  const rows: StripeReportGridRow[] = useMemo(() => {
    if (!stripeLogs || !Array.isArray(stripeLogs)) return [];

    return stripeLogs.map((log: StripePaymentLog) => ({
      id: log.id,
      payment_id: log.id,
      order_id: log.order_id,
      order_number: log.order?.order_number || `ORD-${log.order_id}`,
      order_type: log.order?.order_type || "-",
      customer_name:
        `${log.order?.first_name || ""} ${log.order?.last_name || ""}`.trim() ||
        "-",
      phone_number: log.order?.phone_number || "-",
      email: log.order?.email || "-",
      amount: parseFloat(log.amount) || 0,
      currency: log.currency,
      payment_status: log.order?.payment_status || "-",
      stripe_status: log.status,
      payment_method: log.order?.payment_method || "-",
      created_at: log.created_at,
      payment_intent_id: log.payment_intent_id,
    }));
  }, [stripeLogs]);

  const handleSubmit = () => {
    dispatch(
      fetchStripeReport({
        store_id: store_id,
        from_date: fromDate,
        to_date: toDate,
        page: paginationModel.page + 1, // DataGrid uses 0-based, API uses 1-based
        per_page: paginationModel.pageSize,
        paginate: 1, // Enable pagination
      }),
    );
    // Reset to first page when applying filters
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  // Calculate totals for current page
  const currentPageTotals = useMemo(() => {
    let totalAmount = 0;
    let paidCount = 0;
    let failedCount = 0;
    let processingCount = 0;

    rows.forEach((row) => {
      totalAmount += row.amount || 0;
      if (row.stripe_status === "succeeded" || row.stripe_status === "paid")
        paidCount++;
      if (row.stripe_status === "failed") failedCount++;
      if (row.stripe_status === "processing") processingCount++;
    });

    return {
      totalAmount,
      paidCount,
      failedCount,
      processingCount,
      rowCount: rows.length,
    };
  }, [rows]);

  // Export current page data
  const handleExport = () => {
    const exportRows = rows.map((row) => ({
      ID: row.id,
      "Order #": row.order_number,
      "Order Type": row.order_type,
      "Customer Name": row.customer_name,
      Phone: row.phone_number,
      Email: row.email,
      Amount: `£${row.amount.toFixed(2)}`,
      Currency: row.currency.toUpperCase(),
      "Payment Method": row.payment_method,
      "Stripe Status": row.stripe_status,
      "Order Payment": row.payment_status,
      Date: row.created_at?.split("T")[0] || "-",
      "Payment Intent ID": row.payment_intent_id,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "stripe_report");

    // Auto-size columns
    worksheet["!cols"] = [
      { wch: 8 }, // ID
      { wch: 12 }, // Order #
      { wch: 12 }, // Order Type
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Phone
      { wch: 25 }, // Email
      { wch: 10 }, // Amount
      { wch: 8 }, // Currency
      { wch: 15 }, // Payment Method
      { wch: 15 }, // Stripe Status
      { wch: 15 }, // Order Payment
      { wch: 12 }, // Date
      { wch: 35 }, // Payment Intent ID
    ];

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `stripe_report_${fromDate}_to_${toDate}.xlsx`);
  };

  // Custom Footer component with pagination info
  const CustomFooter = () => {
    const { totalAmount, paidCount, failedCount, processingCount, rowCount } =
      currentPageTotals;

    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            bgcolor: "#f9f9f9",
            fontWeight: "bold",
            borderTop: "1px solid #ddd",
            alignItems: "center",
            height: "48px",
            px: 2,
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span>Current Page: {rowCount} rows</span>
            {paginationInfo && (
              <span className="text-muted">
                | Total: {paginationInfo.total} rows (Page{" "}
                {paginationInfo.current_page} of {paginationInfo.last_page})
              </span>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span className="text-success">✓ Paid: {paidCount}</span>
            <span className="text-warning">
              ⟳ Processing: {processingCount}
            </span>
            <span className="text-danger">✗ Failed: {failedCount}</span>
          </Box>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}
          >
            <span>Page Total:</span>
            <strong>£{Number(totalAmount).toFixed(2)}</strong>
            {paginationInfo && paginationInfo.total > rowCount && (
              <span className="text-muted ms-2">
                (Showing page {paginationInfo.current_page} of{" "}
                {paginationInfo.last_page})
              </span>
            )}
          </Box>
        </Box>
        <GridFooter />
      </Box>
    );
  };

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="manage-top-bar mb-3">
          <div className="d-flex gap-2 justify-content-end w-100">
            <FormGroup
              className="d-flex flex-row align-items-center gap-2"
              style={{ maxWidth: 200 }}
            >
              <Form.Label className="mb-0">From:</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </FormGroup>

            <FormGroup
              className="d-flex flex-row align-items-center gap-2"
              style={{ maxWidth: 200 }}
            >
              <Form.Label className="mb-0">To:</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                min={fromDate || undefined}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setToDate(e.target.value)}
              />
            </FormGroup>

            <button className="btn btn-primary" onClick={handleSubmit}>
              <FeatherIcon icon="search" size={18} className="me-1" />
              Filter
            </button>

            <button
              id="export-btn"
              className="btn btn-success"
              onClick={handleExport}
            >
              <FeatherIcon icon="download" size={18} className="me-1" />
              Export
            </button>
          </div>
        </div>

        <Box sx={{ height: "auto", width: "100%" }}>
          <DataGrid
            apiRef={apiRef}
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
              "& .MuiDataGrid-footerContainer": {
                padding: 0,
                borderTop: "none",
              },
              "& .text-success": {
                color: "#2e7d32",
                fontWeight: "bold",
              },
              "& .text-warning": {
                color: "#ed6c02",
                fontWeight: "bold",
              },
              "& .text-danger": {
                color: "#d32f2f",
                fontWeight: "bold",
              },
            }}
            rows={rows}
            columns={columns}
            rowCount={paginationInfo?.total || 0}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[10, 20, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{
              footer: CustomFooter,
            }}
            initialState={{
              sorting: {
                sortModel: [{ field: "created_at", sort: "desc" }],
              },
            }}
          />
        </Box>
      </div>
    </div>
  );
}

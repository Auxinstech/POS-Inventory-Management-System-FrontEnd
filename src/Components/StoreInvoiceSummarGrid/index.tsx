import * as React from "react";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  GridFooter,
  useGridApiRef,
  useGridSelector,
  gridFilteredSortedRowIdsSelector,
} from "@mui/x-data-grid";
import { useAppDispatch } from "Hook/hooks";
import { useState, useMemo } from "react";
import { Form, FormGroup } from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FeatherIcon from "feather-icons-react";
import {
  fetchInvoiceSummary,
  InvoiceSummaryEntry,
  InvoiceSummaryResponse,
  setMarkasPaid,
} from "../../Redux/Ducks/reportSlice";
import { toast } from "react-toastify";
import { setToast } from "../../Redux/Ducks/toastSlice";

interface InvoiceSummary {
  data: InvoiceSummaryEntry[];
}

export default function StoreInvoiceSummaryGrid({
  store_id,
  orders,
}: {
  store_id: number;
  orders: InvoiceSummaryResponse<InvoiceSummaryEntry> | null;
}) {
  const apiRef = useGridApiRef();
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Convert API data to grid rows
  const items = useMemo(
    () =>
      orders?.data?.map((entry) => ({
        id: entry.id,
        status: entry.status,
        store_name: entry.store?.name || "-",
        num_of_orders: entry.num_of_orders,
        amount: Number(entry.amount || "0"),
        from_date: entry.from_date?.split("T")[0],
        to_date: entry.to_date?.split("T")[0],
      })) || [],
    [orders]
  );

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        let color = "";
        switch (params.value) {
          case "unpaid":
            color = "#f0ad4e"; // orange
            break;
          case "paid":
            color = "#5cb85c"; // green
            break;
          default:
            color = "#6c757d"; // gray
        }
        return (
          <span
            style={{
              backgroundColor: color,
              color: "#fff",
              borderRadius: "12px",
              padding: "2px 10px",
              fontSize: "0.85rem",
              textTransform: "capitalize",
            }}
          >
            {params.value}
          </span>
        );
      },
    },
    { field: "store_name", headerName: "Store", width: 200 },
    {
      field: "num_of_orders",
      headerName: "Orders",
      width: 120,
      valueFormatter: (value) => Number(value).toLocaleString(),
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 120,
      valueFormatter: (value) => `${Number(value).toFixed(2)}`,
    },
    { field: "from_date", headerName: "From Date", width: 130 },
    { field: "to_date", headerName: "To Date", width: 130 },
    {
      field: "action",
      headerName: "Action",
      width: 130,
      renderCell: (params) => {
        return (
          <div className="d-flex gap-2 align-items-center mt-2">
            {params.row.status === "unpaid" && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleMarkAsRead(params.row.id);
                }}
              >
                Mark as Paid
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  const handleSubmit = () => {
    dispatch(
      fetchInvoiceSummary({
        store_id,
        from_date: fromDate,
        to_date: toDate,
        per_page: pageSize,
        page: page + 1,
        status: status === "all" ? "" : status,
        sort_by: "id",
        sort_order: "desc",
      })
    );
  };

  const handlePagination = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);

    dispatch(
      fetchInvoiceSummary({
        store_id,
        from_date: fromDate,
        to_date: toDate,
        per_page: newPageSize,
        page: newPage + 1,
        status: status === "all" ? "" : status,
        sort_by: "id",
        sort_order: "desc",
      })
    );
  };

  // Custom Footer component
  const CustomFooter = () => {
    // Get filtered row IDs from MUI DataGrid
    const filteredRowIds = useGridSelector(
      apiRef as any,
      gridFilteredSortedRowIdsSelector
    );

    // Calculate totals based on filtered rows
    const calculateTotals = () => {
      let totalOrders = 0;
      let totalAmount = 0;

      const rowsToCalculate =
        filteredRowIds.length > 0
          ? filteredRowIds
              .map((id) => items.find((r) => r.id === id))
              .filter(Boolean)
          : items;

      rowsToCalculate.forEach((row: any) => {
        if (row) {
          totalOrders += row.num_of_orders || 0;
          totalAmount += row.amount || 0;
        }
      });

      return {
        totalOrders,
        totalAmount,
        rowCount: rowsToCalculate.length,
      };
    };

    const { totalOrders, totalAmount, rowCount } = calculateTotals();

    return (
      <Box>
        {/* Totals row */}
        <Box
          sx={{
            display: "flex",
            bgcolor: "#fafafa",
            fontWeight: "bold",
            borderTop: "1px solid #ddd",
            alignItems: "center",
            height: "48px",
            pl: 2,
          }}
        >
          <Box
            sx={{
              width: 120,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 200,
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            TOTALS ({rowCount} invoices)
          </Box>
          <Box
            sx={{
              width: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              pr: 2,
            }}
          >
            {totalOrders.toLocaleString()}
          </Box>
          <Box
            sx={{
              width: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              pr: 2,
            }}
          >
            {totalAmount.toFixed(2)}
          </Box>
          <Box
            sx={{
              width: 130,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 130,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 130,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
        </Box>

        {/* Keep pagination/footer */}
        <GridFooter />
      </Box>
    );
  };

  const handleExport = () => {
    // Get filtered data from grid
    let dataToExport = items;

    try {
      // Try to get filtered rows from the grid
      if (apiRef.current) {
        const filteredRowIds = gridFilteredSortedRowIdsSelector(
          apiRef.current.state as any
        );
        if (filteredRowIds.length > 0) {
          dataToExport = filteredRowIds
            .map((rowId) => items.find((r) => r.id === rowId))
            .filter(Boolean) as any[];
        }
      }
    } catch (error) {
      console.log("Using all rows for export");
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "invoices");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      `invoice_summary_${fromDate}_to_${toDate}.xlsx`
    );
  };

  const handleMarkAsRead = async (id: number) => {
    await dispatch(setMarkasPaid({ store_id, invoice_id: id }));
    dispatch(
      setToast({
        message: "Invoice marked as paid",
        type: "success",
      })
    );
    handleSubmit();
  };

  return (
    <div>
      <div className="manage-top-bar d-flex gap-2 justify-content-end">
        {/* Date Filter */}
        <FormGroup className="d-flex align-items-center gap-2">
          <Form.Label className="mb-0">From:</Form.Label>
          <Form.Control
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </FormGroup>

        <FormGroup className="d-flex align-items-center gap-2">
          <Form.Label className="mb-0">To:</Form.Label>
          <Form.Control
            type="date"
            value={toDate}
            min={fromDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setToDate(e.target.value)}
          />
        </FormGroup>

        <FormGroup className="d-flex align-items-center gap-2">
          <Form.Label className="mb-0">Status</Form.Label>
          <Form.Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </Form.Select>
        </FormGroup>

        <button className="btn btn-primary" onClick={handleSubmit}>
          Filter
        </button>

        <button className="btn btn-primary" onClick={handleExport}>
          <FeatherIcon icon="download" size={20} /> Export
        </button>
      </div>

      {/* GRID */}
      <Box sx={{ height: "auto", width: "100%", mt: 2 }}>
        <DataGrid
          apiRef={apiRef}
          pagination
          paginationMode="server"
          rowCount={orders?.total ?? 0}
          onPaginationModelChange={(model) => {
            handlePagination(model.page, model.pageSize);
          }}
          rows={items}
          columns={columns}
          getRowId={(row) => row.id ?? `${row.store_name}-${row.from_date}`}
          pageSizeOptions={[15, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 15 } },
          }}
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
            "& .MuiDataGrid-footerContainer": {
              padding: 0,
              borderTop: "none",
            },
          }}
          slots={{
            footer: CustomFooter,
          }}
        />
      </Box>
    </div>
  );
}

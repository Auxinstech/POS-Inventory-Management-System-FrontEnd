import * as React from "react";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  useGridApiRef,
  useGridSelector,
  gridFilteredSortedRowIdsSelector,
} from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { fetchDetailedReport } from "../../Redux/Ducks/reportSlice";
import { Col, Form, FormGroup, Row } from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FeatherIcon from "feather-icons-react";
import { GridApiCommunity } from "@mui/x-data-grid/internals";

type ReportType = "cashier" | "item";
type PaymentType = "cash" | "not_paid";

export default function StoreDetailedReportGrid({
  store_id,
  setActiveMenu,
}: {
  store_id: number;
  setActiveMenu: (menu: string) => void;
}) {
  const apiRef = useGridApiRef<GridApiCommunity>();
  const dispatch = useAppDispatch();
  const users = useAppSelector((x) => x.Users.users);
  const { detailed_reports } = useAppSelector((state) => state.report);

  const [fromDate, setFromDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );

  const [selectedType, setSelectedType] = React.useState<ReportType>("cashier");
  const [currentType, setCurrentType] = React.useState<ReportType>("cashier");

  const [selectedPaymentType, setSelectedPaymentType] =
    React.useState<PaymentType>("cash");

  // Fetch data
  const handleSubmit = () => {
    setCurrentType(selectedType);
    dispatch(
      fetchDetailedReport({
        payment_method: selectedPaymentType,
        group_by: selectedType,
        store_id,
        from_date: fromDate,
        to_date: toDate,
      })
    );
  };

  React.useEffect(() => {
    if (store_id) {
      dispatch(
        fetchDetailedReport({
          payment_method: selectedPaymentType,
          group_by: selectedType,
          store_id,
          from_date: fromDate,
          to_date: toDate,
        })
      );
    }
  }, [store_id]);

  // Columns
  const getColumnsByType = (type: ReportType): GridColDef[] => {
    switch (type) {
      case "cashier":
        return [
          { field: "cashier_id", headerName: "Cashier ID", width: 120 },
          { field: "cashier_name", headerName: "Cashier Name", width: 180 },
          {
            field: "total_orders",
            headerName: "Total Orders",
            type: "number",
            width: 150,
          },
          {
            field: "total_sales",
            headerName: "Total Sales",
            type: "number",
            width: 160,
            valueFormatter: (value) =>
              `${(value as number)?.toFixed(2) || "0.00"}`,
          },
        ];
      case "item":
        return [
          { field: "item_id", headerName: "Item ID", width: 120 },
          { field: "item_name", headerName: "Item Name", width: 220 },
          {
            field: "total_quantity",
            headerName: "Total Quantity",
            type: "number",
            width: 160,
          },
          {
            field: "total_sales",
            headerName: "Total Sales",
            type: "number",
            width: 160,
            valueFormatter: (value) =>
              `${(value as number)?.toFixed(2) || "0.00"}`,
          },
        ];
    }
  };

  // Rows
  const rows = React.useMemo(() => {
    if (!Array.isArray(detailed_reports)) return [];

    return detailed_reports.map((row: any, index: number) => {
      if (currentType === "cashier") {
        return {
          id: index,
          cashier_id: row.cashier_id,
          cashier_name: row.cashier_name,
          total_orders: Number(row.total_orders) || 0,
          total_sales: Number(row.total_sales) || 0,
        };
      }
      if (currentType === "item") {
        return {
          id: index,
          item_id: row.item_id,
          item_name: row.item_name,
          total_quantity: Number(row.total_quantity) || 0,
          total_sales: Number(row.total_sales) || 0,
        };
      }
      return { id: index };
    });
  }, [detailed_reports, currentType]);

  console.log(rows);

  // Custom Footer Component
  const CustomFooter = () => {
    // Use useGridSelector inside the footer component to avoid early execution
    const filteredRowIds = useGridSelector(
      apiRef as any,
      gridFilteredSortedRowIdsSelector
    );

    // Calculate totals based on filtered rows
    const calculateTotals = () => {
      let totalOrders = 0;
      let totalSales = 0;
      let totalQuantity = 0;

      const rowsToCalculate =
        filteredRowIds.length > 0
          ? filteredRowIds
              .map((id) => rows.find((r) => r.id === id))
              .filter(Boolean)
          : rows;

      rowsToCalculate.forEach((row: any) => {
        if (row) {
          if (currentType === "cashier") {
            totalOrders += row.total_orders || 0;
            totalSales += row.total_sales || 0;
          } else if (currentType === "item") {
            totalQuantity += row.total_quantity || 0;
            totalSales += row.total_sales || 0;
          }
        }
      });

      return {
        totalOrders,
        totalSales,
        totalQuantity,
        rowCount: rowsToCalculate.length,
      };
    };

    const { totalOrders, totalSales, totalQuantity, rowCount } =
      calculateTotals();

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1.5,
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#fafafa",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        <div style={{ display: "flex", gap: "24px" }}>
          <div>
            <span style={{ color: "#666", marginRight: "8px" }}>
              Total Rows:
            </span>
            <span>{rowCount}</span>
          </div>
          {currentType === "cashier" && (
            <>
              <div>
                <span style={{ color: "#666", marginRight: "8px" }}>
                  Total Orders:
                </span>
                <span>{totalOrders.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: "#666", marginRight: "8px" }}>
                  Total Sales:
                </span>
                <span>${totalSales.toFixed(2)}</span>
              </div>
            </>
          )}
          {currentType === "item" && (
            <>
              <div>
                <span style={{ color: "#666", marginRight: "8px" }}>
                  Total Quantity:
                </span>
                <span>{totalQuantity.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: "#666", marginRight: "8px" }}>
                  Total Sales:
                </span>
                <span>{totalSales.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </Box>
    );
  };

  // Export to Excel
  const handleExport = () => {
    // Get filtered row IDs if grid is available
    let dataToExport = rows;

    try {
      // Try to get filtered rows from the grid
      if (apiRef.current) {
        const filteredRowIds = gridFilteredSortedRowIdsSelector(
          apiRef.current.state as any
        );
        if (filteredRowIds.length > 0) {
          dataToExport = filteredRowIds
            .map((rowId) => rows.find((r) => r.id === rowId))
            .filter(Boolean) as any[];
        }
      }
    } catch (error) {
      console.log("Using all rows for export");
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "report");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      `detailed_report_${currentType}_${fromDate}_to_${toDate}.xlsx`
    );
  };

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="manage-top-bar">
          <div className="d-flex gap-2 justify-content-end w-100">
            <FormGroup
              className="d-flex flex-row align-items-center gap-2"
              style={{ maxWidth: 200 }}
            >
              <Form.Label className="mb-0">Group By:</Form.Label>
              <Form.Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ReportType)}
              >
                <option value="cashier">Cashier</option>
                <option value="item">Item</option>
              </Form.Select>
            </FormGroup>

            <FormGroup
              className="d-flex flex-row align-items-center gap-2"
              style={{ maxWidth: 200 }}
            >
              <Form.Label className="mb-0">Payment Method:</Form.Label>
              <Form.Select
                value={selectedPaymentType}
                onChange={(e) =>
                  setSelectedPaymentType(e.target.value as PaymentType)
                }
              >
                <option value="cash">Cash</option>
                <option value="not_paid">Not Paid</option>
              </Form.Select>
            </FormGroup>

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
              Filter
            </button>
            <button className="btn btn-primary" onClick={handleExport}>
              <FeatherIcon icon="download" size={20} /> Export
            </button>
          </div>
        </div>

        <Box sx={{ height: "auto", width: "100%" }}>
          <DataGrid
            apiRef={apiRef}
            rows={rows}
            columns={getColumnsByType(currentType)}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[10, 20, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{
              footer: CustomFooter,
            }}
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid rgba(224, 224, 224, 1)",
                backgroundColor: "#fafafa",
              },
            }}
          />
        </Box>
      </div>
    </div>
  );
}

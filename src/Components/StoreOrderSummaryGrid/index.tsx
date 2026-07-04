import * as React from "react";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  GridFooter,
  useGridApiRef,
  useGridSelector,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
} from "@mui/x-data-grid";
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
import { GridApiCommunity } from "@mui/x-data-grid/internals";

export interface OrderSummaryItem {
  id: number;
  order_type: string;
  first_name: string;
  last_name: string;
  contact: string;
  payment_method: string;
  total_amount: number;
  service_charges: number;
  delivery_charges: number;
  discount: number;
  address: string;
  created_at: string;
  created_by: string;
}

const columns: GridColDef<OrderSummaryItem>[] = [
  { field: "id", headerName: "ID", width: 90 },
  {
    field: "first_name",
    headerName: "First Name",
    width: 150,
    headerClassName: "fw-bold",
  },
  {
    field: "last_name",
    headerName: "Last Name",
    width: 150,
  },
  { field: "order_type", headerName: "Order Type", width: 150 },
  {
    field: "contact",
    headerName: "Contact",
    type: "string",
    width: 110,
  },
  {
    field: "address",
    headerName: "Address",
    type: "string",
    width: 110,
  },
  { field: "created_at", headerName: "Created At", type: "string", width: 110 },
  { field: "created_by", headerName: "Taken By", type: "string", width: 110 },
  {
    field: "payment_method",
    headerName: "Payment Method",
    type: "string",
    width: 110,
  },
  {
    field: "discount",
    headerName: "Discount",
    type: "number",
    width: 110,
    valueFormatter: (value) => Number(value).toFixed(2),
  },
  {
    field: "service_charges",
    headerName: "Service Charges",
    type: "number",
    width: 110,
    valueFormatter: (value) => Number(value).toFixed(2),
  },
  {
    field: "delivery_charges",
    headerName: "Delivery Charges",
    type: "number",
    width: 110,
    valueFormatter: (value) => Number(value).toFixed(2),
  },
  {
    field: "total_amount",
    headerName: "Total Amount",
    type: "number",
    width: 110,
    valueFormatter: (value) => Number(value).toFixed(2),
  },
];

export default function DataGridDemo({
  store_id,
  orders,
  setActiveMenu,
}: {
  store_id: number;
  orders: any[];
  setActiveMenu: (menu: string) => void;
}) {
  const apiRef = useGridApiRef<GridApiCommunity>();
  const dispatch = useAppDispatch();
  const users = useAppSelector((x) => x.Users.users);
  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const findUser = (user_id: any) => {
    const user = users.find((x) => x.id === user_id);
    return user?.name || "N/A";
  };

  const items: OrderSummaryItem[] = useMemo(() => {
    return orders.map((order) => ({
      id: order.id,
      first_name: order.first_name || "-",
      last_name: order.last_name || "-",
      order_type: order.order_type || "-",
      contact: order.phone_number || "-",
      address: [order.door_no, order.street, order.city, order.post_code]
        .filter(Boolean)
        .join(", "),
      created_at: order.created_at?.split("T")[0],
      created_by: findUser(order.created_by),
      payment_method: order.payment_method || "-",
      service_charges: parseFloat(order.service_charges ?? "0"),
      delivery_charges: parseFloat(order.delivery_charges ?? "0"),
      discount: Math.max(
        0,
        parseFloat(order.amount ?? "0") - parseFloat(order.total ?? "0")
      ),
      total_amount: parseFloat(order.total ?? "0"),
    }));
  }, [orders, users]);

  const handleRowClick = (id: number) => {
    if (id === -1) return;
    setActiveMenu("orders-report");
    const order: Order | undefined = orders.find((x) => x.id === id);
    if (order) dispatch(setActiveOrderReports(order));
  };

  const handleSubmit = () => {
    dispatch(
      getOrdersByID({
        store_id: store_id,
        from_date: fromDate,
        to_date: toDate,
      })
    );
  };

  // Calculate totals based on current filtered rows
  const useGridFilteredTotals = () => {
    // This hook needs to be called inside a component that's rendered as a slot
    const filteredRowIds = useGridSelector(
      apiRef as any,
      gridFilteredSortedRowIdsSelector
    );

    const totals = useMemo(() => {
      let totalDelivery = 0;
      let totalService = 0;
      let totalDiscount = 0;
      let totalAmount = 0;

      // Get filtered rows
      const filteredItems = filteredRowIds
        .map((id) => items.find((r) => r.id === id))
        .filter(Boolean) as OrderSummaryItem[];

      // Calculate from filtered rows
      filteredItems.forEach((row) => {
        totalDelivery += row.delivery_charges || 0;
        totalService += row.service_charges || 0;
        totalDiscount += row.discount || 0;
        totalAmount += row.total_amount || 0;
      });

      return {
        totalDelivery,
        totalService,
        totalDiscount,
        totalAmount,
        rowCount: filteredItems.length,
      };
    }, [filteredRowIds, items]);

    return totals;
  };

  const handleExport = () => {
    let dataToExport = items;

    try {
      // Get filtered data directly from grid state
      if (apiRef.current) {
        const filteredRowIds = gridFilteredSortedRowIdsSelector(
          apiRef.current.state as any
        );
        if (filteredRowIds.length > 0) {
          dataToExport = filteredRowIds
            .map((rowId) => items.find((r) => r.id === rowId))
            .filter(Boolean) as OrderSummaryItem[];
        }
      }
    } catch (error) {
      console.log("Using all rows for export");
    }

    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Create a new workbook and append worksheet
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

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save as file
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `orders_${fromDate}_to_${toDate}.xlsx`);
  };

  // Custom Footer component that uses filtered data
  const CustomFooter = () => {
    const {
      totalDelivery,
      totalService,
      totalDiscount,
      totalAmount,
      rowCount,
    } = useGridFilteredTotals();

    return (
      <Box>
        {/* Totals row */}
        <Box
          sx={{
            display: "flex",
            bgcolor: "#f9f9f9",
            fontWeight: "bold",
            borderTop: "1px solid #ddd",
            alignItems: "center",
            height: "48px",
          }}
        >
          <Box
            sx={{
              width: 90,
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 150,
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            TOTALS ({rowCount} rows)
          </Box>
          <Box
            sx={{
              width: 150,
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 150,
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 110,
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 110,
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 110,
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 110,
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 110,
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 110,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {Number(totalDiscount).toFixed(2)}
          </Box>
          <Box
            sx={{
              width: 110,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {Number(totalService).toFixed(2)}
          </Box>
          <Box
            sx={{
              width: 110,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {Number(totalDelivery).toFixed(2)}
          </Box>
          <Box
            sx={{
              width: 110,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {Number(totalAmount).toFixed(2)}
          </Box>
        </Box>

        {/* Keep pagination/footer */}
        <GridFooter />
      </Box>
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
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
              "& .MuiDataGrid-footerContainer": {
                padding: 0,
                borderTop: "none",
              },
            }}
            onRowClick={(e) => handleRowClick(e.row.id)}
            rows={items}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[10, 20, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{
              footer: CustomFooter,
            }}
          />
        </Box>
      </div>
    </div>
  );
}

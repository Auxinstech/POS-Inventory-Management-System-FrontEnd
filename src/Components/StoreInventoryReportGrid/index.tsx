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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FeatherIcon from "feather-icons-react";
import { FormLabel } from "react-bootstrap";

export interface ItemSummary {
  id: number;
  name: string;
  description: string;
  stock: number;
  price: number;
}

const columns: GridColDef<ItemSummary>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 90,
    headerClassName: "fw-bold",
  },
  {
    field: "name",
    headerName: "Item Name",
    flex: 1,
    minWidth: 200,
  },
  {
    field: "description",
    headerName: "Description",
    flex: 1,
    minWidth: 250,
  },
  {
    field: "stock",
    headerName: "Stock",
    type: "number",
    width: 120,
    valueFormatter: (value) => Number(value).toLocaleString(),
  },
  {
    field: "price",
    headerName: "Price",
    type: "number",
    width: 120,
    valueFormatter: (value: number) => `${value?.toFixed(2) || "0.00"}`,
  },
];

export default function StoreItemsGrid({ items }: { items: any[] }) {
  const apiRef = useGridApiRef();

  const rows: ItemSummary[] = React.useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.name || "-",
        description: item.description || "-",
        stock: Number(item.stock ?? 0),
        price: Number(item.price ?? 0),
      })),
    [items]
  );

  // Custom Footer component
  const CustomFooter = () => {
    // Get filtered row IDs from MUI DataGrid
    const filteredRowIds = useGridSelector(
      apiRef as any,
      gridFilteredSortedRowIdsSelector
    );

    // Calculate totals based on filtered rows
    const calculateTotals = () => {
      let totalStock = 0;
      let totalPrice = 0;
      let itemCount = 0;

      const rowsToCalculate =
        filteredRowIds.length > 0
          ? filteredRowIds
              .map((id) => rows.find((r) => r.id === id))
              .filter(Boolean)
          : rows;

      rowsToCalculate.forEach((row: ItemSummary | undefined) => {
        if (row) {
          totalStock += row.stock || 0;
          totalPrice += row.price || 0;
          itemCount += 1;
        }
      });

      return {
        totalStock,
        totalPrice,
        itemCount,
        averagePrice: itemCount > 0 ? totalPrice / itemCount : 0,
      };
    };

    const { totalStock, totalPrice, itemCount, averagePrice } =
      calculateTotals();

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
              flex: 1,
              minWidth: 200,
              p: 1,
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            TOTALS ({itemCount} items)
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 250,
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          ></Box>
          <Box
            sx={{
              width: 120,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              fontWeight: "bold",
            }}
          >
            {totalStock.toLocaleString()}
          </Box>
          <Box
            sx={{
              width: 120,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {""}
            {/* AVG Pirce: {averagePrice.toFixed(2)} */}
          </Box>
        </Box>

        {/* Keep pagination/footer */}
        <GridFooter />
      </Box>
    );
  };

  const handleExport = () => {
    // Get filtered data from grid
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
            .filter(Boolean) as ItemSummary[];
        }
      }
    } catch (error) {
      console.log("Using all rows for export");
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "items");

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 40 },
      { wch: 10 },
      { wch: 12 },
    ];

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(data, "items_inventory.xlsx");
  };

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="manage-top-bar">
          <FormLabel className="mb-0 w-100 fw-bold">Inventory Report</FormLabel>
          <div className="d-flex justify-content-end w-100">
            <button className="btn btn-primary" onClick={handleExport}>
              <FeatherIcon icon="download" size={18} /> Export
            </button>
          </div>
        </div>

        <Box sx={{ height: "auto", width: "100%" }}>
          <DataGrid
            apiRef={apiRef}
            rows={rows}
            columns={columns}
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
              "& .MuiDataGrid-footerContainer": {
                padding: 0,
                borderTop: "none",
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 20, 50]}
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

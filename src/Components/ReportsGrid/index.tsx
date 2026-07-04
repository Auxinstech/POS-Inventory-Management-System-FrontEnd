import { useNavigate } from "react-router-dom";
import { ReportEntry } from "../../Redux/Ducks/reportSlice";
import { DataGrid, GridColDef, GridFooter } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface ReportsGridProps {
  items: ReportEntry[];
}

const columns: GridColDef[] = [
  { field: "stores", headerName: "Stores", width: 400 },
  { field: "orders", headerName: "Orders", type: "number", width: 200 },
  {
    field: "service_charges",
    headerName: "Service Charges",
    type: "number",
    width: 200,
  },
  { field: "total", headerName: "Total", type: "number", width: 200 },
];

const ReportsGrid: React.FC<ReportsGridProps> = ({ items }) => {
  const navigate = useNavigate();

  const calculateTotal = (items: ReportEntry[]) =>
    items.reduce((sum, x) => sum + Number(x.total || 0), 0);

  const calculateOrders = (items: ReportEntry[]) =>
    items.reduce((sum, x) => sum + Number(x.orders_count), 0);

  const calculateServiceCharges = (items: ReportEntry[]) =>
    items.reduce((sum, x) => sum + Number(x.service_charges), 0);

  // add id to each row
  const rows = items.map((item, index) => ({
    id: index + 1,
    stores: item.store.name,
    orders: item.orders_count,
    ...item,
  }));

  // totals row
  const totalsRow = {
    id: "totals",
    stores: "TOTALS",
    orders: calculateOrders(items),
    service_charges: calculateServiceCharges(items),
    total: calculateTotal(items),
    isTotal: true,
  };

  const rowsWithTotal = [...rows, totalsRow];

  const handleRowClick = (id: string | number) => {
    if (id === "totals") return;
    navigate(`/reports/?store_id=${id}`);
  };

  return (
    <div className="container-fluid p-0">
      <Box sx={{ height: "auto", width: "100%" }}>
        <DataGrid
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
          }}
          rows={rows}
          columns={columns}
          onRowClick={(e) => {
            handleRowClick(e.row.store_id);
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          slots={{
            footer: () => (
              <Box>
                {/* Totals row */}
                <Box
                  sx={{
                    display: "flex",
                    bgcolor: "#f9f9f9",
                    fontWeight: "bold",
                    borderTop: "1px solid #ddd",
                  }}
                >
                  <Box sx={{ width: 400, p: 1 }}>TOTALS</Box>
                  <Box sx={{ width: 200, p: 1, textAlign: "right" }}>
                    {calculateOrders(items)?.toFixed(2) ?? 0}
                  </Box>
                  <Box sx={{ width: 200, p: 1, textAlign: "right" }}>
                    {calculateServiceCharges(items)?.toFixed(2) ?? 0}
                  </Box>
                  <Box sx={{ width: 200, p: 1, textAlign: "right" }}>
                    {calculateTotal(items)?.toFixed(2) ?? 0}
                  </Box>
                </Box>

                {/* Keep pagination/footer */}
                <GridFooter />
              </Box>
            ),
          }}
        />
      </Box>
    </div>
  );
};

export default ReportsGrid;

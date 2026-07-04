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
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FeatherIcon from "feather-icons-react";
import CreateInventoryModal from "./Create";
import ViewInventoryModal from "./View";
import DeleteInventoryModal from "./Delete";
import { Item } from "Models/item";

export default function StoreInventorySummaryGrid({
  store_id,
  data,
  items,
}: {
  store_id: number;
  data: any;
  items: Item[];
}) {
  const apiRef = useGridApiRef();

  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const openViewModal = (row: any) => {
    setSelectedRow(row);
    setShowViewModal(true);
  };

  const openDeleteModal = async (row: any) => {
    setSelectedRow(row);
    setShowDeleteModal(true);
  };

  const openAddModal = (row: any) => {
    setSelectedRow(row);
    setShowAddModal(true);
  };

  /* ----------------------------
     MAP API DATA → GRID ROWS
  ----------------------------- */
  const itemsArray = useMemo(
    () =>
      data?.map((entry: any) => ({
        id: entry?.id,
        store_name: entry.store?.name ?? "-",
        item_name: entry.item?.name ?? "-",
        quantity: entry.quantity ?? 0,
        unit_price: Number(entry.item?.price ?? 0),
        total_value:
          Number(entry.quantity ?? 0) * Number(entry.item?.price ?? 0),
        updated_by: entry.user?.name ?? "-",
        created_at: entry.created_at ? entry?.created_at.split("T")[0] : "-",
        // NEW FIELDS
        item_id: entry?.item_id,
        modifier_id: entry?.modifier_id ?? "-",
        type: entry?.type ?? "-",
        unit: entry?.unit ?? "-",
        reference: entry?.reference ?? "-",
      })) || [],
    [data],
  );

  /* ----------------------------
     COLUMNS
  ----------------------------- */
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },

    { field: "store_name", headerName: "Store", width: 220 },

    { field: "item_name", headerName: "Item", width: 240 },

    {
      field: "quantity",
      headerName: "Quantity",
      width: 120,
      type: "number",
    },

    {
      field: "unit_price",
      headerName: "Unit Price",
      width: 120,
      valueFormatter: (value) => Number(value).toFixed(2),
    },

    { field: "item_id", headerName: "Item ID", width: 100 },

    { field: "modifier_id", headerName: "Modifier ID", width: 120 },

    {
      field: "type",
      headerName: "Type",
      width: 140,
      renderCell: (params) => (
        <span className="badge bg-info text-dark text-capitalize">
          {params.value}
        </span>
      ),
    },

    {
      field: "reference",
      headerName: "Reference",
      width: 140,
      renderCell: (params) => <span>{params.value}</span>,
    },

    { field: "unit", headerName: "Unit", width: 100 },

    {
      field: "total_value",
      headerName: "Total Value",
      width: 140,
      valueFormatter: (value) => Number(value).toFixed(2),
    },

    {
      field: "updated_by",
      headerName: "Updated By",
      width: 200,
    },

    {
      field: "created_at",
      headerName: "Created Date",
      width: 140,
    },

    {
      field: "action",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <div className="d-flex gap-2 align-items-center mt-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => openViewModal(params.row)}
          >
            <FeatherIcon icon="eye" size={16} />
          </button>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => openDeleteModal(params.row)}
          >
            <FeatherIcon icon="trash-2" size={16} />
          </button>
        </div>
      ),
    },
  ];

  /* ----------------------------
     CUSTOM FOOTER (TOTALS)
  ----------------------------- */
  const CustomFooter = () => {
    const filteredRowIds = useGridSelector(
      apiRef as any,
      gridFilteredSortedRowIdsSelector,
    );

    let totalQuantity = 0;
    let totalValue = 0;

    const rowsToCalculate =
      filteredRowIds.length > 0
        ? filteredRowIds
            .map((id) => itemsArray.find((r: any) => r.id === id))
            .filter(Boolean)
        : itemsArray;

    rowsToCalculate.forEach((row: any) => {
      totalQuantity += row.quantity || 0;
      totalValue += row.total_value || 0;
    });

    return (
      <Box>
        {/* Totals Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "48px",
            bgcolor: "#fafafa",
            borderTop: "1px solid #ddd",
            fontWeight: "bold",
            pl: 2,
          }}
        >
          <Box sx={{ width: 80 }} />

          <Box sx={{ width: 220 }}>TOTALS ({rowsToCalculate.length} items)</Box>

          <Box sx={{ width: 240 }} />

          <Box sx={{ width: 120, textAlign: "right", pr: 2 }}>
            QTY: {totalQuantity.toLocaleString()}
          </Box>

          <Box sx={{ width: 120 }} />

          <Box sx={{ width: 140, textAlign: "right", pr: 2 }}>
            VAL: {totalValue.toFixed(2)}
          </Box>

          <Box sx={{ width: 200 }} />
          <Box sx={{ width: 140 }} />
          <Box sx={{ width: 120 }} />
        </Box>

        {/* Default Pagination */}
        <GridFooter />
      </Box>
    );
  };

  /* ----------------------------
     EXPORT
  ----------------------------- */
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(itemsArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "inventory");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "item-adjustments.xlsx",
    );
  };

  /* ----------------------------
     RENDER
  ----------------------------- */
  return (
    <div>
      <div className="manage-top-bar gap-4 d-flex justify-content-end">
        <button
          className="btn btn-primary d-flex gap-2 h-fit  align-items-center"
          onClick={openAddModal}
        >
          <FeatherIcon icon="plus-square" size={18} /> <span>Adjust Item</span>
        </button>
        <button
          className="btn btn-primary d-flex gap-2 h-fit  align-items-center"
          onClick={handleExport}
        >
          <FeatherIcon icon="download" size={18} />
          <span>Export</span>
        </button>
      </div>

      {/* Table */}
      <Box sx={{ width: "100%", mt: 2 }}>
        <DataGrid
          apiRef={apiRef}
          rows={itemsArray}
          columns={columns}
          getRowId={(row) => row.id}
          pagination
          pageSizeOptions={[15, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 15 } },
          }}
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
            "& .MuiDataGrid-footerContainer": { p: 0, borderTop: "none" },
          }}
          slots={{
            footer: CustomFooter,
          }}
        />
      </Box>

      {/* View/Edit */}
      <ViewInventoryModal
        showViewModal={showViewModal}
        setShowViewModal={setShowViewModal}
        selectedRow={selectedRow}
      />

      {/* Delete */}
      <DeleteInventoryModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        selectedRow={selectedRow}
        openDeleteModal={openDeleteModal}
      />

      {/* Add */}
      <CreateInventoryModal
        store_id={store_id}
        show={showAddModal}
        setShow={setShowAddModal}
        items={items}
      />
    </div>
  );
}

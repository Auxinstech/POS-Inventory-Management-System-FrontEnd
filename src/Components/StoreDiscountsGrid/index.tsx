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
import CreateDiscountModal from "./Create";
import ViewDiscountModal from "./View";
import DeleteDiscountModal from "./Delete";
import { Col, Row } from "react-bootstrap";
import EditDiscountModal from "./Edit";
import { useAppDispatch, useAppSelector } from "../../Hook/hooks";
import { fetchDiscountList } from "../../Redux/Ducks/homeSlice";

export default function DiscountGrid({
  data,
  store_id,
  pagination,
}: {
  data: any;
  store_id: number;
  pagination?: any;
}) {
  const apiRef = useGridApiRef();

  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedRow, setSelectedRow] = useState<any>(null);

  const { settings } = useAppSelector((state) => state.Setting);
  const [currencySymbol, setCurrencySymbol] = useState<string>("");

  // Find currency symbol from the settings object
  React.useEffect(() => {
    if (settings.find((x) => x.key == "currency-symbol")?.value)
      setCurrencySymbol(
        settings.find((x) => x.key == "currency-symbol")?.value as any,
      );
  }, [settings]);

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

  const openEditModal = (row: any) => {
    setSelectedRow(row);
    setShowEditModal(true);
  };

  /* ----------------------------
     MAP API DATA → GRID ROWS
  ----------------------------- */
  const itemsArray = useMemo(
    () =>
      data?.map((entry: any) => ({
        id: entry?.id,
        store_name: entry?.store?.name ?? entry?.store_id ?? "-",
        discount_type: entry?.discount_type ?? "-",
        discount_mode: entry?.discount_mode ?? "-",
        discount_value:
          entry?.discount_mode === "percent"
            ? `${entry?.percentage ?? 0}%` // Show percentage with % sign
            : `${currencySymbol}${Number(entry?.amount ?? 0).toFixed(2)}`, // Show amount with currency
        percentage: entry?.percentage ?? "-",
        amount: entry?.amount
          ? `${currencySymbol}${Number(entry?.amount).toFixed(2)}`
          : "-",
        min_order_value: entry?.min_order_value
          ? `${currencySymbol}${Number(entry?.min_order_value).toFixed(2)}`
          : "-",
        max_discount: entry?.max_discount
          ? `${currencySymbol}${Number(entry?.max_discount).toFixed(2)}`
          : "-",
        start_date: entry?.start_date ?? "-",
        end_date: entry?.end_date ?? "-",
        start_time: entry?.start_time ?? "-",
        end_time: entry?.end_time ?? "-",
        is_active: entry?.is_active === 1,
        first_time_users_only: entry?.first_time_users_only === 1,
        postcode: entry?.postcode ?? "All",
        monday: entry?.monday === 1,
        tuesday: entry?.tuesday === 1,
        wednesday: entry?.wednesday === 1,
        thursday: entry?.thursday === 1,
        friday: entry?.friday === 1,
        saturday: entry?.saturday === 1,
        sunday: entry?.sunday === 1,
        days_available: [
          entry?.monday === 1 && "Mon",
          entry?.tuesday === 1 && "Tue",
          entry?.wednesday === 1 && "Wed",
          entry?.thursday === 1 && "Thu",
          entry?.friday === 1 && "Fri",
          entry?.saturday === 1 && "Sat",
          entry?.sunday === 1 && "Sun",
        ]
          .filter(Boolean)
          .join(", "),
        created_at: entry?.created_at ? entry?.created_at.split("T")[0] : "-",
        updated_at: entry?.updated_at ? entry?.updated_at.split("T")[0] : "-",
      })) || [],
    [data, currencySymbol],
  );

  /* ----------------------------
     COLUMNS
  ----------------------------- */
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "store_name", headerName: "Store", width: 180 },
    {
      field: "discount_type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => (
        <span className="badge bg-info text-capitalize">{params.value}</span>
      ),
    },
    {
      field: "discount_mode",
      headerName: "Mode",
      width: 120,
      renderCell: (params) => (
        <span className="badge bg-secondary text-capitalize">
          {params.value}
        </span>
      ),
    },
    { field: "discount_value", headerName: "Discount Value", width: 130 },
    { field: "min_order_value", headerName: "Min Order", width: 120 }, // Already formatted
    { field: "max_discount", headerName: "Max Discount", width: 120 }, // Already formatted
    { field: "start_date", headerName: "Start Date", width: 120 },
    { field: "end_date", headerName: "End Date", width: 120 },
    { field: "start_time", headerName: "Start Time", width: 100 },
    { field: "end_time", headerName: "End Time", width: 100 },
    {
      field: "is_active",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <span className={`badge bg-${params.value ? "success" : "danger"}`}>
          {params.value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "first_time_users_only",
      headerName: "First Time Only",
      width: 130,
      renderCell: (params) => (
        <span className={`badge bg-${params.value ? "warning" : "secondary"}`}>
          {params.value ? "Yes" : "No"}
        </span>
      ),
    },
    { field: "postcode", headerName: "Postcode", width: 100 },
    { field: "days_available", headerName: "Available Days", width: 200 },
    {
      field: "action",
      headerName: "Actions",
      width: 180,
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
            className="btn btn-sm btn-outline-secondary"
            onClick={() => openEditModal(params.row)}
          >
            <FeatherIcon icon="edit-2" size={16} />
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

  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    dispatch(
      fetchDiscountList({
        store_id,
        paginate: 1,
        search: searchTerm,
        per_page: pageSize,
        page: page + 1,
        sort_by: "id",
        sort: "desc",
      }),
    );
  };

  const handlePagination = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);

    dispatch(
      fetchDiscountList({
        store_id,
        paginate: 1,
        search: searchTerm,
        per_page: newPageSize,
        page: newPage + 1,
        sort_by: "id",
        sort: "desc",
      }),
    );
  };

  /* ----------------------------
     CUSTOM FOOTER (TOTALS)
  ----------------------------- */
  const CustomFooter = () => {
    const filteredRowIds = useGridSelector(
      apiRef as any,
      gridFilteredSortedRowIdsSelector,
    );

    let totalDiscounts = 0;
    let activeDiscounts = 0;
    let percentageDiscounts = 0;
    let amountDiscounts = 0;

    const rowsToCalculate =
      filteredRowIds.length > 0
        ? filteredRowIds
            .map((id) => itemsArray.find((r: any) => r.id === id))
            .filter(Boolean)
        : itemsArray;

    rowsToCalculate.forEach((row: any) => {
      totalDiscounts++;
      if (row.is_active) activeDiscounts++;
      if (row.discount_mode === "percentage") percentageDiscounts++;
      if (row.discount_mode === "amount") amountDiscounts++;
    });

    return (
      <div className="p-3 bg-light border-top">
        <GridFooter />
        <Row className="g-3">
          <Col md={3}>
            <div className="border rounded p-2 bg-white">
              <small className="text-muted d-block">Total Discounts</small>
              <strong className="fs-5">{totalDiscounts}</strong>
              <small className="text-muted d-block">
                Active: {activeDiscounts} | Inactive:{" "}
                {totalDiscounts - activeDiscounts}
              </small>
            </div>
          </Col>

          <Col md={3}>
            <div className="border rounded p-2 bg-white">
              <small className="text-muted d-block">
                Discount Type Breakdown
              </small>
              <div className="mt-1">
                <span className="badge bg-secondary">Percentage</span>
                <strong className="ms-2">{percentageDiscounts}</strong>
                <br />
                <span className="badge bg-info">Amount</span>
                <strong className="ms-2">{amountDiscounts}</strong>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="border rounded p-2 bg-white">
              <small className="text-muted d-block">Quick Stats</small>
              <div className="mt-1">
                <small>
                  First time only discounts:{" "}
                  <strong>
                    {
                      rowsToCalculate.filter(
                        (r: any) => r.first_time_users_only,
                      ).length
                    }
                  </strong>
                </small>
                <br />
                <small>
                  Postcode specific:{" "}
                  <strong>
                    {
                      rowsToCalculate.filter((r: any) => r.postcode !== "All")
                        .length
                    }
                  </strong>
                </small>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  /* ----------------------------
     EXPORT
  ----------------------------- */
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(itemsArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "discounts");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "discount-master.xlsx",
    );
  };

  /* ----------------------------
     RENDER
  ----------------------------- */
  return (
    <div>
      <div className="manage-top-bar gap-4 d-flex justify-content-between align-items-center">
        <div className="d-flex gap-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search discounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="btn btn-outline-primary d-flex gap-2 align-items-center"
            onClick={handleSearch}
          >
            <FeatherIcon icon="search" size={18} />
            <span>Search</span>
          </button>
        </div>
        <div className="d-flex gap-4">
          <button
            className="btn btn-primary d-flex gap-2 h-fit align-items-center"
            onClick={openAddModal}
          >
            <FeatherIcon icon="plus-square" size={18} />{" "}
            <span>Add Discount</span>
          </button>
          <button
            className="btn btn-primary d-flex gap-2 h-fit align-items-center"
            onClick={handleExport}
          >
            <FeatherIcon icon="download" size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <Box sx={{ width: "100%", mt: 2 }}>
        <DataGrid
          apiRef={apiRef}
          rows={itemsArray}
          columns={columns}
          getRowId={(row) => row.id}
          pagination
          pageSizeOptions={[10, 25, 50]}
          paginationMode="server"
          rowCount={pagination?.total ?? 0}
          onPaginationModelChange={(model) => {
            handlePagination(model.page, model.pageSize);
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
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
      <ViewDiscountModal
        showViewModal={showViewModal}
        setShowViewModal={setShowViewModal}
        selectedRow={selectedRow}
      />

      {/* Delete */}
      <DeleteDiscountModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        selectedRow={selectedRow}
      />

      {/* Add */}
      <CreateDiscountModal
        show={showAddModal}
        setShow={setShowAddModal}
        store_id={store_id}
      />

      {/* Edit  */}
      <EditDiscountModal
        selectedDiscount={selectedRow}
        show={showEditModal}
        setShow={setShowEditModal}
        store_id={store_id}
      />
    </div>
  );
}

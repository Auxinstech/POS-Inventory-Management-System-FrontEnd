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
import CreateCustomerModal from "./Create";
import ViewCustomerModal from "./View";
import DeleteCustomerModal from "./Delete";
import { Col, Row } from "react-bootstrap";
import EditCustomerModal from "./Edit";
import { fetchCustomerList } from "../../Redux/Ducks/customerSlice";
import { useAppDispatch, useAppSelector } from "../../Hook/hooks";

export default function StoreVendorMasterGrid({
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
        code: entry?.code ?? "-",
        name: entry?.name ?? "-",
        phone: entry?.phone ?? "-",
        email: entry?.email ?? "-",
        address: entry?.address ?? "-",
        city: entry?.city ?? "-",
        country: entry?.country ?? "-",
        type: entry?.type ?? "-",
        credit_limit: entry?.credit_limit ?? 0,
        balance: entry?.balance ?? 0,
        status: entry?.status ?? false,
        store_id: entry?.store_id ?? "-",
        created_at: entry?.created_at ? entry?.created_at.split("T")[0] : "-",
        updated_at: entry?.updated_at ? entry?.updated_at.split("T")[0] : "-",
      })) || [],
    [data],
  );

  /* ----------------------------
     COLUMNS
  ----------------------------- */
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },

    { field: "code", headerName: "Customer Code", width: 140 },

    { field: "name", headerName: "Customer Name", width: 180 },

    { field: "phone", headerName: "Phone", width: 150 },

    { field: "email", headerName: "Email", width: 220 },

    { field: "address", headerName: "Address", width: 200 },

    { field: "city", headerName: "City", width: 130 },

    { field: "country", headerName: "Country", width: 120 },

    {
      field: "type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => (
        <span
          className={`badge bg-${params.value === "retail" ? "info" : params.value === "wholesale" ? "primary" : "secondary"} text-capitalize`}
        >
          {params.value}
        </span>
      ),
    },

    {
      field: "credit_limit",
      headerName: "Credit Limit",
      width: 130,
      type: "number",
      valueFormatter: (value) => `$${Number(value).toFixed(2)}`,
    },

    {
      field: "balance",
      headerName: "Balance",
      width: 120,
      type: "number",
      valueFormatter: (value) => `$${Number(value).toFixed(2)}`,
      renderCell: (params) => (
        <span className={params.value > 0 ? "text-danger" : "text-success"}>
          ${Number(params.value).toFixed(2)}
        </span>
      ),
    },

    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params) => (
        <span className={`badge bg-${params.value ? "success" : "danger"}`}>
          {params.value ? "Active" : "Inactive"}
        </span>
      ),
    },

    { field: "store_id", headerName: "Store ID", width: 100 },

    {
      field: "action",
      headerName: "Actions",
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <div className="d-flex gap-2 align-items-center  mt-2">
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
    // Implement your search logic here
    console.log("Searching for:", searchTerm);
    // Example: filter customers list based on searchTerm
    dispatch(
      fetchCustomerList({
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
      fetchCustomerList({
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

    let totalCustomers = 0;
    let totalCreditLimit = 0;
    let totalBalance = 0;
    let activeCustomers = 0;
    let retailCustomers = 0;
    let wholesaleCustomers = 0;
    let corporateCustomers = 0;

    const rowsToCalculate =
      filteredRowIds.length > 0
        ? filteredRowIds
            .map((id) => itemsArray.find((r: any) => r.id === id))
            .filter(Boolean)
        : itemsArray;

    rowsToCalculate.forEach((row: any) => {
      totalCustomers++;
      totalCreditLimit += Number(row.credit_limit) || 0;
      totalBalance += Number(row.balance) || 0;

      if (row.status) activeCustomers++;
      if (row.type === "retail") retailCustomers++;
      if (row.type === "wholesale") wholesaleCustomers++;
      if (row.type === "corporate") corporateCustomers++;
    });

    const totalOutstanding = totalBalance;
    const availableCredit = totalCreditLimit - totalBalance;

    return (
      <div className="p-3 bg-light border-top">
        <GridFooter />
        <Row className="g-3">
          <Col md={3}>
            <div className="border rounded p-2 bg-white">
              <small className="text-muted d-block">Total Customers</small>
              <strong className="fs-5">{totalCustomers}</strong>
              <small className="text-muted d-block">
                Active: {activeCustomers} | Inactive:{" "}
                {totalCustomers - activeCustomers}
              </small>
            </div>
          </Col>

          <Col md={3}>
            <div className="border rounded p-2 bg-white">
              <small className="text-muted d-block">Total Credit Limit</small>
              <strong className="fs-5 text-primary">
                {currencySymbol}
                {totalCreditLimit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </Col>

          <Col md={3}>
            <div className="border rounded p-2 bg-white">
              <small className="text-muted d-block">
                Total Outstanding Balance
              </small>
              <strong
                className={`fs-5 ${totalBalance > 0 ? "text-danger" : "text-success"}`}
              >
                {currencySymbol}
                {totalBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </Col>

          <Col md={3}>
            <div className="border rounded p-2 bg-white">
              <small className="text-muted d-block">Available Credit</small>
              <strong className="fs-5 text-info">
                {currencySymbol}
                {availableCredit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </Col>

          {(retailCustomers > 0 ||
            wholesaleCustomers > 0 ||
            corporateCustomers > 0) && (
            <Col md={12}>
              <div className="border rounded p-2 bg-white">
                <small className="text-muted d-block mb-2">
                  Customer Type Breakdown
                </small>
                <div className="d-flex gap-4">
                  {retailCustomers > 0 && (
                    <div>
                      <span className="badge bg-info">Retail</span>
                      <strong className="ms-2">{retailCustomers}</strong>
                      <small className="text-muted ms-1">
                        ({((retailCustomers / totalCustomers) * 100).toFixed(1)}
                        %)
                      </small>
                    </div>
                  )}
                  {wholesaleCustomers > 0 && (
                    <div>
                      <span className="badge bg-primary">Wholesale</span>
                      <strong className="ms-2">{wholesaleCustomers}</strong>
                      <small className="text-muted ms-1">
                        (
                        {((wholesaleCustomers / totalCustomers) * 100).toFixed(
                          1,
                        )}
                        %)
                      </small>
                    </div>
                  )}
                  {corporateCustomers > 0 && (
                    <div>
                      <span className="badge bg-secondary">Corporate</span>
                      <strong className="ms-2">{corporateCustomers}</strong>
                      <small className="text-muted ms-1">
                        (
                        {((corporateCustomers / totalCustomers) * 100).toFixed(
                          1,
                        )}
                        %)
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          )}
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "inventory");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "customer-master.xlsx",
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
            placeholder="Search customers..."
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
            <span>Add Customer</span>
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
      <ViewCustomerModal
        showViewModal={showViewModal}
        setShowViewModal={setShowViewModal}
        selectedRow={selectedRow}
      />

      {/* Delete */}
      <DeleteCustomerModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        selectedRow={selectedRow}
      />

      {/* Add */}
      <CreateCustomerModal
        show={showAddModal}
        setShow={setShowAddModal}
        store_id={store_id}
      />

      {/* Edit  */}
      <EditCustomerModal
        selectedCustomer={selectedRow}
        show={showEditModal}
        setShow={setShowEditModal}
        store_id={store_id}
      />
    </div>
  );
}

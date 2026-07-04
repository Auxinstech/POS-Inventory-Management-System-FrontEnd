import ReportsGrid from "Components/ReportsGrid";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { useEffect, useState } from "react";
import { Form, FormGroup } from "react-bootstrap";
import { fetchReports } from "../../Redux/Ducks/reportSlice";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FeatherIcon from "feather-icons-react";

const StoreReport: React.FC = () => {
  const dispatch = useAppDispatch();

  const [searchText, setSearchText] = useState<string>("");

  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const report_summary = useAppSelector((x) => x.report.reports);
  const user_stores = useAppSelector((x) => x.User.user.stores);

  const filterStores = report_summary
    .map((x) => {
      const store = user_stores.find((y) => y.id === x.store_id);
      if (!store) return null;
      return {
        ...x,
        store_name: store.name,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null); // type guard for TS

  const filteredItems = filterStores.filter((item) =>
    item.store.name.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    dispatch(
      fetchReports({
        from_date: fromDate,
        to_date: toDate,
      })
    );
  }, []);

  const handleSubmit = () => {
    dispatch(
      fetchReports({
        from_date: fromDate,
        to_date: toDate,
      })
    );
  };

  const handleExport = () => {
    const headers = filteredItems.map(({ store, ...rest }) => rest);
    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(headers);

    // Create a new workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "report");

    worksheet["!cols"] = [
      { wch: 12 }, // A total
      { wch: 16 }, // B service_charges
      { wch: 16 }, // C delivery_charges
      { wch: 12 }, // D orders_count
      { wch: 12 }, // D orders_count
      { wch: 30 }, // E store_name
    ];

    // const lastRow = filteredItems.length + 5;

    // // Label in column E (after numeric columns)
    // worksheet[`E${lastRow}`] = { t: "s", v: "TOTAL" };

    // // Total for "total" (col A)
    // worksheet[`A${lastRow}`] = { f: `SUM(A2:A${lastRow - 1})` };

    // // Total for "service_charges" (col B)
    // worksheet[`B${lastRow}`] = { f: `SUM(B2:B${lastRow - 1})` };

    // // Total for "delivery_charges" (col C)
    // worksheet[`C${lastRow}`] = { f: `SUM(C2:C${lastRow - 1})` };

    // // Update range to include totals row
    // worksheet["!ref"] = `A1:L${lastRow}`;

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save as file
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "export_data.xlsx");
  };

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="manage-top-bar ">
          <div className="d-flex gap-2 justify-content-end w-100">
            {/* <Form.Control
              type="text"
              placeholder="Search by store name"
              className="flex-grow-1"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            /> */}
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
            <button className="btn  btn-primary" onClick={handleExport}>
              <FeatherIcon icon="download" size={20} /> Export
            </button>
          </div>
        </div>

        <div className="p-2">
          <ReportsGrid items={filteredItems} />
        </div>
      </div>
    </div>
  );
};

export default StoreReport;

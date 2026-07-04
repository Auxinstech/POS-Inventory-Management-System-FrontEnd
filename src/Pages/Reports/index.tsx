import { useSearchParams } from "react-router-dom";
import StoreDetailedReport from "./StoreDetailedReport";
import StoreReport from "./StoreReport";

const Reports: React.FC = () => {
  const [searchParams] = useSearchParams();
  const storeIdParam = searchParams.get("store_id");

  return storeIdParam ? <StoreDetailedReport /> : <StoreReport />;
};

export default Reports;

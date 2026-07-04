import React from "react";
import FeatherIcon from "feather-icons-react";
import { useLocation, useNavigate } from "react-router-dom";

const RefreshButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleRefresh = () => {
    // navigate(location.pathname, { replace: true });

    navigate(0);
    // window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      className="btn p-0 border-0 bg-transparent"
    >
      <FeatherIcon
        icon="refresh-cw"
        size={20}
        className="text-warning mr-2 pr-2
      "
      />
    </button>
  );
};

export default RefreshButton;

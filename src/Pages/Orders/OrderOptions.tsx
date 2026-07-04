import { useState, useRef, useEffect } from "react";
import FeatherIcon from "feather-icons-react";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import {
  clearActiveOrder,
  getOrders,
  removeOrder,
} from "../../Redux/Ducks/orderSlice";
import { useUserPermissions } from "Hook/permissions";
import { formatSave } from "Utils/date-formate";

export default function OrderOptions({ order_id }: { order_id: number }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const hasPermissions = useUserPermissions();
  const selected_store = useAppSelector((x) => x.Home.selected_store);
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteOrder = async () => {
    dispatch(
      removeOrder(order_id, {
        onSuccess: () => {
          const today = new Date();
          const day = formatSave(today);
          const storeId = Number(selected_store);
          dispatch(getOrders({ store_id: storeId, day }));
          dispatch(clearActiveOrder());
          setOpen(false);
        },
      })
    );
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div
        className="active-order-option d-inline-flex align-items-center mt-1"
        style={{ fontSize: "14px", cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      >
        <FeatherIcon
          icon="more-vertical"
          size={20}
          className="me-1 flex-shrink-0"
        />
        <span>Options</span>
      </div>

      <ul
        className={`dropdown-menu ${open ? "show" : ""}`}
        style={{ position: "absolute" }}
      >
        {hasPermissions.some((p) => p.name === "manage-delete-order") && (
          <li>
            <button
              className="dropdown-item text-danger"
              onClick={handleDeleteOrder}
            >
              Delete Order
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

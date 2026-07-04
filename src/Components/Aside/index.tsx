import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../Redux/Ducks/userSlice";
import FeatherIcon, { Share2 } from "feather-icons-react";
import { getUserPhoto } from "Base/Methods";
import { resetBooking, resetMenu } from "../../Redux/Ducks/homeSlice";
import { Button } from "react-bootstrap";
import { useUserPermissions } from "Hook/permissions";
import storage from "Utils/storage";

const Aside = () => {
  const dispatch = useAppDispatch();
  const selected_store = useAppSelector((x) => x.Home.selected_store);
  const user = useAppSelector((x) => x.User.user);
  const user_permissions = useUserPermissions();

  const location = useLocation();
  const navigate = useNavigate();

  const IsActive = (id: string) => {
    let activePath = location.pathname.replace(/\//g, "");

    if (id == activePath) return true;
    else return false;
  };

  const clickHandler = (id: string) => {
    if (
      id == "" ||
      id == "orders" ||
      id == "menu" ||
      id == "settings" ||
      id == "manage" ||
      id == "reports" ||
      id == "invoice-and-payment" ||
      id == "inventory" ||
      id == "customers" ||
      id == "vendors"
    ) {
      navigate("/" + id);
    } else if (id == "logOut") {
      navigate("");
      setTimeout(() => {
        dispatch(logoutUser());
        storage.clear();
      }, 10);
    }
  };

  const hasPermission = (permissionName: string) =>
    user_permissions.some((perm) => perm.name === permissionName);

  return (
    <div className="aside">
      <div className="aside-nav">
        {/* <div className={classNames("aside-item", { active: IsActive("") })} onClick={() => { clickHandler("") }}>
                    <FeatherIcon icon="home" size={18} />
                    <span>Home</span>
                </div> */}
        {selected_store && (
          <>
            <div
              className={classNames("aside-item", {
                active: IsActive("orders"),
              })}
              onClick={() => {
                clickHandler("orders");
              }}
            >
              <FeatherIcon icon="shopping-bag" size={18} />
              <span>Orders</span>
            </div>

            {hasPermission("manage-menus") && (
              <div
                className={classNames("aside-item", {
                  active: IsActive("menu"),
                })}
                onClick={() => {
                  clickHandler("menu");
                  // dispatch(resetBooking());
                  dispatch(resetMenu());
                }}
              >
                <FeatherIcon icon="home" size={18} />
                <span>Menu</span>
              </div>
            )}

            {hasPermission("manage-reports") && (
              <div
                className={classNames("aside-item", {
                  active: IsActive("reports"),
                })}
                onClick={() => {
                  clickHandler("reports");
                }}
              >
                <FeatherIcon icon="clipboard" size={18} />
                <span>Reports</span>
              </div>
            )}

            {hasPermission("manage-invoice-and-payment") && (
              <div
                className={classNames("aside-item", {
                  active: IsActive("invoice-and-payment"),
                })}
                onClick={() => {
                  clickHandler("invoice-and-payment");
                }}
              >
                <FeatherIcon icon="credit-card" size={18} />
                <span className="text-wrap">Invoice</span>
              </div>
            )}

            {hasPermission("manage-invoice-and-payment") && (
              <div
                className={classNames("aside-item", {
                  active: IsActive("inventory"),
                })}
                onClick={() => {
                  clickHandler("inventory");
                }}
              >
                <FeatherIcon icon="shopping-cart" size={18} />
                <span className="text-wrap">Inventory</span>
              </div>
            )}

            {hasPermission("manage-customers") && (
              <div
                className={classNames("aside-item", {
                  active: IsActive("customers"),
                })}
                onClick={() => {
                  clickHandler("customers");
                }}
              >
                <FeatherIcon icon="users" size={18} />
                <span className="text-wrap">Customers</span>
              </div>
            )}

            {hasPermission("manage-vendors") && (
              <div
                className={classNames("aside-item", {
                  active: IsActive("vendors"),
                })}
                onClick={() => {
                  clickHandler("vendors");
                }}
              >
                <FeatherIcon icon="share-2" size={18} />
                <span className="text-wrap">Vendors</span>
              </div>
            )}

            {hasPermission("manage-manage") && (
              <div
                className={classNames("aside-item", {
                  active: IsActive("manage"),
                })}
                onClick={() => {
                  clickHandler("manage");
                }}
              >
                <FeatherIcon icon="tool" size={18} />
                <span>Manage</span>
              </div>
            )}

            {hasPermission("manage-manage") && (
              <div
                className={classNames("aside-item", {
                  active: IsActive("settings"),
                })}
                onClick={() => {
                  clickHandler("settings");
                }}
              >
                <FeatherIcon icon="settings" size={18} />
                <span>Settings</span>
              </div>
            )}
          </>
        )}
        {/* <img
          className="aside-user-img"
          src={getUserPhoto((user as any)?.image)}
          alt=""
        />

        <div
          className="aside-item"
          onClick={() => {
            clickHandler("logOut");
          }}
        >
          <FeatherIcon icon="power" size={18} />
          <span>Log Out</span>
        </div> */}
      </div>
    </div>
  );
};

export default Aside;

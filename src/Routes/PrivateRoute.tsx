import { useAppDispatch, useAppSelector } from "Hook/hooks";
import {
  getCategories,
  getStores,
  setSelectedStore,
} from "../Redux/Ducks/homeSlice";
import { getActiveStore, getTokens } from "Utils/auth";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  getUserBasicData,
  setRoles,
  setStores,
  setUserDetails,
  setUserID,
} from "../Redux/Ducks/userSlice";
import { getStoreSettings } from "../Redux/Ducks/settingSlice";
import storage from "Utils/storage";
import "./../App.css";
import { fetchPermissionList, fetchRoleList } from "../Redux/Ducks/rpSlice";
import { fetchUserList } from "../Redux/Ducks/UsersSlice";
import { toggleLoader } from "../Redux/Ducks/loaderSlice";

export const PrivateRoute = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = getTokens().AccessToken;
  const activeStore = getActiveStore().ActiveStore;

  const stores_loaded = useAppSelector((x) => x.Home.stores_loaded);
  const selected_store = useAppSelector((x) => x.Home.selected_store);
  const categories_loaded = useAppSelector((x) => x.Home.categories_loaded);
  const setting_loaded = useAppSelector((x) => x.Setting.setting_loaded);
  const userID = useAppSelector((x) => x.User.user.id);
  const roles = useAppSelector((x) => x.User.user.roles);
  const stores = useAppSelector((x) => x.User.user.stores);

  const roles_list = useAppSelector((x) => x.rp.roles);
  const permissions_list = useAppSelector((x) => x.rp.permissions);
  const user = useAppSelector((x) => x.User.user);
  const users = useAppSelector((x) => x.Users.users);

  // useEffect(() => {
  //   if (!stores_loaded && token) dispatch(getStores());

  //   if (!categories_loaded && selected_store) {
  //     dispatch(toggleLoader(true));
  //     dispatch(getCategories(selected_store));
  //     dispatch(toggleLoader(false));
  //   }

  //   if (!setting_loaded && selected_store) {
  //     dispatch(getStoreSettings(selected_store));
  //   }
  // }, [categories_loaded, selected_store, setting_loaded, stores_loaded, token]);

  useEffect(() => {
    if (token && !stores_loaded) {
      dispatch(getStores());
    }
  }, [token, stores_loaded]);

  useEffect(() => {
    if (selected_store) {
      if (!categories_loaded) {
        dispatch(getCategories(selected_store));
      }
      if (!setting_loaded) {
        dispatch(getStoreSettings(selected_store));
      }
    }
  }, [selected_store, categories_loaded, setting_loaded]);

  useEffect(() => {
    //  If userID in Redux is 0 but stored in localStorage
    if (userID === 0) {
      const storedUserID = storage.get("UserID");
      if (typeof storedUserID === "number" && storedUserID > 0) {
        dispatch(setUserID(storedUserID));
      }
    }
  }, [userID]);

  useEffect(() => {
    if (roles.length === 0) {
      const storedRoles = storage.get("roles");
      if (Array.isArray(storedRoles) && storedRoles.length > 0) {
        dispatch(setRoles(storedRoles));
      }
    }
  }, [roles]);

  useEffect(() => {
    if (stores.length === 0) {
      const storedstores = storage.get("stores");
      if (Array.isArray(storedstores) && storedstores.length > 0) {
        dispatch(setStores(storedstores));
      }
    }
  }, [stores]);

  useEffect(() => {
    if (roles_list.length > 0) return;
    dispatch(fetchRoleList());
  }, []);

  useEffect(() => {
    if (permissions_list.length > 0) return;
    dispatch(fetchPermissionList());
  }, []);

  useEffect(() => {
    if (!user.email && !user.name) {
      const storedName = storage.get("name");
      const storedEmail = storage.get("email");
      dispatch(setUserDetails({ name: storedName, email: storedEmail }));
    }
  }, [user.email, user.name]);

  useEffect(() => {
    if (token) {
      if (activeStore) {
        dispatch(setSelectedStore(activeStore));
        if (location.pathname == "/") navigate("/orders");
      } else {
        navigate("/");
      }
    }
  }, []);

  useEffect(() => {
    if (users.length > 0) return;
    dispatch(fetchUserList());
  }, []);

  if (!token) return <Navigate to="/login" replace />;

  return <Outlet />;
};

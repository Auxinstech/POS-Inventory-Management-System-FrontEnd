import { AnyAction, combineReducers } from "@reduxjs/toolkit";
import { routerReducer } from "../../Utils/history";
import HomeReducer from "./homeSlice";
import SettingReducer from "./settingSlice";
import ToastReducer from "./toastSlice";
import LoaderReducer from "./loaderSlice";
import OrderReducer from "./orderSlice";
import BeepSoundReducer from "./beepSlice";
import UserSliceReducer from "./UsersSlice";
import rolePermissionSlice from "./rpSlice";
import ReportReducer from "./reportSlice";
import UserReducer, { logoutUser } from "./userSlice";
import pusherSlice from "./pusherSlice";
import manageSlice from "./manageSlice";
import customerSlice from "./customerSlice";
import vendorSlice from "./vendorSlice";
const reducer = {
  User: UserReducer,
  Home: HomeReducer,
  Setting: SettingReducer,
  Toast: ToastReducer,
  Loader: LoaderReducer,
  Order: OrderReducer,
  Beep: BeepSoundReducer,
  Users: UserSliceReducer,
  rp: rolePermissionSlice,
  report: ReportReducer,
  pusher: pusherSlice,
  manage: manageSlice,
  customer: customerSlice,
  vendor: vendorSlice,
};

const appReducer = combineReducers({
  ...reducer,
  router: routerReducer,
});

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: AnyAction,
) => {
  if (action.type === logoutUser.type) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export default rootReducer;

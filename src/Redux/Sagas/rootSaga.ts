import {
  all,
  cancel,
  fork,
  join,
  take,
  takeLatest,
  takeLeading,
} from "redux-saga/effects";
import { loginUser, logoutUser, verifyUser } from "../../Redux/Ducks/userSlice";
import {
  handleLoginUser,
  handleLogOutUser,
  handleVerifyUser,
} from "./Handlers/user";
import {
  createDiscount,
  deleteDiscount,
  fetchDiscountList,
  getCategories,
  getStores,
  LinkModifierGroup,
  removeCategory,
  removeItem,
  removeModifier,
  removeModifierGroup,
  saveBooking,
  saveCategory,
  saveItem,
  saveModifier,
  saveModifierGroup,
  unlinkModifierGroup,
  updateBooking,
  updateCategory,
  updateDiscount,
  updateItem,
  updateModifier,
  updateModifierGroup,
  updateModifierGroupSort,
} from "../../Redux/Ducks/homeSlice";
import {
  handleRemoveCategory,
  handleGetCategories,
  handleGetStores,
  handleSaveBooking,
  handleSaveCategory,
  handleSaveItem,
  handleSaveModifierGroup,
  handleUpdateCategory,
  handleUpdateItem,
  handleRemoveItem,
  handleUpdateModifierGroup,
  handleRemoveModifierGroup,
  handleSaveModifier,
  handleUpdateModifier,
  handleRemoveModifier,
  handleUnlinkModifierGroup,
  handleUpdateModifierGroupSort,
  handleLinkModifierGroup,
  handleUpdateBooking,
  handleFetchDiscounts,
  handleCreateDiscount,
  handleUpdateDiscount,
  handleDeleteDiscount,
} from "./Handlers/home";
import {
  changeSetting,
  deleteDeliveryConfiguration,
  getStoreSettings,
  saveDeliveryConfiguration,
  TestMqtt,
  updateDeliveryConfiguration,
} from "../../Redux/Ducks/settingSlice";
import {
  handleChangeSetting,
  handleDeleteDeliveryConfiguration,
  handleGetStoreSettings,
  handleSaveDeliveryConfiguration,
  handleTestMqtt,
  handleUpdateDeliveryConfiguration,
} from "./Handlers/setting";
import {
  assignRider,
  getOrders,
  getOrdersByID,
  getOrdersReport,
  printOrder,
  removeOrder,
  updateOrderStatus,
} from "../../Redux/Ducks/orderSlice";
import {
  handleAssignRider,
  handleGetOrders,
  handleGetOrdersByID,
  handleGetReportOrders,
  handlePrintOrder,
  handleRemoveOrder,
  handleUpdateOrderStatus,
} from "./Handlers/order";
import {
  handleCreateUsers,
  handleDeleteUser,
  handleFetchUsers,
  handleUpdateUser,
} from "./Handlers/users";
import {
  createUser,
  deleteUser,
  fetchUserList,
  updateUser,
} from "../../Redux/Ducks/UsersSlice";
import {
  handleCreatePermission,
  handleCreateRole,
  handleDeletePermission,
  handleDeleteRole,
  handleFetchPermissions,
  handleFetchRoles,
  handleUpdatePermission,
  handleUpdateRole,
} from "./Handlers/rolesPermission";
import {
  createPermission,
  createRole,
  deletePermission,
  deleteRole,
  fetchPermissionList,
  fetchRoleList,
  updatePermission,
  updateRole,
} from "../../Redux/Ducks/rpSlice";
import {
  addInventoryTranscations,
  deleteInventoryTranscations,
  fetchDetailedReport,
  fetchInventoryTranscations,
  fetchInvoiceSummary,
  fetchReports,
  fetchStripeReport,
  setGenerateInvoice,
  setMarkasPaid,
} from "../../Redux/Ducks/reportSlice";
import {
  handleAddInventoryTranscations,
  handleDeleteInventoryTranscations,
  handleFetchDetailedReport,
  handleFetchInventoryTranscations,
  handleFetchInvoiceSummary,
  handleFetchStripeReport,
  handleFetcReports,
  handleGenerateInvoice,
  handleMarkInvoicePaid,
} from "./Handlers/report";
import {
  handleCreateCustomer,
  handleDeleteCustomer,
  handleFetchCustomers,
  handleUpdateCustomer,
} from "./Handlers/customer";
import {
  createCustomer,
  deleteCustomer,
  fetchCustomerList,
  updateCustomer,
} from "../../Redux/Ducks/customerSlice";
import {
  handleCreateVendor,
  handleDeleteVendor,
  handleFetchVendors,
  handleUpdateVendor,
} from "./Handlers/vendor";
import {
  createVendor,
  deleteVendor,
  fetchVendorList,
  updateVendor,
} from "../../Redux/Ducks/vendorSlice";

export function* watcherSaga() {
  yield all([
    takeLatest(verifyUser.type, handleVerifyUser),
    takeLatest(loginUser.type, handleLoginUser),
    takeLatest(logoutUser.type, handleLogOutUser),

    takeLatest(fetchUserList.type, handleFetchUsers),
    takeLatest(createUser.type, handleCreateUsers),
    takeLatest(updateUser.type, handleUpdateUser),
    takeLatest(deleteUser.type, handleDeleteUser),

    takeLatest(fetchRoleList.type, handleFetchRoles),
    takeLatest(createRole.type, handleCreateRole),
    takeLatest(updateRole.type, handleUpdateRole),
    takeLatest(deleteRole.type, handleDeleteRole),

    takeLatest(fetchPermissionList.type, handleFetchPermissions),
    takeLatest(createPermission.type, handleCreatePermission),
    takeLatest(updatePermission.type, handleUpdatePermission),
    takeLatest(deletePermission.type, handleDeletePermission),

    takeLatest(getStores.type, handleGetStores),

    takeLatest(getCategories.type, handleGetCategories),
    takeLatest(saveCategory.type, handleSaveCategory),
    takeLatest(updateCategory.type, handleUpdateCategory),
    takeLatest(removeCategory.type, handleRemoveCategory),

    takeLatest(saveItem.type, handleSaveItem),
    takeLatest(updateItem.type, handleUpdateItem),
    takeLatest(removeItem.type, handleRemoveItem),

    takeLatest(saveModifierGroup.type, handleSaveModifierGroup),
    takeLatest(updateModifierGroup.type, handleUpdateModifierGroup),
    takeLatest(updateModifierGroupSort.type, handleUpdateModifierGroupSort),

    takeLatest(removeModifierGroup.type, handleRemoveModifierGroup),
    takeLatest(unlinkModifierGroup.type, handleUnlinkModifierGroup),
    takeLatest(LinkModifierGroup.type, handleLinkModifierGroup),

    takeLatest(saveModifier.type, handleSaveModifier),
    takeLatest(updateModifier.type, handleUpdateModifier),
    takeLatest(removeModifier.type, handleRemoveModifier),

    takeLatest(saveBooking.type, handleSaveBooking),
    takeLatest(updateBooking.type, handleUpdateBooking),

    takeLatest(getStoreSettings.type, handleGetStoreSettings),

    takeLatest(saveDeliveryConfiguration.type, handleSaveDeliveryConfiguration),
    takeLatest(
      updateDeliveryConfiguration.type,
      handleUpdateDeliveryConfiguration,
    ),
    takeLatest(
      deleteDeliveryConfiguration.type,
      handleDeleteDeliveryConfiguration,
    ),

    takeLatest(getOrders.type, handleGetOrders),
    takeLatest(removeOrder.type, handleRemoveOrder),

    takeLatest(updateOrderStatus.type, handleUpdateOrderStatus),
    takeLatest(assignRider.type, handleAssignRider),

    takeLatest(printOrder.type, handlePrintOrder),

    takeLatest(changeSetting.type, handleChangeSetting),

    takeLatest(fetchReports.type, handleFetcReports),
    takeLatest(getOrdersByID.type, handleGetOrdersByID),
    takeLatest(getOrdersReport.type, handleGetReportOrders),
    takeLatest(fetchInvoiceSummary.type, handleFetchInvoiceSummary),
    takeLatest(setMarkasPaid.type, handleMarkInvoicePaid),
    takeLatest(setGenerateInvoice.type, handleGenerateInvoice),
    takeLatest(fetchDetailedReport.type, handleFetchDetailedReport),
    takeLatest(
      fetchInventoryTranscations.type,
      handleFetchInventoryTranscations,
    ),

    takeLatest(
      deleteInventoryTranscations.type,
      handleDeleteInventoryTranscations,
    ),

    takeLatest(addInventoryTranscations.type, handleAddInventoryTranscations),

    takeLatest(TestMqtt.type, handleTestMqtt),

    takeLatest(fetchCustomerList.type, handleFetchCustomers),
    takeLatest(createCustomer.type, handleCreateCustomer),
    takeLatest(updateCustomer.type, handleUpdateCustomer),
    takeLatest(deleteCustomer.type, handleDeleteCustomer),

    takeLatest(fetchVendorList.type, handleFetchVendors),
    takeLatest(createVendor.type, handleCreateVendor),
    takeLatest(updateVendor.type, handleUpdateVendor),
    takeLatest(deleteVendor.type, handleDeleteVendor),

    takeLatest(fetchDiscountList.type, handleFetchDiscounts),
    takeLatest(createDiscount.type, handleCreateDiscount),
    takeLatest(updateDiscount.type, handleUpdateDiscount),
    takeLatest(deleteDiscount.type, handleDeleteDiscount),

    takeLatest(fetchStripeReport.type, handleFetchStripeReport),
  ]);
}

// const takeLatestByGroup = (patternOrChannel: string, saga: any, groupOn: string, ...args: any[]) => fork(function* (): any {
//   // hold a reference to each forked saga identified by the type property
//   const groupOnArray = groupOn.split(",").map(x => x.trim());
//   let lastTasks: any = {};

//   while (true) {
//     const action = yield take(patternOrChannel);

//     const groupOnValue = groupOnArray.map(x => action.payload[x]).join("-");

//     // if there is a forked saga running with the same type, cancel it.
//     if (lastTasks[groupOnValue]) {
//       yield cancel(lastTasks[groupOnValue]);
//     }

//     lastTasks[groupOnValue] = yield fork(saga, ...args.concat(action));
//   }

// });

// const takeEveryInQueueByGroup = (patternOrChannel: string, saga: any, groupOn: string, ...args: any[]) => fork(function* (): any {
//   const groupOnArray = groupOn.split(",").map(x => x.trim());
//   let lastRunningTasks: any = {};
//   let queueTasks: any = {};

//   function* RunProcess(groupOnValue: string, ...actions: any[]): any {

//     lastRunningTasks[groupOnValue] = yield fork(saga, ...actions);

//     const res = yield join(lastRunningTasks[groupOnValue]);

//     if (queueTasks[groupOnValue]?.length) {
//       const nextAction = queueTasks[groupOnValue].splice(0, 1);
//       yield fork(RunProcess, groupOnValue, ...args.concat(nextAction));
//     }
//   }

//   while (true) {
//     const action = yield take(patternOrChannel);

//     const groupOnValue = groupOnArray.map(x => action.payload[x]).join("-");

//     if (lastRunningTasks[groupOnValue] && lastRunningTasks[groupOnValue].isRunning()) {
//       if (!queueTasks[groupOnValue])
//         queueTasks[groupOnValue] = [];

//       queueTasks[groupOnValue].push(action);
//     }
//     else {
//       yield fork(RunProcess, groupOnValue, ...args.concat(action))
//     }

//   }

// });

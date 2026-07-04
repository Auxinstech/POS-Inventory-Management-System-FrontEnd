// API Requests file (e.g., vendors.ts)
import { get, post, put, remove } from "../../../Utils/axios";
import {
  IVendorCreatePayload,
  IVendorsListParams,
} from "../../Ducks/vendorSlice";

export const requestVendorsList = (params?: IVendorsListParams) => {
  return get("/vendors", { params });
};

export const requestCreateVendor = (data: IVendorCreatePayload) => {
  return post("/vendors", data);
};

export const requestUpdateVendor = ({
  id,
  data,
}: {
  id: number;
  data: Partial<IVendorCreatePayload>;
}) => {
  return put(`/vendors/${id}`, data);
};

export const requestDeleteVendor = (id: number) => {
  return remove(`/vendors/${id}`);
};

export const requestGetVendorById = (id: number) => {
  return get(`/vendors/${id}`);
};

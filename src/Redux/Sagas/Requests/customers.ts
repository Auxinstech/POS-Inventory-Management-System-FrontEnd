import { get, post, put, remove } from "../../../Utils/axios";
import {
  ICustomerCreatePayload,
  ICustomersListParams,
} from "../../Ducks/customerSlice";

export const requestCustomersList = (params?: ICustomersListParams) => {
  return get("/customers", { params });
};

export const requestCreateCustomer = (data: ICustomerCreatePayload) => {
  return post("/customers", data);
};

export const requestUpdateCustomer = ({
  id,
  data,
}: {
  id: number;
  data: Partial<ICustomerCreatePayload>;
}) => {
  return put(`/customers/${id}`, data);
};

export const requestDeleteCustomer = (id: number) => {
  return remove(`/customers/${id}`);
};

export const requestGetCustomerById = (id: number) => {
  return get(`/customers/${id}`);
};

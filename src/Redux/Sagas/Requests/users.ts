import { IUserCreatePayload, IUser } from "../../Ducks/UsersSlice";
import { get, post, remove, put } from "../../../Utils/axios";

let usersController: AbortController | null = null;

// export function requestUsersList(): any {
//   return get("users");
// }

export const requestUsersList = () => {
  if (usersController) {
    usersController.abort();
  }

  usersController = new AbortController();

  return get("users", {
    signal: usersController.signal,
  });
};

export function requestCreateUser(params: IUserCreatePayload): any {
  return post("users", params);
}

export function requestUpdateUser({
  id,
  data,
}: {
  id: number;
  data: IUserCreatePayload;
}): any {
  return put(`users/${id}`, data);
}

export function requestDeleteUser(params: number): any {
  return remove(`users/${params}`);
}

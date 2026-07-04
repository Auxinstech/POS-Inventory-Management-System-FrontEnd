import { get, post } from "../../../Utils/axios";

export function requestLogin(params: { email: string }): any {
  return post("login", params);
}

export function requestVerifyOtpToken(params: { email: string, otp: string }): any {
  return post("verify-otp", params);
}

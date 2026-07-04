import { DeliveryConfiguration } from "Models/deliveryConfiguration";
import { ITestMqtt } from "../../Ducks/settingSlice";
import { get, post, put, remove } from "Utils/axios";

let deliveryConfigController: AbortController | null = null;

// export function requestGetDeliveryConfiguration(id: number): any {
//   return get(`delivery-configurations?store_id=${id}`);
// }

export function requestTestMqtt(data: ITestMqtt): any {
  return post(`test-mqtt`, data);
}

export const requestGetDeliveryConfiguration = (id: number) => {
  if (!id) return;

  if (deliveryConfigController) {
    deliveryConfigController.abort();
  }

  deliveryConfigController = new AbortController();

  return get(`delivery-configurations?store_id=${id}`, {
    signal: deliveryConfigController.signal,
  });
};

export function requestSaveDeliveryConfiguration(
  model: DeliveryConfiguration
): any {
  return post(`delivery-configurations`, model);
}

export function requestUpdateDeliveryConfiguration(
  model: DeliveryConfiguration
): any {
  return put(`delivery-configurations/${model.id}`, model);
}

export function requestDeleteDeliveryConfiguration(code: string): any {
  return remove(`delivery-configurations/${code}`);
}

export function requestChangeSetting(model: any): any {
  return post(`settings`, model);
}

// export function requestGetSettings(id: number): any {
//   return get(`settings?store_id=${id}`);
// }

let settingsController: AbortController | null = null;

export const requestGetSettings = (id: number) => {
  if (!id) return;

  if (settingsController) {
    settingsController.abort();
  }

  settingsController = new AbortController();

  return get(`settings?store_id=${id}`, {
    signal: settingsController.signal,
  });
};

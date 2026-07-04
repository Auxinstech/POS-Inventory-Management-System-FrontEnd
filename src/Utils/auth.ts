import { constant } from "./constants";
import storage from "./storage";


export const getTokens = () => ({
    AccessToken: storage.get(constant.ACCESS_TOKEN)
});

export const hasTokens = () => {
    const { AccessToken } = getTokens();

    return Boolean(AccessToken);
};

export const setTokens = ({ AccessToken }: any) => {
    if (AccessToken) storage.set(constant.ACCESS_TOKEN, AccessToken);
};

export const setActiveStore = ({ ActiveStore }: any) => {
    storage.set(constant.ACTIVE_STORE, ActiveStore);
};

export const getActiveStore = () => ({
    ActiveStore: storage.get(constant.ACTIVE_STORE),
});
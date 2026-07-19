import { BrowserHistory, createBrowserHistory } from "history";
import { createReduxHistoryContext } from "redux-first-history";

const browserHistory: BrowserHistory = createBrowserHistory();

const {
    createReduxHistory,
    routerMiddleware,
    routerReducer
} = createReduxHistoryContext({ history: browserHistory });

export {
    browserHistory,
    createReduxHistory,
    routerMiddleware,
    routerReducer
};

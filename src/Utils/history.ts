import { createBrowserHistory } from "history";
import { createReduxHistoryContext } from "redux-first-history";

const browserHistory = createBrowserHistory();

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

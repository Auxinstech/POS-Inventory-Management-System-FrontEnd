import {
  configureStore
} from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import { watcherSaga } from "./Sagas/rootSaga";
import reducer from "./Ducks";
import { createReduxHistory, routerMiddleware } from "../Utils/history";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      thunk: false
    }).concat(routerMiddleware)
    .concat(sagaMiddleware)
      
});
sagaMiddleware.run(watcherSaga);

export const history = createReduxHistory(store);

export default store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof reducer>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

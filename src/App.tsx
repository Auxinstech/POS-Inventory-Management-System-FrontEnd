import { Provider } from "react-redux";
import "./Assets/Scss/app.scss";
import ToastContainer from './Components/ToastContainer';
import store, { history } from "./Redux/configureStore";
import AppRoutes from "./Routes";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";

const App = () => (
  <Provider store={store}>
    <ToastContainer />
    <HistoryRouter history={history as any}>
      <AppRoutes />
    </HistoryRouter>
  </Provider>
);

export default App;

import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { useEffect, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { setActiveStore } from "Utils/auth";
import { setSelectedStore } from "../../Redux/Ducks/homeSlice";
import {
  clearActiveOrder,
  removeEditOrder,
} from "../../Redux/Ducks/orderSlice";

const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user_stores = useAppSelector((x) => x.User.user.stores);
  const [searchText, setSearchText] = useState("");
  const { stores, selected_store } = useAppSelector((x) => ({
    stores: x.Home.stores,
    selected_store: x.Home.selected_store,
  }));

  const userStores = useAppSelector((x) => x.User.user.stores);
  const rp = useAppSelector((x) => x.rp);

  const onChange = (e: any) => {
    setSearchText(e.target.value);
  };

  const filterStores = user_stores.filter((x) => {
    const searchSplit = searchText.split(" ");
    if (
      !searchText ||
      searchSplit.filter((y) => x.name.toLowerCase().includes(y.toLowerCase()))
        .length == searchSplit.length
    )
      return true;
  });

  const selectStore = (id: number) => {
    dispatch(setSelectedStore(id));
    setActiveStore({ ActiveStore: id });
    dispatch(clearActiveOrder());
    dispatch(removeEditOrder());
    navigate("/orders");
  };

  useEffect(() => {
    if (!selected_store && userStores.length === 1) {
      dispatch(setSelectedStore(userStores[0].id));
      navigate("/orders");
    }
    if (selected_store && userStores.length > 0) {
      console.log("store is selected, auto redirect", selected_store);
      navigate("/orders");
    }
  }, [rp.permissions, selected_store, navigate, userStores]);

  return (
    <div className="home">
      <Container fluid>
        <div className="top-bar">
          <h6>My Stores</h6>
          <Form.Control
            type="text"
            placeholder="Search Store"
            value={searchText}
            onChange={onChange}
          />
        </div>
        <Row className="store-select-cards">
          {filterStores.map((x) => (
            <Col key={x.id} md={3}>
              <div
                className={classNames([
                  "store-select-card",
                  { active: selected_store == x.id },
                ])}
                onClick={() => selectStore(x.id)}
              >
                {/* <img src={x.} alt="" /> */}
                <div className="text-section">
                  <h6>{x.name}</h6>
                  <a href={x.url} target="_blank">
                    {x.url}
                  </a>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Home;

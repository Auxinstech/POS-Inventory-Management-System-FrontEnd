import { useAppDispatch, useAppSelector } from "../../Hook/hooks";
import React, { useEffect, useState } from "react";
// import { LuBuilding2 } from 'react-icons/lu';
import Select, { components } from "react-select";
import { getActiveStore, setActiveStore } from "Utils/auth";
import FeatherIcon from "feather-icons-react";
import { resetBooking, setSelectedStore } from "../../Redux/Ducks/homeSlice";
import { useNavigate } from "react-router-dom";
import {
  clearActiveOrder,
  getOrders,
  removeEditOrder,
  setActiveOrder,
} from "../../Redux/Ducks/orderSlice";
import { getStoreSettings } from "../../Redux/Ducks/settingSlice";
import { formatSave } from "Utils/date-formate";
const customStyles = {
  container: (base: any) => ({
    ...base,
    width: "150px",
    zIndex: 15,
  }),
  control: (base: any) => ({
    ...base,
    border: "1px solid #cbcbcb",
    // This line disable the blue border
    // height: '42px',
    // borderRadius: '6px'
    boxShadow: "none",
    "&:hover": {
      border: "1px solid #c1121f",
    },
  }),
  valueContainer: (base: any) => ({
    ...base,
    fontSize: "11px",
    color: "#000",
    fontWeight: "bold",
  }),
  placeholder: (base: any) => ({
    ...base,
    fontSize: "9px",
    color: "#575757ab",
    fontWeight: "normal",
    position: "relative",
    top: "2px",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: "11px",
    backgroundColor: state.isSelected ? "#c1121f" : "inherit",
    "&:hover": {
      backgroundColor: state.isSelected ? "#c1121f" : "#fff0f3",
    },
    "&:active": {
      backgroundColor: state.isSelected ? "#c1121f" : "#fff0f3",
    },
  }),
};

const { ValueContainer, Placeholder, SingleValue } = components;

const CustomValueContainer = ({ children, ...props }: any) => {
  return (
    <ValueContainer {...props}>
      {React.Children.map(children, (child) =>
        child && child.type !== Placeholder ? child : null
      )}
    </ValueContainer>
  );
};

const CustomSingleValue = (props: any) => {
  return (
    <SingleValue {...props}>
      <div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          alignItems: "center",
          overflow: "hidden",
          gap: "10px",
        }}
      >
        <FeatherIcon
          icon="home"
          size={18}
          color="#c1121f"
          style={{ flexShrink: 0 }}
        />
        <div>
          <Placeholder {...props} isFocused={props.isFocused}>
            Store
          </Placeholder>
          {props.data.label}
        </div>
      </div>
    </SingleValue>
  );
};

const StoreSelector = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const stores = useAppSelector((x) => x.Home.stores);
  const user_stores = useAppSelector((x) => x.User.user.stores);

  const selected_store = useAppSelector((x) => x.Home.selected_store);

  const onChange = (option: any) => {
    dispatch(setSelectedStore(option.value));
    dispatch(resetBooking());
    setActiveStore({ ActiveStore: option.value });
    const today = new Date();
    const day = formatSave(today);
    const storeId = Number(option.value);
    dispatch(getOrders({ store_id: storeId, day }));
    dispatch(getStoreSettings(option.value));
    dispatch(clearActiveOrder());
    dispatch(removeEditOrder());
    navigate("/orders");
  };

  return user_stores.length >= 1 ? (
    <div>
      {selected_store ? (
        <Select
          components={{
            ValueContainer: CustomValueContainer,
            SingleValue: CustomSingleValue,
          }}
          options={
            user_stores.map((x) => ({
              label: x.name,
              value: x.id,
            })) as any
          }
          value={user_stores
            .map((x) => ({
              label: x.name,
              value: x.id,
            }))
            .find((x) => x.value == selected_store)}
          onChange={onChange}
          styles={customStyles}
        />
      ) : null}
    </div>
  ) : null;
};

export default StoreSelector;

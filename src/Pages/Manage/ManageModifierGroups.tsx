import ModifierGroupGrid from "Components/ModifierGroupGrid";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { ModifierGroup } from "Models/modifierGroup";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import { requestGetModifierGroups } from "../../Redux/Sagas/Requests/home";
import ModifierGroupGridSeprated from "Components/ModifierGroupGrid/index-Seprated";

const ManageModifierGroups = () => {
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = useState("");
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const store_id = useAppSelector((x) => x.Home.selected_store) as any;

  useEffect(() => {
    const getModifierGroups = async () => {
      if (modifierGroups.length > 0 || !store_id || store_id <= 0) return;
      dispatch(toggleLoader(true));
      try {
        const res = await requestGetModifierGroups(store_id);
        setModifierGroups(res.data || []);
      } catch (err) {
        console.error("Failed to fetch modifier groups", err);
      } finally {
        dispatch(toggleLoader(false));
      }
    };

    getModifierGroups();
  }, []);

  // const getModifierGroups = async () => {
  //   dispatch(toggleLoader(true));
  //   const res = await requestGetModifierGroups(store_id);
  //   setModifierGroups(res.data);
  //   dispatch(toggleLoader(false));
  // };

  // useEffect(() => {
  //   if (!(modifierGroups.length >= 1)) {
  //     getModifierGroups();
  //   }
  // }, []);

  const onChange = (e: any) => {
    setSearchText(e.target.value);
  };

  const filterModifierGroups = modifierGroups.filter((x) => {
    const searchSplit = searchText.split(" ");
    return (
      !searchText ||
      searchSplit.filter((y) => x.name.toLowerCase().includes(y.toLowerCase()))
        .length === searchSplit.length
    );
  });
  return (
    <div className="manage-container">
      <div className="manage-top-bar">
        <Form.Control
          type="text"
          placeholder="Search Items"
          value={searchText}
          onChange={onChange}
        />
      </div>

      <div className="p-2">
        <ModifierGroupGridSeprated data={filterModifierGroups} itemId={0} />
      </div>
    </div>
  );
};

export default ManageModifierGroups;

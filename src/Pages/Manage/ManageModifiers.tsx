import ModifierGrid from "Components/ModifierGrid";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { Modifier } from "Models/modifier";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import { requestGetModifiers } from "../../Redux/Sagas/Requests/home";

const ManageModifiers = () => {
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = useState("");
  const [modifiers, setModifier] = useState<Modifier[]>([]);
  const store_id = useAppSelector((x) => x.Home.selected_store) as any;

  const getModifiers = async () => {
    dispatch(toggleLoader(true));
    const res = await requestGetModifiers(store_id);
    setModifier(res.data);
    dispatch(toggleLoader(false));
  };

  useEffect(() => {
    if (!(modifiers.length >= 1)) {
      getModifiers();
    }
  }, []);

  const onChange = (e: any) => {
    setSearchText(e.target.value);
  };

  const filterModifier = modifiers.filter((x) => {
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
        <ModifierGrid data={filterModifier} modifierGroupId={0} />
      </div>
    </div>
  );
};

export default ManageModifiers;

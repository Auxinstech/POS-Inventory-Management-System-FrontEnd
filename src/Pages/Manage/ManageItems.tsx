import ItemGrid from 'Components/ItemGrid';
import { Item } from 'Models/item';
import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { requestGetItems } from '../../Redux/Sagas/Requests/home';
import { useAppDispatch, useAppSelector } from 'Hook/hooks';
import { toggleLoader } from '../../Redux/Ducks/loaderSlice';
import { addItem } from 'Redux/Ducks/homeSlice';

const ManageItems = () => {
    const dispatch = useAppDispatch();
    const [searchText, setSearchText] = useState("");
    const [items, setItems] = useState<Item[]>([]);
    const store_id = useAppSelector(x => x.Home.selected_store) as any;

    const getItems = async () => {
        dispatch(toggleLoader(true));
        const res = await requestGetItems(store_id);
        setItems(res.data);
        dispatch(toggleLoader(false));
    }

    useEffect(() => {
        if (!(items.length >= 1)) {
            getItems();
        }
    }, []);

    const onChange = (e: any) => {
        setSearchText(e.target.value);
    };

    const filterItems = items.filter(x => {
        const searchSplit = searchText.split(" ");
        return !searchText || searchSplit.filter(y => x.name.toLowerCase().includes(y.toLowerCase())).length === searchSplit.length;
    });

    return (
        <div className="manage-container">
            <div className="manage-top-bar">
                <Form.Control type="text" placeholder="Search Items" value={searchText} onChange={onChange} />
            </div>

            <div className="p-2">
                <ItemGrid data={filterItems} subCatId={0} />
            </div>
        </div>
    );
};

export default ManageItems;

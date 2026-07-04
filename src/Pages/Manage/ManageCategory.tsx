import ItemGrid from 'Components/ItemGrid';
import FeatherIcon from 'feather-icons-react';
import { useAppDispatch, useAppSelector } from 'Hook/hooks';
import { useEffect, useState } from 'react';
import { Accordion, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ManageCategory = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [activeKeys, setActiveKeys] = useState<string[]>([]);

    const categories = useAppSelector(x => x.Home.categories);

    useEffect(() => {
        if (categories.length) {
            const allKeys: string[] = [];
            categories.forEach(cat => {
                allKeys.push(cat.id.toString());
                cat.children?.forEach(sub => {
                    allKeys.push(sub.id.toString());
                });
            });
        }
    }, [categories]);

    const onChange = (e: any) => {
        setSearchText(e.target.value);
    };

    const filterCategories = categories.filter(x => {
        const searchSplit = searchText.split(" ");
        return !searchText || searchSplit.filter(y => x.name.toLowerCase().includes(y.toLowerCase())).length === searchSplit.length;
    });

    const addCategory = () => {
        navigate("/add-category");
    };

    const addSubCategory = (id: number) => {
        navigate(`/add-sub-category/${id}`);
    };

    const addItem = (id: number) => {
        navigate(`/add-item/${id}`);
    };

    const editCategory = (id: number) => {
        navigate(`/edit-category/${id}`);
    }

    const expandAll = () => {
        const keys: string[] = [];
        filterCategories.forEach(cat => {
            keys.push(cat.id.toString());
            cat.children?.forEach(sub => keys.push(sub.id.toString()));
        });
        setActiveKeys(keys);
    };

    const collapseAll = () => {
        setActiveKeys([]);
    };

    const toggleAccordion = (key: string) => {
        setActiveKeys(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    return (
        <div className="manage-container">
            <div className="manage-top-bar">
                <Form.Control type="text" placeholder="Search Categories" value={searchText} onChange={onChange} />
                <Button variant="primary" className="ms-2" onClick={addCategory}>
                    Add Category
                </Button>
                <Button variant="light" className="ms-2">
                    Sort Category
                </Button>
                <Button variant="light" className="ms-2" onClick={expandAll}>
                    Expand All
                </Button>
                <Button variant="light" className="ms-2" onClick={collapseAll}>
                    Collapse All
                </Button>
            </div>

            <div className="p-2">
                {
                    filterCategories.map((category) => (
                        <Accordion
                            activeKey={activeKeys}
                            alwaysOpen
                            key={category.id}
                        >
                            <Accordion.Item eventKey={category.id.toString()}>
                                <Accordion.Header as={'div'} onClick={() => toggleAccordion(category.id.toString())}>
                                    {category.name}
                                    <Button variant='light' className='ms-3' onClick={(e) => {
                                        e.stopPropagation();
                                        editCategory(category.id);
                                    }}>
                                        Edit Category
                                    </Button>

                                    <Button variant='light' className='ms-auto me-3' onClick={(e) => {
                                        e.stopPropagation();
                                        addSubCategory(category.id);
                                    }}>
                                        <FeatherIcon icon="plus" size={16} className='me-2' />
                                        Add Sub Category
                                    </Button>
                                </Accordion.Header>
                                <Accordion.Body>
                                    {category.children?.map(subCategory => (
                                        <Accordion
                                            activeKey={activeKeys}
                                            alwaysOpen
                                            key={subCategory.id}
                                        >
                                            <Accordion.Item eventKey={subCategory.id.toString()}>
                                                <Accordion.Header as={'div'} onClick={() => toggleAccordion(subCategory.id.toString())}>
                                                    {subCategory.name}
                                                    <Button variant='light' className='ms-3' onClick={(e) => {
                                                        e.stopPropagation();
                                                        editCategory(subCategory.id);
                                                    }}>
                                                        Edit Sub Category
                                                    </Button>

                                                    <Button variant='light' className='ms-auto me-3' onClick={(e) => {
                                                        e.stopPropagation();
                                                        addItem(subCategory.id);
                                                    }}>
                                                        <div className="d-flex align-items-center">
                                                            <FeatherIcon icon="plus" size={16} className='me-2' />
                                                            Add Item
                                                        </div>
                                                    </Button>
                                                </Accordion.Header>
                                                <Accordion.Body>
                                                    <ItemGrid data={subCategory.items} subCatId={subCategory.id} />
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
                                    ))}
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    ))
                }
            </div>
        </div>
    );
};

export default ManageCategory;

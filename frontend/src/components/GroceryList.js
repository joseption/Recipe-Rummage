import '../styles/GroceryList.css';
import GroceryItem from '../components/GroceryItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { useState, useCallback, useEffect } from 'react';
import { Constant, config } from '../Constants'

const GroceryList = (props) =>
{
    var addItem;
    var container;
    const [checked,setChecked] = useState(false);
    const noGroceriesMsg = "Added grocery items will appear here"
    const [message,setMessage] = useState('');
    const [error,setError] = useState('');
    const [itemsLoaded,setItemsLoaded] = useState(false);
    const [isLoading,setIsLoading] = useState(false);
    const [search,setSearch] = useState('');
    const [isLoaded,setIsLoaded] = useState(false);

    const accTimeout = () => {
        window.location.href = "/login?timeout=yes";
    }

    const getItems = useCallback(async () => {
        setError('');
        setMessage('');
        if (!itemsLoaded) {
            let prop = props;
            setIsLoading(true);
            setItemsLoaded(true);
            prop.setGroceryError("");

            let obj = {user_id: Constant.user_id};
            let js = JSON.stringify(obj);

            await fetch(`${config.URL}/api/get-grocery-items`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error)
                {
                    if (res.error === "Unauthorized" || res.error === "Forbidden") {
                        setMessage("You appear to be signed out, try logging out and back in again");
                        accTimeout();
                    }
                    else
                        setMessage(res.error);
                }
                else
                {
                    if (res.results.length === 0)
                        prop.setGroceryError("no_items");
                    else {
                        props.setItems(res.results);
                    }
                        
                    setMessage('');
                }
                setIsLoading(false);
            });
        }
    }, [props, itemsLoaded])

    useEffect(() => {
        if (!isLoaded) {
            setIsLoaded(true);
            getItems();
        }
        if (props.toggleView && props.isMobile) {
            container.parentElement.style.display = "none";
        }
        else {
            container.parentElement.style.display = "block";
        }
    }, [getItems, props, isLoaded, container]);

    const deleteItem = (id) => {
        for (let i = 0; i < props.items.length; i++) {
            if (props.items[i]._id === id) {
                var list = props.items.slice();
                list.splice(i, 1);
                props.setItems(list);
                break;
            }
        }
        if (list.length === 0) {
            props.setGroceryError("no_items");
        }
        else if (search.length > 0) {
            setSearch(search);
        }
    };

    const update = () => {
        if (search.length > 0) {
            let s = search;
            setSearch('');
            setTimeout(() => {
                setSearch(s);
            }, 50);
        }
    };

    const toggleItems = (skip) => {
        if (!skip)
            setChecked(!checked);
        var items = filteredItems();
        for (let i = 0; i < items.length; i++) {
            if (!items[i].isSelected) {
                if (checked) {
                    items[i].display = "block";
                }
                else {
                    items[i].display = "none";
                }
            }
        }
    }

    const addNewItem = async (e) => {
        setMessage('');
        setError('');
        var itemField = addItem;
        addItem.classList.remove("input-error");

        if (!addItem.value) {
            setError("Please enter an item name");
            addItem.classList.add("input-error");
            return;
        }

        let obj = {
            user_id:Constant.user_id,
            item:addItem.value
        };

        let js = JSON.stringify(obj);
        await fetch(`${config.URL}/api/add-grocery-item`,
        {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
            let res = JSON.parse(await ret.text());
            if (res.error)
            {
                if (res.error === "Unauthorized" || res.error === "Forbidden") {
                    setError("You appear to be signed out, try logging out and back in again");
                    accTimeout();
                }
                else
                setError(res.error);
            }
            else
            {               
                if (res.result) {
                    var myItems = props.items.slice();
                    res.result.isNew = true;
                    myItems.unshift(res.result);
                    props.setItems(myItems);
                    itemField.value = "";
                    props.setGroceryError("");
                }
                else {
                    setError(res.error);
                }
            }
        });
    };

    const checkKeyDown = (e) => {
        if (e.keyCode === 13)
            addNewItem(e);
    }

    const filteredItems = () => {
        return props.items.filter(x => {
            if (x && x.item && x.item.toLowerCase().includes(search.toLowerCase()) && ((x.isSelected && checked) || !checked)) {
                x.display = "block";
            }
            else {
                x.display = "none";
            }

            return x;
        })
    }

    const mappedItems = () => {
        return filteredItems().map((item, key) => {
            return <GroceryItem setRemoveError={props.setRemoveError} setRemove={props.setRemove} setName={props.setName} setType={props.setType} toggleItems={(e) => toggleItems(e)} style={{display: item.display}} setMessage={setError} update={() => update()} deleteItem={() => deleteItem(item._id)} key={key} item={item} mode={props.mode} />
        });
    }

    const anyShowing = () => {
        var items = filteredItems();
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].display !== "none") {
                    return true;
                }
            }
        }
        return false;
    };

    const setSearchType = (e) => {
        if (e.target.id !== 'search_type') {
            e.preventDefault();
            props.setSearchAll(!props.searchAll);
            document.getElementById("search_type").click();
        }
    }

    return(
        <div ref={(c) => container = c} className="groceries-container">
            <div className="generic-header-content">
                <div className="grocery-list-title">My Pantry</div>
                {props.isMobile ?
                    <FontAwesomeIcon onClick={() => props.setToggleView(!props.toggleView)} className="view-switch" icon={solid('window-restore')} />
                : null }
            </div>
            <div className="grocery-list-overview">
                <div>
                    <div>
                        {props.mode === "profile" ?
                            (<div className="grocery-list-add-container">
                                <input onKeyDown={(e) => checkKeyDown(e)} ref={(c) => addItem = c} type="text" className="grocery-list-add" placeholder="Add Item" />
                                <div onClick={(e) => addNewItem(e)} className="btn btn-success grocery-list-add-btn">
                                    <FontAwesomeIcon icon={solid("plus")} />
                                </div>
                            </div>)
                            :
                            (<div>
                                <div onClick={() => props.search()} className="btn btn-success grocery-list-search-btn">Find Recipes</div>
                                <div onClick={(e) => setSearchType(e)}>
                                    <label className="switch">
                                        <div className="slider-content" >
                                            <input id="search_type" type="checkbox" />
                                            <span className="slider round"></span>
                                        </div>
                                        {!props.searchAll ?
                                            (<span>Contains at least one item</span>) :
                                            (<span>Contains all items</span>)
                                        }
                                    </label>
                                </div>
                            </div>)
                        }
                    </div>
                    <div className="error-msg grocery-list-error-msg">{props.error || error}</div>
                </div>
            </div>
            <hr className="splitter" />
            <div className="grocery-list-search-container">
                {props.mode !== "profile" ?
                (<label className="grocery-list-check check-container">Show Only Added Items
                    <input type="checkbox" onChange={(e) => toggleItems(false)} checked={checked} />
                    <span className="check-checkmark"></span>
                </label>) : null}
                <div>
                    <input type="text" onChange={(e) => setSearch(e.target.value)} className="grocery-list-search" placeholder="Search Pantry..." />
                </div>
            </div>
            <div className="grocery-all-items">
            {isLoading ?
            (<div className="loading">
                <div className="rotating">
                    <FontAwesomeIcon icon={solid('spinner')} />
                </div>
                <div>Loading</div>
            </div>) : null}
            {message ?
            (<div className="grocery-error error-msg">{message}</div>) : null}
            {props.mode === "profile" ? /* Keep this top part for profile groceries */
            (<div>   
            {!message ?
            (<div>                          
                {!props.groceryError && props.items ?
                    (<div className="grocery-list-items">
                    {mappedItems()}
                    {itemsLoaded && !anyShowing() ?
                        <div className="grocery-list-msg">No results were found that match your criteria</div>
                        : null}
                    </div>)
                    :
                    (<div className="grocery-list-msg">
                        {props.groceryError === "no_items" ?
                            (noGroceriesMsg.split('\n').map((line, i) => {
                                return <span key={i}>{line}<br/></span>
                            }))
                        : null
                        }
                    </div>)
                }
            </div>)
            : null}
            </div>)
            : /* Keep this bottom part for search groceries */
            (<div>
                {!props.groceryError && props.items ?
                    (<div className="grocery-list-items">
                    {mappedItems()}
                    {itemsLoaded && !anyShowing() ?
                        <div className="grocery-list-msg">No results were found that match your criteria</div>
                        : null}
                    </div>)
                    :
                    (<div className="grocery-list-msg">
                        {props.groceryError === "no_items" ?
                            (noGroceriesMsg.split('\n').map((line, i) => {
                                return <span key={i}>{line}<br/></span>
                            }))
                        : null
                        }
                    </div>)
                }
            </div>)
            }
        </div>
       </div>
    );
};

export default GroceryList;

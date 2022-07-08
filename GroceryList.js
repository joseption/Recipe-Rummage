import '../styles/GroceryList.css';
import GroceryItem from '../components/GroceryItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { faTruckLoading } from '@fortawesome/free-solid-svg-icons';
import { Constant, config } from '../Constants'
import { useCallback, useEffect, useState } from 'react';

const GroceryList = (props) =>
{   
    console.log (props);
    let item = '';
    let search = '';
    let _ud = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userid = ud.userid;
    let itemName = ud.item;
   

    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [itemList,setItemList] = useState([]);

    const [itemsError,setItemsError] = useState('');
    const [items,setItems] = useState([]);
    const [itemsLoaded,setItemsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState (false);

    
   

    const [checked,setChecked] = useState(false);

    const addItem = async (e) => {
        let obj = {user_id: Constant.user_id,item:item.value};
        let js = JSON.stringify(obj);
        try
        {
            
            const response = await fetch(`${config.URL}/api/add-grocery-item`,
            {method:'POST',body:js,headers:{'Content-Type': 
                'application/json'}});
            let txt = await response.text();
            let res = JSON.parse(txt);
            if( res.error.length > 0 )
            {
                setMessage( "API Error:" + res.error );
            }
            else
            {
                setMessage('Item has been added');
            }
        }
        catch(e)
        {
            setMessage(e.toString());
        }
    };
    
   /* const getItems = useCallback(async () => {
        if (!itemsLoaded) {
            setIsLoading(true);
            setItemsLoaded(true);
            setItemsError("");

            let obj = {user_id: Constant.user_id};
            let js = JSON.stringify(obj);

            await fetch(`${config.URL}/api/search-grocery-item`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error)
                {
                    if (res.error === "Unauthorized" || res.error === "Forbidden") {
                        setMessage("You appear to be signed out, try logging out and back in again");
                    }
                    else
                        setMessage(res.error);
                }
                else
                {
                    if (res.results.length === 0)
                        setItemsError("no_items");
                    else
                        setItems(res.results);
                        
                    setMessage('');
                }
                setIsLoading(false);
            });
        }
    })*/
    
    const searchCard = async event => 
    {
        event.preventDefault();
        
        let obj = {user_id: Constant.user_id,search:search.value};
        let js = JSON.stringify(obj);
        try
        {
            const response = await fetch(`${config.URL}/api/search-grocery-item`,
            {method:'POST',body:js,headers:{'Content-Type': 
            'application/json'}});
            let txt = await response.text();
            let res = JSON.parse(txt);
            let _results = res.results;
            let resultText = '';
            for( var i=0; i<_results.length; i++ )
            {
                resultText += _results[i];
                if( i < _results.length - 1 )
                {
                    resultText += ', ';
                }
            }
            setResults('Item(s) have been retrieved');
            setItemList(_results);
        }
        catch(e)
        {
            alert(e.toString());
            setResults(e.toString());
        }
    };

    const renderItemList = itemList.map((singleitems)=> {
        return (
            <GroceryItem singleitem ={singleitems}  />
        );
    });

    const toggleItems = (e) => {
        setChecked(!checked);
        if (checked) {
            // to do show only added items
        }
        else {
            // to do show all items
        }
    }


    return(
        <div>
            <div className="grocery-list-title">My Pantry</div>
            <div>
                <div>
                    <div>
                        {props.mode === "profile" ?
                            (<div className="grocery-list-add-container">
                                <input type="text" className="grocery-list-add" placeholder="Add Item"
                                ref={(c) => item = c} />
                                <div onClick={(e) => addItem(e)} className="btn btn-success grocery-list-add-btn">
                                    <FontAwesomeIcon icon={solid("plus")} />
                                </div>

                          

                            </div>)
                            :
                            (<div className="btn btn-success grocery-list-search-btn">Find Recipes</div>)
                        }
                    </div>
                    <span id = "itemAddResult">{message} </span>
                    <div className="error-msg grocery-list-error-msg"></div>
                </div>
            </div>
            <hr className="splitter" />
            <div className="grocery-list-search-container">
                {props.mode !== "profile" ?
                (<label className="grocery-list-check check-container">Show Only Added Items
                    <input type="checkbox" onChange={(e) => toggleItems(e)} checked={checked} />
                    <span className="check-checkmark"></span>
                </label>) : null}
                <div className='ui Search'>
                    <div>
                    <input type="text" id="searchText" placeholder="Search Pantry" 
                     ref={(c) => search = c} />
                    <button type="button" id="searchCardButton" class="buttons" 
                    onClick={searchCard}> Search Card</button><br />
                    <span id="cardSearchResult">{searchResults}</span>
                        <div className='itemList'> 
                            {renderItemList}
                        </div>
                    </div>
                </div>
            </div>
            <div className="grocery-list-items">
                <div>
                       component here
                </div>
            </div>
        </div>
    );
};

export default GroceryList;

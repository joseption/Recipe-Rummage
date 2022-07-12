import '../styles/GroceryList.css';
import GroceryItem from '../components/GroceryItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { faTruckLoading } from '@fortawesome/free-solid-svg-icons';
import { Constant, config } from '../Constants'
import { useCallback, useEffect, useState } from 'react';


const GroceryList = (props) =>
{   
 
    let item = '';
    let search = '';
    let _ud = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userid = ud.userid;
    let itemName = ud.item;
   

    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [favoritesLoaded,setFavoritesLoaded] = useState(false);
    const [itemsError,setItemsError] = useState('');
    const [itemList,setItemList] = useState([]);
    const [refreshPage, setRefreshPage] = useState(false);
    const [isLoading, setIsLoading] = useState (false);


    
   

    const [checked,setChecked] = useState(false);

    const addItem = (async (e) => {
        let obj = {user_id: Constant.user_id,item:item.value};
        let js = JSON.stringify(obj);
       
            
            const response = await fetch(`${config.URL}/api/add-grocery-item`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}});
            let txt = await response.text();
            let res = JSON.parse(txt);
            if( res.error.length > 0 )
            {
                setMessage( "API Error:" + res.error );
            }
            else
            {
        
                getItems();
                getItems();
              
         
       
               
            }
        
 
        
    });
    
    const getItems = useCallback(async () => {
       
        
          
        setIsLoading(true);
        setItemsError("");
        setFavoritesLoaded(true);

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
                        setItemList(res.results);
                    else
                        setItemList(res.results);
                        
                    setMessage('');
                   
                }
                setIsLoading(false);
          
            }); 
           
    });
    
      
    useEffect(() => {
      
           
        
                getItems();
                
                setRefreshPage(false); 
               
       
    }, refreshPage);
        


   
   

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
                    <input type="text" className="grocery-list-search" placeholder="Search Pantry..." 
                    onChange={(e) => {setSearchTerm(e.target.value)}}/>

                    </div>
                </div>
            </div>
            <div className="grocery-list-items">
                
            {itemList.filter((value)=>{
            if (searchTerm == ""){
             return value;
             }else if (value.toLowerCase().includes(searchTerm.toLowerCase())){
             return value;
             }
             }).map((singleitems,key) =>{
            return <GroceryItem setRefreshPage={() => setRefreshPage()} singleitem ={singleitems} key = {key} user_id = {Constant.user_id}  />
            })}
                                 
            </div>
        </div>
    );
};   

export default GroceryList;
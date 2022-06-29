import React, { useState } from 'react';
import { config } from '../Constants'

function ItemUI()
{
    let item = '';
    let search = '';

    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [itemList,setItemList] = useState('');

    let _ud = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let user_id = ud.id;
    let firstName = ud.firstName;
    let lastName = ud.lastName;

    const addItem = async event => 
    {
	    event.preventDefault();

        let obj = {user_id:user_id,item:item.value};
        let js = JSON.stringify(obj);

        try
        {
            const response = await fetch(`${config.URL}/api/additem`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

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

    const searchItem = async event => 
    {
        event.preventDefault();
        		
        let obj = {user_id:user_id,search:search.value};
        let js = JSON.stringify(obj);

        try
        {
            const response = await fetch(`${config.URL}/api/searchitems`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

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
            setItemList(resultText);
        }
        catch(e)
        {
            alert(e.toString());
            setResults(e.toString());
        }
    };



    return(
        <div id="itemUIDiv">
        <br />
        <input type="text" id="searchText" placeholder="Item To Search For" 
            ref={(c) => search = c} />
        <button type="button" id="searchItemButton" class="buttons" 
            onClick={searchItem}> Search Item</button><br />
        <span id="itemSearchResult">{searchResults}</span>
        <p id="itemList">{itemList}</p><br /><br />
        <input type="text" id="itemText" placeholder="item To Add" 
            ref={(c) => item = c} />
        <button type="button" id="addItemButton" class="buttons" 
            onClick={addItem}> Add Item </button><br />
        <span id="itemAddResult">{message}</span>
        </div>
    );
}

export default ItemUI;

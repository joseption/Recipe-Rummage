import '../styles/GroceryItem.css';
import { useCallback, useEffect, useState } from 'react';
import { Constant, config } from '../Constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';



const GroceryItem = (props) =>
{
    var name; // input
  
    const [sName,setName] = useState(false);
    const [isEditing,setIsEditing] = useState(false);
    const [message,setMessage] = useState('');

    
    useEffect(() => {
        setName(props.singleitem);
        if (isEditing) {
           
            name.value = props.singleitem;
        }
    }, [ name, props.singleitem, isEditing]);
   
    const cancelItem = (e) => {
        setIsEditing(false);
    };

    const removeItem = async (e) => {
        let obj = {user_id: props.user_id,item:props.singleitem};
        let js = JSON.stringify(obj);
        try
        {
            
            const response = await fetch(`${config.URL}/api/remove-grocery-item`,
            {method:'POST',body:js,headers:{'Content-Type': 
                'application/json', 'authorization': Constant.token}});
            let txt = await response.text();
            let res = JSON.parse(txt);
            if( res.error.length > 0 )
            {
                setMessage( "API Error:" + res.error );
            }
            else
            {
            
                props.setRefreshPage(true);
               
            }
        }
        catch(e)
        {
            setMessage(e.toString());
        }
      
    };

    const updateItem = async (e) => {
        let obj = {user_id: props.user_id,item:props.singleitem,updatedItem:name.value};
        let js = JSON.stringify(obj);
        try
        {
            
            const response = await fetch(`${config.URL}/api/update-grocery-item`,
            {method:'POST',body:js,headers:{'Content-Type': 
                'application/json', 'authorization': Constant.token}});
            let txt = await response.text();
            let res = JSON.parse(txt);
            if( res.error.length > 0 )
            {
                setMessage( "API Error:" + res.error );
            }
            else
            {
               
                props.setRefreshPage(true);
                setIsEditing(false);
                
            }
        }
        catch(e)
        {
            setMessage(e.toString());
        }
  
    };
  

    return(
        <div className="recipe-card">
            <div className="recipe-content">
                <div className="recipe-header">
                    <div className="recipe-title-content">
                        {!isEditing ?
                          (<div className="recipe-title">{sName}</div>) :
                          (<textarea className="recipe-title-edit" ref={(c) => name = c} value={name} />)
                        }
                    </div>
                    <div className="recipe-button-content">
                    {!isEditing ?
                            (<div className="recipe-button-content">
                                <div onClick={() => setIsEditing(true)} className="recipe-btn recipe-edit">
                                <FontAwesomeIcon icon={solid("pencil")} />
                                </div>
                                <div onClick={(e) => removeItem(e)} className="recipe-btn recipe-remove">
                                    <FontAwesomeIcon icon={solid("xmark")} />
                                </div>
                            </div>
                            ) :
                            (<div className="recipe-button-content">
                                <div onClick={(e) => cancelItem(e)} className="recipe-btn recipe-cancel">
                                    <FontAwesomeIcon icon={solid("rotate-left")} />
                                </div>
                                <div onClick={(e) => updateItem(e)} className="recipe-btn recipe-update">
                                    <FontAwesomeIcon icon={solid("check")} />
                                </div>
                            </div>
                            )}
                               
                     </div>
                </div>
    
            </div>
        </div>
        
    );
};

export default GroceryItem;

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import '../styles/GroceryItem.css';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { Constant, config } from '../Constants'

const GroceryItem = (props) =>
{
    const max_title = 300;
    var name; // input
    var card;
    const selected_grocery_items_set = new Set();
    const [sName,setName] = useState('');
    const [isEditing,setIsEditing] = useState(false);

    useEffect(() => {
        setName(props.item.item.substring(0, max_title));
        if (isEditing) {
            name.value = props.item.item;
        }
        if (props.mode === "search") {
            card.classList.add("grocery-card-search");
        }
        else {
            if (props.item.isNew) {
                let item = card;
                item.style.backgroundColor = "var(--color-success-hover-accent)";
                item.style.transition = "transform .15s ease";
                setTimeout(() => {
                    item.style.transition = "background-color .5s ease-out";
                    item.style.backgroundColor = ""
                    setTimeout(() => {
                        item.style.transition = "";
                        props.item.isNew = false;
                    }, 500);
                }, 2000);
            }
        }
    }, [name, props.item, isEditing, card, props.mode]);

    const showEditor = () => {
        setIsEditing(true);
    }

    const cancelItem = (e) => {
        setIsEditing(false);
        name.value = props.item.name;
    };

    const removeItem = async (e) => {
        props.setMessage('');
        var cCard = card;
        cCard.classList.remove("grocery-item-error");
        let obj = {id:props.item._id};
            let js = JSON.stringify(obj);
            await fetch(`${config.URL}/api/remove-grocery-item`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error)
                {
                    if (res.error === "Unauthorized" || res.error === "Forbidden") {
                        props.setMessage("You appear to be signed out, try logging out and back in again");
                    }
                    else {
                        props.setMessage(res.error);
                        cCard.classList.add("grocery-item-error");
                    }
                }
                else
                {                       
                    cCard.classList.remove("grocery-item-error");
                    props.deleteItem();
                }
            }); 
    };

    const toggleSelected = () => {
        if (props.mode === "search") {
            props.item.isSelected = !props.item.isSelected;
            if (props.item.isSelected){
                card.classList.add("grocery-item-selected");
            }
            else
                card.classList.remove("grocery-item-selected");
        }

        props.toggleItems(true);
    }

    const updateItem = async (e) => {
        props.setMessage('');
        var cCard = card;
        cCard.classList.remove("grocery-item-error");
        name.classList.remove("input-error");

        if (!name.value) {
            props.setMessage('The item must have a name');
            name.classList.add("input-error");
            return;
        }

        let obj = {id:props.item._id, item:name.value};
            let js = JSON.stringify(obj);
            await fetch(`${config.URL}/api/update-grocery-item`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error)
                {
                    if (res.error === "Unauthorized" || res.error === "Forbidden") {
                        props.setMessage("You appear to be signed out, try logging out and back in again");
                    }
                    else {
                        cCard.classList.add("grocery-item-error");
                        props.setMessage(res.error);
                    }
                }
                else
                {                       
                    cCard.classList.remove("grocery-item-error");
                    props.item.item = obj.item;
                    props.update();
                    setIsEditing(false);
                }
            });
    };

    const checkKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            updateItem(e);
        }
        else if (e.keyCode === 27) {
            e.preventDefault();
            cancelItem(e);
        }
    }

    return(
        <div onClick={() => toggleSelected()} ref={(c) => card = c} style={props.style} className={"grocery-card"}>
            <div className="grocery-content">
                <div className="grocery-header">
                    <div className="grocery-title-content">
                        {!isEditing ?
                            (<div className="grocery-title">{sName}</div>) :
                            (<textarea onKeyDown={(e) => checkKeyDown(e)} className="grocery-title-edit" ref={(c) => name = c} />)
                        }
                    </div>
                    <div className="grocery-btn-container">
                        {props.mode === "profile" ?
                        <div className="grocery-btn-container">
                            {!isEditing ?
                            (<div className="grocery-button-content">
                                <div onClick={() => showEditor()} className="grocery-btn grocery-edit">
                                <FontAwesomeIcon icon={solid("pencil")} />
                                </div>
                                <div onClick={(e) => removeItem(e)} className="grocery-btn grocery-remove">
                                    <FontAwesomeIcon icon={solid("xmark")} />
                                </div>
                            </div>
                            ) :
                            (<div className="grocery-button-content">
                                <div onClick={(e) => cancelItem(e)} className="grocery-btn grocery-cancel">
                                    <FontAwesomeIcon icon={solid("rotate-left")} />
                                </div>
                                <div onClick={(e) => updateItem(e)} className="grocery-btn grocery-update">
                                    <FontAwesomeIcon icon={solid("check")} />
                                </div>
                            </div>
                            )}
                        </div>
                        :
                        null
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroceryItem;

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/RecipeItem.css';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { useEffect, useState } from 'react';
import { Constant, config } from '../Constants'
import { faPersonMilitaryToPerson } from '@fortawesome/free-solid-svg-icons';

const RecipeItem = (props) =>
{
    const max_title = 300;
    const max_desc = 500;
    var name; // input
    var description; // input
    var card;
    const [sName,setName] = useState('');
    const [sDesc,setDesc] = useState('');
    const [isEditing,setIsEditing] = useState(false);
    const [isFavorite,setIsFavorite] = useState(false);

    useEffect(() => {
        setName(props.item.name.substring(0, max_title));
        setDesc(props.item.description.substring(0, max_desc) + "...");
        if (isEditing) {
            description.value = props.item.description;
            name.value = props.item.name;
        }
    }, [description, name, props.item, isEditing]);

    const showEditor = () => {
        setIsEditing(true);
    }

    const cancelItem = (e) => {
        setIsEditing(false);
        name.value = props.item.name;
        description.value = props.item.description;
    };

    const removeItem = async (e) => {
        var cCard = card;
        cCard.classList.remove("recipe-item-error");
        let obj = {id:props.item._id};
            let js = JSON.stringify(obj);
            await fetch(`${config.URL}/api/remove-favorite`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error)
                {
                    cCard.classList.add("recipe-item-error");
                }
                else
                {                       
                    cCard.classList.remove("recipe-item-error");
                    props.deleteItem();
                }
            }); 
    };

    const updateItem = async (e) => {
        var cCard = card;
        cCard.classList.remove("recipe-item-error");
        name.classList.remove("input-error");
        description.classList.remove("input-error");

        let hasError = false;
        if (!name.value) {
            hasError = true;
            name.classList.add("input-error");
        }
        if (!description.value) {
            hasError = true;
            description.classList.add("input-error");
        }
        if (hasError) {
            return;
        }

        let obj = {id:props.item._id, name:name.value, description:description.value};
            let js = JSON.stringify(obj);
            await fetch(`${config.URL}/api/update-favorite`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error)
                {
                    cCard.classList.add("recipe-item-error");
                }
                else
                {                       
                    cCard.classList.remove("recipe-item-error");
                    props.item.name = obj.name;
                    props.item.description = obj.description;
                    props.update();
                    setIsEditing(false);
                }
            });
    };

    const addToFavorites = async (e) => {
        setIsFavorite(true);
        var cCard = card;
        cCard.classList.remove("recipe-item-error");

        let obj = {
            user_id:Constant.user_id,
            name:props.item.name,
            description:props.item.description,
            url:props.item.url,
            image_url:props.item.image_url
        };

        let js = JSON.stringify(obj);
        await fetch(`${config.URL}/api/add-recipe`,
        {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
            let res = JSON.parse(await ret.text());
            if (res.error)
            {
                cCard.classList.add("recipe-item-error");
                setIsFavorite(false);
            }
            else
            {               
                props.item._id = res.id        
                cCard.classList.remove("recipe-item-error");
            }
        });
    };

    const removeFromFavorites = async (e) => {
        setIsFavorite(false);
        var cCard = card;
        cCard.classList.remove("recipe-item-error");
        if (!props.item._id)
            return;

        let obj = {
            id:props.item._id,
        };

        let js = JSON.stringify(obj);
        await fetch(`${config.URL}/api/remove-recipe`,
        {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
            let res = JSON.parse(await ret.text());
            if (res.error)
            {
                cCard.classList.add("recipe-item-error");
                setIsFavorite(true);
            }
            else
            {                       
                cCard.classList.remove("recipe-item-error");
            }
        });
    };

    return(
        <div ref={(c) => card = c} className="recipe-card">
            <div className="recipe-image">
                <img src={props.item.image_url} alt={sName} />
            </div>
            <div className="recipe-content">
                <div className="recipe-header">
                    <div className="recipe-title-content">
                        {!isEditing ?
                            (<div className="recipe-title">{sName}</div>) :
                            (<textarea className="recipe-title-edit" ref={(c) => name = c} />)
                        }
                    </div>
                    <div className="recipe-btn-container">
                        {props.mode === "profile" ?
                        <div className="recipe-btn-container">
                            {!isEditing ?
                            (<div className="recipe-button-content">
                                <div onClick={() => showEditor()} className="recipe-btn recipe-edit">
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
                        :
                        (<div className="recipe-btn recipe-like">
                            {!isFavorite ?
                                (<FontAwesomeIcon onClick={(e) => addToFavorites(e)} icon={regular("thumbs-up")} />) :
                                (<FontAwesomeIcon onClick={(e) => removeFromFavorites(e)} icon={solid("thumbs-up")} />)
                            }
                        </div>)
                        }
                    </div>
                </div>
                <div className="recipe-desc-content">
                    {!isEditing ?
                        (<div className="recipe-description">{sDesc} <a rel="noreferrer" target="_blank" href={props.item.url}>Read more</a></div>) :
                        (<textarea className="recipe-desc-edit" ref={(c) => description = c} />)
                    }
                </div>
            </div>
        </div>
    );
};

export default RecipeItem;

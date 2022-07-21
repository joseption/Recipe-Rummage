import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/RecipeItem.css';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { useEffect, useState } from 'react';
import { Constant, config } from '../Constants'

const RecipeItem = (props) =>
{
    const max_title = 300;
    const max_desc = 500;
    var recipe_name; // input
    var recipe_category; // input
    var card;
    const [sName,setName] = useState('');
    const [sDesc,setDesc] = useState('');
    const [isEditing,setIsEditing] = useState(false);


    useEffect(() => {
        setName(props.item.recipe_name);
        setDesc(props.item.recipe_category ? props.item.recipe_category : "");
        if (isEditing) {
            recipe_category.value = props.item.recipe_category;
            recipe_name.value = props.item.recipe_name;
        }
    }, [recipe_category, recipe_name, props.item, isEditing, props.mode]);

    const showEditor = () => {
        setIsEditing(true);
    }

    const updateFavoriteStatus = (isFav) => {
        if (isFav)
            props.addToFavorites(props.item);
        else
            props.removeFromFavorites(props.item);
    }

    const cancelItem = (e) => {
        setIsEditing(false);
        recipe_name.value = props.item.recipe_name;
        recipe_category.value = props.item.recipe_category;
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
        recipe_name.classList.remove("input-error");
        recipe_category.classList.remove("input-error");

        let hasError = false;
        if (!recipe_name.value) {
            hasError = true;
            recipe_name.classList.add("input-error");
        }
        if (!recipe_category.value) {
            hasError = true;
            recipe_category.classList.add("input-error");
        }
        if (hasError) {
            return;
        }

        let obj = {id:props.item._id, recipe_name:recipe_name.value, recipe_category:recipe_category.value};
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
                    props.item.recipe_name = obj.recipe_name;
                    props.item.recipe_category = obj.recipe_category;
                    props.update();
                    setIsEditing(false);
                }
            });
    };

    const isFavorite = () => { 
        let fave = false;
        props.favorites.forEach(x => {
            if (x.item_id === props.item._id || x._id === props.item._id) {
                fave = true;
            }
        });

        return fave;
    }

    const addToFavorites = async (e) => {
        updateFavoriteStatus(true);
        var cCard = card;
        cCard.classList.remove("recipe-item-error");

        let obj = {
            item_id:props.item._id,
            user_id:Constant.user_id,
            recipe_name:props.item.recipe_name,
            recipe_category: props.item.recipe_category,
            cook_time: props.item.cook_time,
            serving_size: props.item.serving_size,
            recipe_url:props.item.recipe_url,
            image_url:props.item.image_url,
            ingredients:props.item.ingredients,
            recipe_tags:props.item.recipe_tags
        };

        let js = JSON.stringify(obj);
        await fetch(`${config.URL}/api/add-favorite`,
        {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
            let res = JSON.parse(await ret.text());
            if (res.error)
            {
                cCard.classList.add("recipe-item-error");
                updateFavoriteStatus(false);
            }
            else
            {               
                props.item.insert_id = res.id        
                cCard.classList.remove("recipe-item-error");
            }
        });
    };

    const removeFromFavorites = async (e) => {
        updateFavoriteStatus(false);
        var cCard = card;
        cCard.classList.remove("recipe-item-error");
        if (!props.item._id)
            return;

        let obj = {
            user_id:Constant.user_id,
            item_id:props.item._id
        };

        let js = JSON.stringify(obj);
        await fetch(`${config.URL}/api/remove-favorite`,
        {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
            let res = JSON.parse(await ret.text());
            if (res.error)
            {
                cCard.classList.add("recipe-item-error");
                updateFavoriteStatus(true);
            }
            else
            {                       
                cCard.classList.remove("recipe-item-error");
            }
        });
    };

    return(
        <div ref={(c) => card = c} style={props.style} className="recipe-card">
            <div className="recipe-image">
                <img src={props.item.image_url[0]} alt={sName} />
            </div>
            <div className="recipe-content">
                <div className="recipe-header">
                    <div className="recipe-title-content">
                        {!isEditing ?
                            (<div className="recipe-title">{sName}</div>) :
                            (<textarea className="recipe-title-edit" ref={(c) => recipe_name = c} />)
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
                            {!isFavorite() ?
                                (<FontAwesomeIcon onClick={(e) => addToFavorites(e)} icon={regular("thumbs-up")} />) :
                                (<FontAwesomeIcon onClick={(e) => removeFromFavorites(e)} icon={solid("thumbs-up")} />)
                            }
                        </div>)
                        }
                    </div>
                </div>
                <div className="recipe-desc-content">
                    {!isEditing ?
                        (<div className="recipe-category">{sDesc} <a rel="noreferrer" target="_blank" href={props.item.recipe_url}>Full Recipe</a></div>) :
                        (<textarea className="recipe-desc-edit" ref={(c) => recipe_category = c} />)
                    }
                </div>
            </div>
        </div>
    );
};

export default RecipeItem;

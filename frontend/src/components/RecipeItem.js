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
    var ingredients; // input
    var card;
    var recipeItems;
    const [sName,setName] = useState('');
    const [sDesc,setDesc] = useState('');
    const [isEditing,setIsEditing] = useState(false);
    const [id,setId] = useState('');

    useEffect(() => {
        setId(crypto.randomUUID());
        setName(props.item.recipe_name);
        if (props.item.ingredients) {
            if (recipeItems) {
                recipeItems.innerHTML = "";
                props.item.ingredients.forEach(x => {
                    let div = document.createElement("div");
                    div.innerText = x.trim();
                    div.classList.add("recipe-ingredient");
                    recipeItems.append(div);
                });
            }
        }
        if (isEditing) {
            recipe_name.value = props.item.recipe_name;
            let items = "";
            props.item.ingredients.forEach(x => {
                if (x.trim() !== "")
                    items += x.trim() + ", ";
            });
            items = items.substring(0, items.length - 2);
            ingredients.value = items ? items : props.item.ingredients ? props.item.ingredients : "";
        }
    }, [ingredients, recipe_name, props.item, isEditing, props.mode, recipeItems]);

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
        ingredients.value = props.item.ingredients;
    };

    const removeItem = async (e) => {
        var cCard = document.getElementById(id);
        cCard.classList.remove("recipe-item-error");
        let obj = {id:props.item._id};
            let js = JSON.stringify(obj);
            await fetch(`${config.URL}/api/remove-favorite`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error)
                {
                    cCard.classList.add("recipe-item-error");
                    props.setRemoveError(true);
                }
                else
                {                       
                    cCard.classList.remove("recipe-item-error");
                    props.deleteItem();
                    props.setRemoveError(false);
                    props.setName('');
                    props.setType('');
                    props.setRemove(() => {});
                }
            }); 
    };

    const updateItem = async (e) => {
        var cCard = card;
        cCard.classList.remove("recipe-item-error");
        recipe_name.classList.remove("input-error");
        ingredients.classList.remove("input-error");

        let hasError = false;
        if (!recipe_name.value) {
            hasError = true;
            recipe_name.classList.add("input-error");
        }
        if (!ingredients.value) {
            hasError = true;
            ingredients.classList.add("input-error");
        }
        if (hasError) {
            return;
        }

        let savedIngredients = ingredients.value.split(",");
        for (let i = 0; i < savedIngredients.length; i++) {
            if (savedIngredients[i].trim() === "") {
                // Get rid of empty strings
                savedIngredients.splice(i, 1);
                i--;
            }
            else
                savedIngredients[i] = savedIngredients[i].trim();
        }
        // Only allow one of each ingredient
        savedIngredients = [...new Set(savedIngredients)];

        let obj = {id:props.item._id, recipe_name:recipe_name.value, ingredients:savedIngredients};
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
                    props.item.ingredients = obj.ingredients;
                    props.update();
                    setIsEditing(false);
                }
            });
    };

    const startRemoval = () => {
        props.setName(sName);
        props.setType("recipes");
        props.setRemove({go: removeItem});
        props.setRemoveError(false);
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
            ingredients: props.item.ingredients,
            cook_time: props.item.cook_time,
            serving_size: props.item.serving_size,
            recipe_url:props.item.recipe_url,
            image_url:props.item.image_url,
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
        <div id={id} ref={(c) => card = c} style={props.style} className="recipe-card">
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
                                <div onClick={(e) => startRemoval()} className="recipe-btn recipe-remove">
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
                        (<div className="recipe-desc-contain">
                            <div ref={(c) => recipeItems = c} className="recipe-category"></div>
                            <div className="recipe-url"><a rel="noreferrer" target="_blank" href={props.item.recipe_url}>Full Recipe <FontAwesomeIcon icon={solid("arrow-up-right-from-square")} /></a></div>
                        </div>) :
                        (<div className="recipe-editor-container">
                            <textarea className="recipe-desc-edit" ref={(c) => ingredients = c} />
                            <div className="recipe-edit-note">Use a comma to separate ingredients</div>
                        </div>)
                    }
                </div>
            </div>
        </div>
    );
};

export default RecipeItem;

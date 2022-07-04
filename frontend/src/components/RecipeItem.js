import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/RecipeItem.css';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { useEffect, useState } from 'react';
import { config } from '../Constants'

const RecipeItem = (props) =>
{
    var name; // input
    var description; // input
    const [sName,setName] = useState(false);
    const [sDesc,setDesc] = useState(false);
    const [isEditing,setIsEditing] = useState(false);
    const [isFavorite,setIsFavorite] = useState(false);

    useEffect(() => {
        setName(props.item.name);
        setDesc(props.item.description);
        if (isEditing) {
            description.value = props.item.description;
            name.value = props.item.name;
        }
    }, [description, name, props.item, isEditing]);

    const cancelItem = (e) => {
        setIsEditing(false);
    };

    const removeItem = async (e) => {
        
    };

    const updateItem = async (e) => {
        setIsEditing(false);
    };

    const addToFavorites = async (e) => {
        setIsFavorite(true);

    };

    const removeFromFavorites = (e) => {
        setIsFavorite(false);
    };

    return(
        <div className="recipe-card">
            <div className="recipe-image"></div>
            <div className="recipe-content">
                <div className="recipe-header">
                    <div className="recipe-title-content">
                        {!isEditing ?
                            (<div className="recipe-title">{sName}</div>) :
                            (<textarea className="recipe-title-edit" ref={(c) => name = c} value="Dummy Edit Text" />)
                        }
                    </div>
                    <div className="recipe-btn-container">
                        {props.mode === "profile" ?
                        <div className="recipe-btn-container">
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
                        (<div className="recipe-description">{sDesc}</div>) :
                        (<textarea className="recipe-desc-edit" ref={(c) => description = c} />)
                    }
                </div>
            </div>
        </div>
    );
};

export default RecipeItem;

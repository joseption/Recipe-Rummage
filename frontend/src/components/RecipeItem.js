import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/RecipeItem.css';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { useEffect, useState } from 'react';

const RecipeItem = (props) =>
{
    var recipeDescription;
    var recipeName;

    const [isEditing,setIsEditing] = useState(false);
    const [isFavorite,setIsFavorite] = useState(false);

    const cancelItem = (e) => {
        setIsEditing(false);
    };

    const removeItem = (e) => {
        
    };

    const updateItem = (e) => {
        setIsEditing(false);
    };

    const addToFavorites = (e) => {
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
                            (<div className="recipe-title">Dummy Title</div>) :
                            (<textarea className="recipe-title-edit" ref={(c) => recipeName = c} value="Dummy Edit Text" />)
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
                        (<div className="recipe-description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</div>) :
                        (<textarea className="recipe-desc-edit" ref={(c) => recipeDescription = c} value="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." />)
                    }
                </div>
            </div>
        </div>
    );
};

export default RecipeItem;

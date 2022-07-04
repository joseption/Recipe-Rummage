import '../styles/RecipeList.css';
import RecipeItem from '../components/RecipeItem';
import { useCallback, useEffect, useState } from 'react';
import { Constant, config } from '../Constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';

const RecipeList = (props) =>
{
    const noRecipesMsg = "You don't have any recipes saved yet!\n\nSearch for recipes and add them to your favorites first."
    const [message,setMessage] = useState('');
    const [recipeError,setRecipeError] = useState('');
    const [favorites,setFavorites] = useState([]);
    const [favoritesLoaded,setFavoritesLoaded] = useState(false);
    const [isLoading,setIsLoading] = useState(false);

    const getFavorites = useCallback(async () => {
        if (!favoritesLoaded) {
            setIsLoading(true);
            setFavoritesLoaded(true);
            setRecipeError("");

            let obj = {user_id: Constant.user_id};
            let js = JSON.stringify(obj);

            await fetch(`${config.URL}/api/get-favorite-items`,
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
                        setRecipeError("no_recipes");
                    else
                        setFavorites(res.results);
                        
                    setMessage('');
                }
                setIsLoading(false);
            });
        }
    })

    const navSearch = () => {
        window.location.href = "/search";
    }

    useEffect(() => {
        if (props.mode === "profile") { //only fetch favorites if on profile
            getFavorites();
        }

    }, [props.mode, getFavorites]);

    return(
        <div>
            <div className="recipe-list-title">{props.title}</div>
            <div><input className="recipe-list-search" type="text" placeholder={props.searchPlaceHolder} /></div>
            {isLoading ?
            (<div className="loading">
                <div className="rotating">
                    <FontAwesomeIcon icon={solid('spinner')} />
                </div>
                <div>Loading</div>
            </div>) : null}
            {message ?
            (<div className="error-msg">{message}</div>) : null}
            {props.mode === "profile" ? /* Keep this top part for favorite recipes only */
            (<div className="recipe-list-items">
                {!recipeError && favorites && props.mode === "profile" ?
                    (favorites.map((item, key) => {
                        return <RecipeItem key={key} item={item} mode={props.mode} />
                    }))
                    :
                    (<div className="recipe-list-msg">
                        {recipeError === "no_recipes" ?
                            (noRecipesMsg.split('\n').map((line, i) => {
                                return <span key={i}>{line}<br/></span>
                            }))
                        : null
                        }
                        {recipeError === "no_recipes" ?
                            <div onClick={() => navSearch()} className="btn btn-custom-search">
                            Search
                            <div className="btn-search-icon">
                                <FontAwesomeIcon icon={solid("search")} />
                            </div>
                        </div> : null}
                    </div>)
                }
            </div>)
            : /* Keep this bottom part for searched recipes only */
            (
                <div>This is where recipe search stuff goes</div>
            )
            }
        </div>
    );
};

export default RecipeList;

import '../styles/RecipeList.css';
import RecipeItem from '../components/RecipeItem';
import { useCallback, useEffect, useState } from 'react';
import { Constant, config } from '../Constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';

const RecipeList = (props) =>
{
    const noRecipesMsg = "You don't have any recipes saved yet!\n\nSearch for recipes and add them to your favorites first."
    const noResultsMsg = "No results. Remove some grocery items and try again."
    const noLocalResultsMsg = "No results were found that match your criteria."
    const getStarted = "To get started, select some pantry items and click the 'Find Recipes' button."
    const [message,setMessage] = useState('');
    const [favorites,setFavorites] = useState([]);
    const [favoritesLoaded,setFavoritesLoaded] = useState(false);
    const [isLoading,setIsLoading] = useState(false);
    const [search,setSearch] = useState('');
    const [isLoaded,setIsLoaded] = useState(false);

    const deleteItem = (id) => {
        for (let i = 0; i < favorites.length; i++) {
            if (favorites[i]._id === id) {
                var faves = favorites.slice();
                faves.splice(i, 1);
                setFavorites(faves);
                break;
            }
        }
        if (faves.length === 0) {
            props.setRecipeError("no_recipes");
        }
        else if (search.length > 0) {
            setSearch(search);
        }
    };

    const update = () => {
        if (search.length > 0) {
            let s = search;
            setSearch('');
            setTimeout(() => {
                setSearch(s);
            }, 50);
        }
    };

    const getFavorites = useCallback(async () => {
        if (!favoritesLoaded) {
            let prop = props;
            setIsLoading(true);
            setFavoritesLoaded(true);
            prop.setRecipeError("");

            let obj = {user_id: Constant.user_id};
            let js = JSON.stringify(obj);

            await fetch(`${config.URL}/api/get-favorites`,
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
                        prop.setRecipeError("no_recipes");
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
        if (!isLoaded) {
            setIsLoaded(true);
            if (props.mode === "profile") { //only fetch favorites if on profile
                getFavorites();
            }
            else {
                props.setRecipeError("get_started");
            }
        }
    }, [getFavorites, props, isLoaded]);

    return(
        <div>
            <div className="recipe-list-title">{props.title}</div>
            <div><input className="recipe-list-search" type="text" onChange={(e) => setSearch(e.target.value)} placeholder={props.searchPlaceHolder} /></div>
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
                {!props.recipeError && favorites ?
                    (favorites.filter(x => (x.name.toLowerCase().includes(search.toLowerCase()) || x.description.toLowerCase().includes(search.toLowerCase()))).map((item, key) => {
                        return <RecipeItem update={() => update()} deleteItem={() => deleteItem(item._id)} key={key} item={item} mode={props.mode} />
                    }))
                    :
                    (<div className="recipe-list-msg">
                        {props.recipeError === "no_recipes" ?
                            (noRecipesMsg.split('\n').map((line, i) => {
                                return <span key={i}>{line}<br/></span>
                            }))
                        : null
                        }
                        {props.recipeError === "no_recipes" ?
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
            (<div className="recipe-list-items">
                {!props.recipeError || (props.recipeError === "get_started" && props.results > 0) ?
                    (props.results.filter(x => (x.name.toLowerCase().includes(search.toLowerCase()) || x.description.toLowerCase().includes(search.toLowerCase()))).map((item, key) => {
                        return <RecipeItem key={key} item={item} mode={props.mode} />
                    }))
                    :
                    (<div className="recipe-list-msg">
                        {props.recipeError === "no_results" ?
                            (noResultsMsg.split('\n').map((line, i) => {
                                return <span key={i}>{line}<br/></span>
                            }))
                        : null
                        }
                        {props.recipeError === "no_local_results" ?
                            (noLocalResultsMsg.split('\n').map((line, i) => {
                                return <span key={i}>{line}<br/></span>
                            }))
                        : null
                        }
                        {props.recipeError === "get_started" ?
                            (getStarted.split('\n').map((line, i) => {
                                return <span key={i}>{line}<br/></span>
                            }))
                        : null
                        }
                    </div>)
                }
            </div>)
            }
        </div>
    );
};

export default RecipeList;

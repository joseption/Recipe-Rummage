import '../styles/RecipeList.css';
import RecipeItem from '../components/RecipeItem';
import { useCallback, useEffect, useState } from 'react';
import { Constant, config } from '../Constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { faV } from '@fortawesome/free-solid-svg-icons';

const RecipeList = (props) =>
{
    var container;
    const noRecipesMsg = "You don't have any recipes saved yet\n\nSearch for recipes and add them to your favorites first"
    const noResultsMsg = "No results. Remove some grocery items and try again"
    const noLocalResultsMsg = "No results were found that match your criteria"
    const getStarted = "To get started, select some pantry items and click the 'Find Recipes' button"
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
            if (props.mode === "search") {
                props.setRecipeError("get_started");
            }
            else
                props.setRecipeError("");

            let obj = {user_id: Constant.user_id};
            let js = JSON.stringify(obj);

            await fetch(`${config.URL}/api/get-favorites`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error)
                {
                    if (res.error === "Unauthorized" || res.error === "Forbidden") {
                        setMessage("You appear to be signed out, try logging out and back in again");
                        props.setRecipeError("signed_out");
                    }
                    else
                        setMessage(res.error);
                }
                else
                {
                    if (res.results.length === 0) {
                        if (props.mode === "profile")
                            props.setRecipeError("no_recipes");
                    }
                    else
                        setFavorites(res.results);
                        
                    setMessage('');
                }
                setIsLoading(false);
            });
        }
    }, [props, favoritesLoaded, setFavoritesLoaded])

    const navSearch = () => {
        window.location.href = "/search";
    }

    const removeFromFavorites = (item) => {
        item.isFavorite = false;
        let faves = favorites.slice();
        let idx = faves.findIndex(x => x.item_id === item._id || x._id === item._id);
        if (idx > -1) {
            faves.splice(idx, 1)
            setFavorites(faves);
        }
    };

    const addToFavorites = useCallback((item) => {
        item.isFavorite = true;
        let faves = favorites.slice();
        faves.push(item);
        setFavorites(faves);
    });

    useEffect(() => {
        if (!isLoaded) {
            setIsLoaded(true);
            getFavorites();
        }
        if (!props.toggleView && props.isMobile) {
            container.parentElement.style.display = "none";
        }
        else {
            container.parentElement.style.display = "block";
        }
    }, [getFavorites, props, isLoaded, container, favorites, addToFavorites]);

    const filteredItems = () => {
        let res;

        if (props.mode === "profile") {
            res = favorites
            if (res)
                res = res.slice();
        }
        else {
            res = props.results.slice();
            if (res)
                res = res.slice();
        }

        let ret = [];
        if (res) {
            ret = res.filter(x => {
                if (x && ((x.recipe_name && x.recipe_name.toLowerCase().includes(search.toLowerCase())) ||
                    (x.recipe_tags && x.recipe_tags.some(x => x.toLowerCase().includes(search.toLowerCase()))) ||
                    (x.ingredients && x.ingredients.some(x => x.toLowerCase().includes(search.toLowerCase()))))) {
                    x.display = "flex";
                }
                else {
                    x.display = "none";
                }

                return x;
            })
        }

        return ret;
    }

    const mappedItems = () => {
        return filteredItems().map((item, key) => {
            return <RecipeItem setRemoveError={props.setRemoveError} setRemove={props.setRemove} setName={props.setName} setType={props.setType} update={() => update()} favorites={favorites} deleteItem={() => deleteItem(item._id)} addToFavorites={(item) => addToFavorites(item)} removeFromFavorites={(item) => removeFromFavorites(item)} style={{display: item.display}} key={key} item={item} mode={props.mode} />
        });
    };

    const anyShowing = () => {
        var items = filteredItems();
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].display !== "none") {
                    return true;
                }
            }
        }

        return false;
    };

    return(
        <div ref={(c) => container = c} className="recipe-container">
            <div className="generic-header-content">
            <div className="recipe-list-title">{props.title}</div>
                {props.isMobile ?
                        <FontAwesomeIcon onClick={() => props.setToggleView(!props.toggleView)} className="view-switch" icon={solid('window-restore')} />
                    : null }
            </div>
            <div className="recipe-search-input-container"><input className="recipe-list-search" type="text" onChange={(e) => setSearch(e.target.value)} placeholder={props.searchPlaceHolder} /></div>
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
                {!props.recipeError && favorites && anyShowing() ?
                    (mappedItems())
                    :
                    props.recipeError !== "signed_out" ? 
                    (<div className="recipe-list-msg">
                        {!props.recipeError && !anyShowing() && favorites.length > 0 ?
                            (noLocalResultsMsg.split('\n').map((line, i) => {
                                return <span key={i}>{line}<br/></span>
                            }))
                        : null
                        }              
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
                    </div>) : null
                }
            </div>)
            : /* Keep this bottom part for searched recipes only */
            (<div className="recipe-list-items">
                {(!props.recipeError || (props.recipeError === "get_started" && props.results > 0)) && anyShowing() ?
                    (mappedItems())
                    :
                    (<div className="recipe-list-msg">
                        {props.recipeError === "no_results" ?
                            (noResultsMsg.split('\n').map((line, i) => {
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
                        {props.recipeError !== "no_results" && props.recipeError !== "get_started" && !anyShowing() ?
                            (noLocalResultsMsg.split('\n').map((line, i) => {
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

import RecipeList from '../components/RecipeList';
import GroceryList from '../components/GroceryList';
import Navigation from '../components/Navigation';
import { useState, useEffect } from 'react';
import { Constant, config } from '../Constants';

const SearchPage = (props) =>
{
    const [error, setError] = useState('');
    const [results, setResults] = useState([]);
    const [recipeError,setRecipeError] = useState('');
    const [groceryError,setGroceryError] = useState('');
    const [items,setItems] = useState([]);
    const [toggleView,setToggleView] = useState(false);
    const [isMobile,setIsMobile] = useState(false);
    const [searchAll,setSearchAll] = useState(false);

    const handleResize = () => {
        if (window.innerWidth <= 1080) {
            setIsMobile(true)
        } else {
            setIsMobile(false)
        }
    }

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
      })

    const getSearchResults = async () => {
        // Fix this how ever it needs to work with API
        setError('');
        setRecipeError('');
        let list = [];
        items.forEach(x => {
            if (x.isSelected)
                list.push(x.item.toLowerCase());
        });

        if (list.length > 0) {    
            let obj = {
                selected_grocery_items:list,
                search_all:searchAll
            };
            let js = JSON.stringify(obj);

            await fetch(`${config.URL}/api/recipe-search`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error)
                {
                    if (res.error === "Unauthorized" || res.error === "Forbidden") {
                        setError("You appear to be signed out, try logging out and back in again");
                        setRecipeError("signed_out");
                    }
                    else
                        setError(res.error);
                }
                else
                {   
                    if (res.results.length > 0) {
                        setResults(res.results);
                        setToggleView(true);
                    } 
                    else {
                        setRecipeError("no_results")
                    }                
                    setError('');
                }
            });
        }
        else {
            setError("Please add items before searching");
        }
    }

    return(
        <div className="main-page-container">
            <Navigation mode="search" />           
            <div className="main-content-container">
                <div className="grocery-list">
                    <GroceryList searchAll={searchAll} setSearchAll={setSearchAll} toggleView={toggleView} setToggleView={setToggleView} isMobile={isMobile} setItems={setItems} items={items} setGroceryError={setGroceryError} groceryError={groceryError} error={error} search={() => getSearchResults()} mode={"search"} />
                </div>
                <div className="recipe-list">
                    <RecipeList toggleView={toggleView} setToggleView={setToggleView} isMobile={isMobile} setRecipeError={setRecipeError} recipeError={recipeError} results={results} searchPlaceHolder={"Search Recipes"} title={"Recipe Results"} mode={"search"} />
                </div>
            </div>
        </div>
    );
};

export default SearchPage;

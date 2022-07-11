import '../styles/SearchPage.css';
import RecipeList from '../components/RecipeList';
import GroceryList from '../components/GroceryList';
import Navigation from '../components/Navigation';
import { useState } from 'react';
import { Constant, config } from '../Constants';

const SearchPage = (props) =>
{
    const [ingredients, setIngredients] = useState(["sauce"]);
    const [error, setError] = useState('');
    const [results, setResults] = useState([]);
    const [recipeError,setRecipeError] = useState('');

    const getSearchResults = async () => {
        setError('');
        setRecipeError('');
        let list = "";
        ingredients.forEach(x => {
            list += x + "%2C";
        });
        let idx = list.lastIndexOf("%2C");
        if (idx > -1)
            list = list.substring(0, idx);

        if (list) {    
            let obj = {
                items:list,
            };
    
            let js = JSON.stringify(obj);
            await fetch(`${config.URL}/api/search-recipes`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json', 'authorization': Constant.token}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error)
                {
                    setError(res.error);
                }
                else
                {   
                    if (res.result.length > 0) {
                        let list = [];
                        for (let i = 0; i < res.result.length; i++) {
                            list.push({
                                name: res.result[i].title,
                                image_url: res.result[i].image,
                                description: res.result[i].summary,
                                url: res.result[i].source_url
                            });
                        }
                        setResults(list);
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
                    <GroceryList error={error} search={() => getSearchResults()} mode={"search"} />
                </div>
                <div className="recipe-list">
                    <RecipeList setRecipeError={setRecipeError} recipeError={recipeError} results={results} searchPlaceHolder={"Search Recipes"} title={"Recipe Results"} mode={"search"} />
                </div>
            </div>
        </div>
    );
};

export default SearchPage;

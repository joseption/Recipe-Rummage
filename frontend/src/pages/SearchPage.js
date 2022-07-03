import '../styles/SearchPage.css';
import RecipeList from '../components/RecipeList';
import GroceryList from '../components/GroceryList';
import Navigation from '../components/Navigation';

const SearchPage = (props) =>
{

    return(
        <div className="main-page-container">
            <Navigation />
            
            <div className="main-content-container">
                <div className="grocery-list">
                    <GroceryList mode={"search"} />
                </div>
                <div className="recipe-list">
                    <RecipeList searchPlaceHolder={"Search Recipes"} title={"Recipe Results"} mode={"search"} />
                </div>
            </div>
        </div>
    );
};

export default SearchPage;

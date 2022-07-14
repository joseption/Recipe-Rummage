import RecipeList from '../components/RecipeList';
import GroceryList from '../components/GroceryList';
import Navigation from '../components/Navigation';
import { useState, useEffect } from 'react';

const ProfilePage = (props) =>
{
    const [recipeError,setRecipeError] = useState('');
    const [groceryError,setGroceryError] = useState('');
    const [items,setItems] = useState([]);
    const [toggleView,setToggleView] = useState(false);
    const [isMobile,setIsMobile] = useState(false);

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

    return(
        <div className="main-page-container">
            <Navigation mode={"profile"} />
            
            <div className="main-content-container">
                <div className="grocery-list">
                    <GroceryList toggleView={toggleView} setToggleView={setToggleView} isMobile={isMobile} setItems={setItems} items={items} setGroceryError={setGroceryError} groceryError={groceryError} mode={"profile"} />
                </div>
                <div className="recipe-list">
                    <RecipeList toggleView={toggleView} setToggleView={setToggleView} isMobile={isMobile} setRecipeError={setRecipeError} recipeError={recipeError} searchPlaceHolder={"Find My Recipe"} title={"My Recipes"} mode={"profile"} />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

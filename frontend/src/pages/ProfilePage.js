import '../styles/ProfilePage.css';
import RecipeList from '../components/RecipeList';
import GroceryList from '../components/GroceryList';
import Navigation from '../components/Navigation';

const ProfilePage = (props) =>
{
    return(
        <div className="main-page-container">
            <Navigation />
            
            <div className="main-content-container">
                <div className="profile-grocery-list">
                    <GroceryList mode={"profile"} />
                </div>
                <div className="profile-recipe-list">
                    <RecipeList searchPlaceHolder={"Find My Recipe"} title={"My Recipes"} mode={"profile"} />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
import RecipeList from '../components/RecipeList';
import GroceryList from '../components/GroceryList';
import Navigation from '../components/Navigation';
import { useState, useEffect } from 'react';

const ProfilePage = (props) =>
{
    var confirmContainer;
    const [recipeError,setRecipeError] = useState('');
    const [groceryError,setGroceryError] = useState('');
    const [items,setItems] = useState([]);
    const [toggleView,setToggleView] = useState(false);
    const [isMobile,setIsMobile] = useState(false);
    const [name,setName] = useState('');
    const [type,setType] = useState('');
    const [remove,setRemove] = useState(() => {});
    const [removeError,setRemoveError] = useState(false);

    const handleResize = () => {
        if (window.innerWidth <= 1080) {
            setIsMobile(true)
        } else {
            setIsMobile(false)
        }
    }

    const cancel = () => {
        setRemoveError(false);
        setName('');
        setType('');
        setRemove(() => {});
    }

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
        let confirm = confirmContainer;
        if (confirm) {
            setTimeout(() => {
                if (name)
                    confirm.classList.add("confirm-show");
                else
                    confirm.classList.remove("confirm-show");
            }, 250);
        }
      }, [name, type, confirmContainer])

    return(
        <div className="main-page-container">
            {name ?
            (<div className="confirm-container">
                <div className="confirm-bg"></div>
                <div ref={(c) => confirmContainer = c} className="confirmation">
                    {!removeError ?
                        (<div>Are you sure you want to remove <b>{name}</b> from your {type}?</div>)
                        :
                        (<div><div className='confirm-error'>Uh oh, looks like an error occurred.</div><br /><div>Would you like to try to remove <b>{name}</b> from your {type} again?</div></div>)
                    }
                    <div className="confirm-btns">
                        <div onClick={() => cancel()} className="btn btn-default">Cancel</div>
                        <div onClick={() => remove.go()} className="btn btn-danger">Remove</div>
                    </div>
                </div>
            </div>) : null }
            <Navigation mode={"profile"} />
            
            <div className="main-content-container">
                <div className="grocery-list">
                    <GroceryList setRemoveError={setRemoveError} setRemove={setRemove} setName={setName} setType={setType} toggleView={toggleView} setToggleView={setToggleView} isMobile={isMobile} setItems={setItems} items={items} setGroceryError={setGroceryError} groceryError={groceryError} mode={"profile"} />
                </div>
                <div className="recipe-list">
                    <RecipeList setRemoveError={setRemoveError} setRemove={setRemove} setName={setName} setType={setType} toggleView={toggleView} setToggleView={setToggleView} isMobile={isMobile} setRecipeError={setRecipeError} recipeError={recipeError} searchPlaceHolder={"Find My Recipe"} title={"My Recipes"} mode={"profile"} />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

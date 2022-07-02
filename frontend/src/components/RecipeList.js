import '../styles/RecipeList.css';
import RecipeItem from '../components/RecipeItem';

const RecipeList = (props) =>
{

    return(
        <div>
            <div className="recipe-list-title">{props.title}</div>
            <div><input className="recipe-list-search" placeholder={props.searchPlaceHolder} /></div>
            <div className="recipe-list-items">
                <RecipeItem mode={props.mode} />
                <RecipeItem mode={props.mode} />
                <RecipeItem mode={props.mode} />
            </div>
        </div>
    );
};

export default RecipeList;

import '../styles/RecipeList.css';
import RecipeItem from '../components/RecipeItem';

const RecipeList = (props) =>
{

    return(
        <div>
            <RecipeItem mode={props.mode} />
        </div>
    );
};

export default RecipeList;

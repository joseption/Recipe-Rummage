import '../styles/GroceryList.css';
import GroceryItem from '../components/GroceryItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro'

const GroceryList = (props) =>
{

    return(
        <div>
            <div className="grocery-list-title">{props.title}</div>
            <div>
                <div>
                    <input className="grocery-list-add" placeholder={props.addPlaceHolder} />
                    <div className="btn btn-success">
                        <FontAwesomeIcon icon={solid("plus")} />
                    </div>
                    <div className="error-msg"></div>
                </div>
                <input className="grocery-list-search-btn" placeholder={props.addPlaceHolder} />
            </div>
            <hr className="splitter" />
            <label className="check-container">Show Only Added Items
                <input type="checkbox" checked="checked" />
                <span className="check-checkmark"></span>
            </label>
            <div>
                <input className="grocery-list-search" placeholder={props.searchPlaceHolder} />
            </div>
            <div className="grocery-list-items">
            </div>
        </div>
    );
};

export default GroceryList;

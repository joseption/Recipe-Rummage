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
                    <div>
                        {props.mode === "profile" ?
                            (<div className="grocery-list-add-container">
                                <input type="text" className="grocery-list-add" placeholder="Add Item" />
                                <div className="btn btn-success grocery-list-add-btn">
                                    <FontAwesomeIcon icon={solid("plus")} />
                                </div>
                            </div>)
                            :
                            (<div className="btn btn-success grocery-list-search-btn"></div>)
                        }
                    </div>
                    <div className="error-msg grocery-list-error-msg"></div>
                </div>
            </div>
            <hr className="splitter" />
            <div className="grocery-list-search-container">
                {props.mode !== "profile" ?
                (<label className="check-container">Show Only Added Items
                    <input type="checkbox" checked="checked" />
                    <span className="check-checkmark"></span>
                </label>) : null}
                <div>
                    <input type="text" className="grocery-list-search" placeholder="Search Pantry..." />
                </div>
            </div>
            <div className="grocery-list-items">
            </div>
        </div>
    );
};

export default GroceryList;

import '../styles/GroceryList.css';
import GroceryItem from '../components/GroceryItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { useState } from 'react';

const GroceryList = (props) =>
{
    const [checked,setChecked] = useState(false);
    const toggleItems = (e) => {
        setChecked(!checked);
        if (checked) {
            // to do show only added items
        }
        else {
            // to do show all items
        }
    }

    return(
        <div>
            <div className="grocery-list-title">My Pantry</div>
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
                            (<div className="btn btn-success grocery-list-search-btn">Find Recipes</div>)
                        }
                    </div>
                    <div className="error-msg grocery-list-error-msg"></div>
                </div>
            </div>
            <hr className="splitter" />
            <div className="grocery-list-search-container">
                {props.mode !== "profile" ?
                (<label className="grocery-list-check check-container">Show Only Added Items
                    <input type="checkbox" onChange={(e) => toggleItems(e)} checked={checked} />
                    <span className="check-checkmark"></span>
                </label>) : null}
                <div>
                    <input type="text" className="grocery-list-search" placeholder="Search Pantry..." />
                </div>
            </div>
            <div className="grocery-list-items">
                <div>GROCERY ITEM COMPONENTS GO HERE!</div>
            </div>
        </div>
    );
};

export default GroceryList;

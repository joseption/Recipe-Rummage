import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/Navigation.css';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

const Navigation = (props) =>
{

    const toggleSelectedOff = (e) => {
        var selected = document.querySelector(".nav-selected");
        if (selected) {
            selected.classList.add("nav-selected-hide");
        }
    };

    const toggleSelectedOn = (e) => {
        var selected = document.querySelector(".nav-selected");
        if (selected) {
            selected.classList.remove("nav-selected-hide");
        }
    };

    const navProfile = () => {
        if (props.mode !== "profile") {
            window.location.href = "/profile";
        }
    };

    const navSearch = () => {
        if (props.mode !== "search") {
            window.location.href = "/search";
        }
    };

    const navLogout = () => {
        localStorage.removeItem("user_data")
        window.location.href = '/login';
    };

    return(
        <div className="nav-container">
            <div className="nav-content">
                <div className="nav-inner-content">
                    <div className="nav-page-content" onMouseEnter={(e) => toggleSelectedOff(e)}
                        onMouseLeave={(e) => toggleSelectedOn(e)}>
                        <div onClick={() => navProfile()} className="nav-option">
                            <div className="nav-selection-container">
                                {props.mode === "profile" ?
                                (<div className="nav-selected"></div>) : null}
                                <div className="nav-selector"></div>
                            </div>
                            <div className="nav-group-content">
                                <div className="nav-text">Profile</div>
                                <div className="nav-img nav-img-hidden">
                                    <FontAwesomeIcon icon={solid("user")} />
                                </div>
                            </div>
                        </div>
                        <div onClick={() => navSearch()} className="nav-option">
                            <div className="nav-selection-container">
                                {props.mode !== "profile" ?
                                    (<div className="nav-selected"></div>) : null}
                                    <div className="nav-selector"></div>
                            </div>
                            <div className="nav-group-content">
                                <div className="nav-text">Search</div>
                                <div className="nav-img nav-search-icon">
                                    <FontAwesomeIcon icon={solid("search")} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div onClick={() => navLogout()} className="nav-option">
                        <div className="nav-selection-container">
                            <div className="nav-selector"></div>
                        </div>
                        <div className="nav-logout-content">
                            <div className="nav-text">Logout</div>
                            <div className="nav-img">
                                <FontAwesomeIcon icon={solid("arrow-right-from-bracket")} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navigation;

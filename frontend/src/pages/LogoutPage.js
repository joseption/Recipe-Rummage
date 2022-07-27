import { useEffect } from "react";

function LogoutPage(props)
{    
    useEffect(() => {
        localStorage.removeItem("user_data");
        window.location.href = "/login";
    });

    return(
        <div className="logout-text">
            Signing out...
        </div>
    );
};

export default LogoutPage;

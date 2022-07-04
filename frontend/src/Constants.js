const prod = {
     URL: "https://poosd.herokuapp.com"
};

const dev = {
    URL: "http://localhost:5000"
};

const getToken = () => {
    if (localStorage.getItem("user_data")) {
        try {
            let data = JSON.parse(localStorage.getItem("user_data"));
                return data.auth;
        }
        catch {
            return "";
        }
    }  
    else {
        return "";
    }
};

const getUserID = () => {
    if (localStorage.getItem("user_data")) {
        try {
            let data = JSON.parse(localStorage.getItem("user_data"));
            return data.id;
        }
        catch {
            return "";
        }
    }  
    else {
        return "";
    }
};

export const Constant = {
    token: getToken(),
    user_id: getUserID()
};
export const config = process.env.NODE_ENV === "development" ? dev : prod;
const prod = {
     URL: "https://poosd.herokuapp.com"
};

const dev = {
    URL: "http://localhost:5000"
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
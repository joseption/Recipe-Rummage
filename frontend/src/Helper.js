export const validateEmail = (email) => {
    return String(email)
    .toLowerCase()
    .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const acceptableSymbols = (e) => {
    return '(!, @, #, $, %, &, ?)';
}

export const includesSymbol = (text) => {
    return /[!@#$%&?]/.test(text);
};

export const isAtLeastEightChars = (text) => {
    return text.length >= 8;
};

export const includesUpperContains = (text) => {
    return /[A-Z]/.test(text);    
}

export const textMatches = (text1, text2) => {
    return text1 === text2 && text1 && text2;
}
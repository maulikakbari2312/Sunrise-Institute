const admin = localStorage.getItem('isAdmin');
const branchs = localStorage.getItem('branch');
const initialState = {
    login: false,
    isAdmin: admin,
    userBranch: branchs
};

const user = (state = initialState, action) => {
    switch (action.type) {
        case "USERLOGOUT":
            localStorage.clear();
            return {
                ...state,
                login: false
            };
        case "USERLOGIN":
            return {
                ...state,
                login: true
            };
        case "USERROLE":
            return {
                ...state,
                isAdmin: action.payload
            };
        case "USERBRANCH":
            return {
                ...state,
                userBranch: action.payload
            };

        default:
            return state;
    }
};

export default user;

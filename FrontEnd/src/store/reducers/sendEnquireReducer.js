const initialState = {
    sendEnquire: [],
};

const sendEnquire = (state = initialState, action) => {
    switch (action.type) {
        case "SENDENQUIRE":
            return {
                ...state,
                sendEnquire: [...state.sendEnquire, action.payload]
            };
        case "REMOVESENDENQUIRE":
            return {
                ...state,
                sendEnquire: state.sendEnquire.filter(item => item?.tokenId !== action?.payload?.tokenId)
            };
        default:
            return state;
    }
};

export default sendEnquire;
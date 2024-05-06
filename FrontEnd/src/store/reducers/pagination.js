const initialState = {
    currentPage: 0,
    pageSize: 10,
    totalRowsCount: 0,
    fetchDataTable: false,
};

const pagination = (state = initialState, action) => {
    switch (action.type) {
        case "CURRENTPAGE":
            return {
                ...state,
                currentPage: action.payload
            };
        case "PAGESIZE":
            return {
                ...state,
                pageSize: action.payload
            };
        case "TOTALROWSCOUNT":
            return {
                ...state,
                totalRowsCount: action.payload
            };
        case "FETCHDATATABLE":
            return {
                ...state,
                fetchDataTable: action.payload
            };
        case "SETTABLEINITIALSTATE":
            return {
                ...state,
                currentPage: 1,
                pageSize: 10,
                totalRowsCount: 0,
                fetchDataTable: false,
            };
        default:
            return state;
    }
};

export default pagination;

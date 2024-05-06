export const userLogin = (val) => {
    return {
        type: 'USERLOGIN',
        payload: val
    }
}

export const userLogout = (val) => {
    return {
        type: 'USERLOGOUT',
        payload: val
    }
}

export const userRole = (val) => {
    return {
        type: 'USERROLE',
        payload: val
    }
}

export const userBranch = (val) => {
    return {
        type: 'USERBRANCH',
        payload: val
    }
}

export const modelData = (val) => {
    return {
        type: 'MODELDATA',
        payload: val
    }
}

export const modelEdit = (val) => {
    return {
        type: 'MODELEDIT',
        payload: val
    }
}

export const modelDelete = (val) => {
    return {
        type: 'MODELDELETE',
        payload: val
    }
}

export const selectData = (val) => {
    return {
        type: 'SELECTDATA',
        payload: val
    }
}
export const sendEnquire = (val) => {
    return {
        type: 'SENDENQUIRE',
        payload: val
    }
}
export const removeSendEnquire = (val) => {
    return {
        type: 'REMOVESENDENQUIRE',
        payload: val
    }
}
export const currentPageState = (val) => {
    return {
        type: 'CURRENTPAGE',
        payload: val
    }
}
export const pageSize = (val) => {
    return {
        type: 'PAGESIZE',
        payload: val
    }
}
export const totalRowsCount = (val) => {
    return {
        type: 'TOTALROWSCOUNT',
        payload: val
    }
}

export const fetchDataTable = (val) => {
    return {
        type: 'FETCHDATATABLE',
        payload: val
    }
}
export const setTableinitialState = (val) => {
    return {
        type: 'SETTABLEINITIALSTATE',
        payload: val
    }
}

export const parentSelectedData = (val) => {
    return {
        type: 'PARENTSELECTEDATA',
        payload: val
    }
}
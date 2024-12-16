import { Box, CircularProgress } from '@mui/material';
import AddButton from 'component/AddButton/AddButton';
import { useApi } from 'network/api';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { modelData, totalRowsCount } from 'store/action';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import CommonTable from 'component/CommonTable/CommonTable';
function CraeteAdmin() {
    const { getApi } = useApi();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const [branchData, setBranchData] = useState([]);
    const selected = useSelector((state) => state.selected);
    const [isFetch, setIsFetch] = useState(false);
    const postUrl = "/api/admin/signUp"
    const putUrl = "/api/admin/editUserList"
    const deleteUrl = "/api/admin/deleteUserList"
    const model = {
        btnTitle: "Add Admin",
        page: "Admin",
        fieldData: [
            {
                name: "Name",
                type: "text",
            },
            {
                name: "Email",
                type: "email",
            },
            {
                name: "Password",
                type: "text",
            },
            {
                name: "Phone Number",
                type: "number",
            },
            {
                name: "Role",
                type: "text",
            },
            {
                name: "Branch",
                type: "selectBox",
                options: branchData
            }
        ]
    }


    const fetchData = async () => {
        setIsLoading(false);
        try {
            const url = `${process.env.REACT_APP_HOST}/api/admin/UserList`
            const response = await getApi(url);
            setData(response?.pageItems);
            const branchUrl = `${process.env.REACT_APP_HOST}/api/admin/branchList`
            const branchResponse = await getApi(branchUrl);
            const branchData = branchResponse?.pageItems.map(branch => ({
                label: branch.branchName,
                value: branch.branchName,
                ...branch
            }));
            setBranchData(branchData);
            dispatch(modelData({
                ...model,
                fieldData: model.fieldData.map(field =>
                    field.name === 'Branch' ? {
                        ...field,
                        options: branchData
                    } : field
                )
            }));
            setIsFetch(false);
            dispatch(totalRowsCount(response?.total || 0));
        } catch (error) {
            toast.error(error?.message || "Please Try After Sometime");
            setIsError(true);
            setIsFetch(false);
            setError(error);
        }
    };

    useEffect(() => {
        if (isFetch == true) {
            setIsFetch(false);
            fetchData();
        }
    }, [isFetch, selected.isEdit]);
    useEffect(() => {
        fetchData();
        dispatch(modelData(model));
    }, []);

    return (
        <Box display="flex" flexDirection="column">
            {isLoading == true ?
                <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" w="100%" mt={{ "xl": "40px", "sm": "10px" }}>
                    <CircularProgress />
                </Box>
                :
                <Box display="flex" flexDirection="column">
                    <Box>
                        <AddButton url={postUrl} setIsFetch={setIsFetch} toast={toast} />
                    </Box>
                    <Box mt="25px">
                        <CommonTable
                            data={data}
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            page="CraeteAdmin"
                            tableTitle="Craete Admin Data"
                            url={putUrl}
                            deleteUrl={deleteUrl}
                            setIsFetch={setIsFetch}
                            toast={toast}
                        />
                    </Box>
                </Box>
            }
            <ToastContainer autoClose={1500} />
        </Box >
    )
}

export default CraeteAdmin
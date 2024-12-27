import { Box, CircularProgress } from '@mui/material';
import AddButton from 'component/AddButton/AddButton';
import { useApi } from 'network/api';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { modelData, totalRowsCount } from 'store/action';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import CommonTable from 'component/CommonTable/CommonTable';
function CreateBranch() {
    const { getApi } = useApi();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    const selected = useSelector((state) => state.selected);
    const [isFetch, setIsFetch] = useState(false);
    const postUrl = "/api/admin/branch"
    const putUrl = "/api/admin/editBranch"
    const deleteUrl = "/api/admin/deleteBranch"
    const model = {
        btnTitle: "Add Branch",
        page: "CreateBranch",
        fieldData: [
            {
                name: "Branch Name",
                type: "text",
            },
            {
                name: "Branch Address",
                type: "text",
            },
            {
                name: "Branch Phone Number",
                type: "number",
            },
            {
                name: "Branch GST Number",
                type: "text",
            },
            {
                name: "Branch Email",
                type: "text"
            },
            {
                name: "IGST",
                type: "number",
            },
            {
                name: "CGST",
                type: "number",
            },
            {
                name: "SGST",
                type: "number",
            },
            {
                name: "PAN",
                type: "text",
            },
            {
                name: "Whatsapp KEY",
                type: "text",
            },
        ]
    }

    const fetchData = async () => {
        setIsLoading(false);
        try {
            const url = `/api/admin/branchList`
            const response = await getApi(url);
            setData(response?.pageItems);
            setIsFetch(false);
            dispatch(totalRowsCount(response?.total || 0));
        } catch (error) {
            setIsError(true);
            setIsFetch(false);
            setError(error);
            toast.error(error?.message || "Please Try After Sometime");
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
                            page="CreateBranch"
                            tableTitle="Craete Branch"
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

export default CreateBranch
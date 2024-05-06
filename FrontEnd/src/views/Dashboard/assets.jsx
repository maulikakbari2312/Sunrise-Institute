import { Box, CircularProgress } from '@mui/material';
import AddButton from 'component/AddButton/AddButton';
import CommonTable from 'component/CommonTable/CommonTable';
import { useApi } from 'network/api';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { modelData, setTableinitialState, totalRowsCount } from 'store/action';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
function ItCourses() {
    const { getApi } = useApi();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    const selected = useSelector((state) => state.selected);
    const pagination = useSelector((state) => state.pagination);
    const [isFetch, setIsFetch] = useState(false);
    const postUrl = "/api/company/createCompany"
    const putUrl = "/api/company/editCompany"
    const deleteUrl = "/api/company/deleteCompany"
    const model = {
        btnTitle: "Add Company",
        page: "company",
        fieldData: [
            {
                name: "Name",
                type: "text",
            },
            {
                name: "Address",
                type: "text",
            },
            {
                name: "Mobile",
                type: "number",
            }
        ]
    }

    const fetchData = async () => {
        setIsLoading(false);
        try {
            const url = `${process.env.REACT_APP_HOST}/api/company/findCompany?limit=${pagination?.pageSize}&offset=${pagination?.currentPage - 1}`
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
        dispatch(setTableinitialState());
        dispatch(modelData(model));
    }, []);
    useEffect(() => {
        if (pagination?.currentPage !== 0) {
            fetchData();
        }
    }, [pagination?.currentPage, pagination?.pageSize]);

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
                            page="company"
                            tableTitle="Company Data"
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

export default ItCourses
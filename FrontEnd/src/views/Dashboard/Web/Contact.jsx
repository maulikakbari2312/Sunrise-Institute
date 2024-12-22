import { Box, CircularProgress } from '@mui/material';
import AddButton from 'component/AddButton/AddButton';
import { useApi } from 'network/api';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { modelData, totalRowsCount } from 'store/action';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import CommonTable from 'component/CommonTable/CommonTable';
function Contact() {
    const { getApi } = useApi();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const deleteUrl = "/api/enroll/delete-contact";

    const selected = useSelector((state) => state.selected);
    const [isFetch, setIsFetch] = useState(false);
    const model = {
        btnTitle: "Contact",
        page: "Contact",
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
                name: "Subject",
                type: "text",
            },
            {
                name: "Message",
                type: "text",
            },
        ]
    }


    const fetchData = async () => {
        setIsLoading(false);
        try {
            const url = `/api/enroll/find-contact`
            const response = await getApi(url);
            setData(response?.pageItems);
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
                    <Box mt="25px">
                        <CommonTable
                            data={data}
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            page="Contact"
                            tableTitle="Web Contact"
                            setIsFetch={setIsFetch}
                            toast={toast}
                            deleteUrl={deleteUrl}
                        />
                    </Box>
                </Box>
            }
            <ToastContainer autoClose={1500} />
        </Box >
    )
}

export default Contact
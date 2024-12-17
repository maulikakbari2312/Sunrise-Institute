import { Box, CircularProgress } from '@mui/material';
import AddButton from 'component/AddButton/AddButton';
import { useApi } from 'network/api';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { modelData, totalRowsCount } from 'store/action';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import CommonTable from 'component/CommonTable/CommonTable';
function CreateCourse() {
    const { getApi } = useApi();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    const selected = useSelector((state) => state.selected);
    const [isFetch, setIsFetch] = useState(false);
    const postUrl = "/api/admin/course"
    const putUrl = "/api/admin/editCourse"
    const deleteUrl = "/api/admin/deleteCourse"
    const model = {
        btnTitle: "Add Course",
        page: "CreateCourse",
        fieldData: [
            {
                name: "Course Name",
                type: "text",
            },
            {
                name: "Course Type",
                type: "selectBox",
                options: [{
                    label: "Competitive Exam",
                    value: "CompetitiveExam"
                },
                {
                    label: "Immigration",
                    value: "Immigration"
                },
                {
                    label: "It Courses",
                    value: "ItCourses"
                }]
            },
            {
                name: "Course Duration",
                type: "number",
            },
            {
                name: "Fees",
                type: "number",
            },
            {
                name: "HSN",
                type: "text",
            },
        ]
    }

    const fetchData = async () => {
        setIsLoading(false);
        try {
            const url = `${process.env.REACT_APP_HOST}/api/admin/courseList`
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
                            page="CreateCourse"
                            tableTitle="Craete Course"
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

export default CreateCourse
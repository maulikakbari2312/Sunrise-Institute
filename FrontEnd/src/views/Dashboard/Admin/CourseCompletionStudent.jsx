import { Box, Button, CircularProgress, Grid } from '@mui/material';
import AddButton from 'component/AddButton/AddButton';
import { useApi } from 'network/api';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { modelData, totalRowsCount } from 'store/action';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import CommonTable from 'component/CommonTable/CommonTable';
import { Field, Form, Formik } from 'formik';
import { CustomSelectComponent, InputDateField, InputField, InputRadioGroup } from 'component/InputFiled';
function CourseCompletionStudent() {
    const { getApi, postApi } = useApi();
    const [data, setData] = useState(null);
    const [course, setCourse] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [btnDisable, setBtnDisable] = useState(false);
    const user = useSelector(state => state.user.isAdmin);
    const [isUser, setIsUser] = useState(user);

    useEffect(() => {
        setIsUser(user);
    }, [user]);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const selected = useSelector((state) => state.selected);
    const [isFetch, setIsFetch] = useState(false);
    const putUrl = "/api/enroll/editEnroll"
    const deleteUrl = "/api/enroll/deleteEnroll"
    const model = {
        btnTitle: "CourseCompletionStudent",
        page: "CourseCompletionStudent",
        fieldData: [
            {
                name: "Name",
                type: "text",
            },
            {
                name: "course",
                type: "selectBox",
                modelNone: true,
            },
            {
                name: "Enroll Date",
                type: "text",
                modelNone: true,
                isNotRequired: true,
            },
            {
                name: "Payment Slip Number",
                type: "redioEnroll",
                modelNone: true,
                isNotRequired: true,
            },
            {
                name: "Mobile Number",
                type: "text",
                modelNone: true
            },
            {
                name: "Installment Date",
                type: "text",
            },
            {
                name: "Enquire Branch",
                type: "text",
                modelNone: true
            },
            {
                name: "Enquire Type",
                type: "text",
                modelNone: true
            },
        ]
    }
    const [branchData, setBranchData] = useState([]);

    const fetchData = async () => {
        setBtnDisable(true);
        // setIsLoading(true);
        try {
            const url = `/api/enroll/findCourseCompletionStudent`
            const response = await getApi(url);
            setData(response?.pageItems);
            const branchUrl = `/api/admin/branchList`
            const branchResponse = await getApi(branchUrl);
            const branchData = branchResponse?.pageItems.map(branch => ({
                label: branch.branchName,
                value: branch.branchName,
                ...branch
            }));
            setBranchData(branchData);
            setIsFetch(false);
            setIsLoading(false);
            dispatch(totalRowsCount(response?.total || 0));
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        } catch (error) {
            setIsLoading(false);
            setIsError(true);
            setIsFetch(false);
            setError(error);
            toast.error(error?.message || "Please Try After Sometime");
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        }
    };

    const fetchCourse = async () => {
        try {
            const url = `/api/admin/courseList`
            const response = await getApi(url);
            if (response?.pageItems && Array.isArray(response.pageItems)) {
                const courseTypes = response.pageItems.map(course => course.courseName);
                setCourse(courseTypes);
            }
        } catch (error) {
            toast.error(error?.message || "Please Try After Sometime");
        }
    }

    useEffect(() => {
        if (isFetch == true) {
            setIsFetch(false);
            fetchData();
        }
    }, [isFetch, selected.isEdit]);
    useEffect(() => {
        fetchData();
        dispatch(modelData(model));
        fetchCourse();
    }, []);

    const filterEmptyValues = (obj) => {
        const filteredObj = {};

        for (const key in obj) {
            if (obj[key] !== null && obj[key] !== undefined) {
                if (Array.isArray(obj[key]) && obj[key].length > 0) {
                    filteredObj[key] = obj[key];
                } else if (!Array.isArray(obj[key]) && obj[key] !== '') {
                    filteredObj[key] = obj[key];
                }
            }
        }

        return filteredObj;
    };

    return (
        <Box display="flex" flexDirection="column">
            <Formik
                initialValues={{
                    name: '',
                    course: '',
                    paymentType: '',
                    installmentDate: '',
                    // gstBranch: '',
                    enquireBranch: '',
                    enquireType: '',
                }}

                onSubmit={(values, { setSubmitting }) => {
                    (async () => {
                        setBtnDisable(true);
                        // setIsLoading(true);
                        try {
                            const filteredValues = filterEmptyValues(values);
                            const url = `/api/enroll/findFilterCourseCompletionStudent`
                            const response = await postApi(url, filteredValues);
                            setData(response?.pageItems);
                            setIsFetch(false);
                            setIsLoading(false)
                            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                        } catch (error) {
                            setIsError(true);
                            setIsFetch(false);
                            setError(error);
                            toast.error(error?.message || "Please Try After Sometime");
                            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                        }
                    })()
                }}
            >
                {(values) => (
                    <Form>
                        <Grid container spacing={1}>
                            <Grid item xs={12} lg={3} sm={6} md={4} >
                                <Field
                                    name="name"
                                    render={({ form }) => (
                                        <InputField
                                            name="name"
                                            placeholder="Enter Full Name"
                                            form={form}
                                            type="name"
                                        />
                                    )}
                                />
                                {/* Add other InputFields for additional form fields */}
                            </Grid>
                            <Grid item xs={12} lg={3} sm={6} md={4} >
                                <Field
                                    name='course'
                                    render={({ field, form }) => (
                                        <CustomSelectComponent
                                            name='course'
                                            label='Course'
                                            placeholder={`Enter Course`}
                                            form={form}
                                            field={field}
                                            options={course}
                                        />
                                    )}
                                />
                                {/* Add other InputFields for additional form fields */}
                            </Grid>
                            {isUser === "master" &&
                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                    <Field
                                        name="enquireBranch"
                                        render={({ form }) => (
                                            <Field
                                                name='enquireBranch'
                                                render={({ field, form }) => (
                                                    <CustomSelectComponent
                                                        name='enquireBranch'
                                                        label='Enter Enquire Branch'
                                                        placeholder={`Enter Enquire Branch`}
                                                        form={form}
                                                        field={field}
                                                        options={branchData}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                </Grid>
                            }

                        </Grid>
                        <Grid container justifyContent="flex-end" marginTop={2}>
                            <Button type="submit" disabled={btnDisable} variant="contained" color="primary" sx={{ marginRight: 2 }}>
                                Filter
                            </Button>
                            <Field
                                name="reset"
                                render={({ form }) => (
                                    <Button
                                        type="reset"
                                        variant="contained"
                                        color="secondary"
                                        disabled={selected.isEdit && btnDisable}
                                        onClick={() => { form && form.resetForm(); fetchData(); }}
                                    >
                                        Reset
                                    </Button>
                                )}
                            />
                        </Grid>
                    </Form>
                )}
            </Formik>
            <Box display="flex" flexDirection="column">
                {isLoading == true ?
                    <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" w="100%" mt={{ "xl": "40px", "sm": "10px" }}>
                        <CircularProgress />
                    </Box>
                    :
                    <Box mt="25px">
                        <CommonTable
                            data={data}
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            page="CourseCompletionStudent"
                            tableTitle="Course Completion Student"
                            url={putUrl}
                            deleteUrl={deleteUrl}
                            setIsFetch={setIsFetch}
                            toast={toast}
                        />
                    </Box>
                }
            </Box>
            <ToastContainer autoClose={1500} />
        </Box >
    )
}

export default CourseCompletionStudent
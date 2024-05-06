import { Box, CircularProgress, Grid, Button } from '@mui/material';
import { useApi } from 'network/api';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { modelData } from 'store/action';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import CommonTable from 'component/CommonTable/CommonTable';
import { Field, Form, Formik } from 'formik';
import { CustomMultiSelect, InputField, CustomTextAreaComponents, CustomSelectComponent } from 'component/InputFiled';
function ItCoursesReport() {
    const { getApi, postApi } = useApi();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [btnDisable, setBtnDisable] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.isAdmin);
    const [isUser, setIsUser] = useState(user);

    useEffect(() => {
        setIsUser(user);
    }, [user]);
    const [course, setCourse] = useState([]);
    const [courseData, setCourseData] = useState([]);
    const [count, setCount] = useState(0);
    const selected = useSelector((state) => state.selected);
    const sendEnquire = useSelector((state) => state.sendEnquire);
    const [isFetch, setIsFetch] = useState(false);
    const putUrl = "/api/itCourses/editItCourses"
    const deleteUrl = "/api/itCourses/deleteItCourses"
    const model = {
        btnTitle: "ItCourses Enquire",
        page: "ItCoursesReport",
        fieldData: [
            {
                name: "Name",
                type: "text",
            },
            {
                name: "Enquire For",
                type: "text",
            },
            {
                name: "Enquire Date",
                type: "text",
            },
            {
                name: "Status",
                type: "select",
            },
            {
                name: "Remark",
                type: "text"
            },
            {
                name: "Email",
                type: "email",
            },
            {
                name: "DOB",
                type: "date",
            },
            {
                name: "Mobile Number",
                type: "number",
            },
            {
                name: "Parent Mobile Number",
                type: "number",
            },
            {
                name: "Address",
                type: "text"
            },
            {
                name: "Suggested Course",
                type: "multiSelect"
            },
            {
                name: "Enquiry Token By",
                type: "text"
            },
            {
                name: "Reference",
                type: "multiSelect"
            },
            {
                name: "Reference Name",
                type: "text"
            },
            {
                name: "Branch",
                type: "text"
            },

        ]
    }

    const fetchCourse = async () => {
        try {
            const url = `${process.env.REACT_APP_HOST}/api/admin/findcourse/ItCourses`
            const response = await getApi(url);
            setCourseData(response?.pageItems);
            if (response?.pageItems && Array.isArray(response.pageItems)) {
                const courseTypes = response.pageItems.map(course => course.courseName);
                setCourse(courseTypes);
            }
        } catch (error) {
            toast.error(error?.message || "Please Try After Sometime");

        }
    }
    const fetchData = async () => {
        // // setIsLoading(true);
        try {
            const url = `${process.env.REACT_APP_HOST}/api/itCourses/findItCourses`
            const response = await getApi(url);
            setData(response?.pageItems);
            setIsFetch(false);
            setIsLoading(false);
        } catch (error) {
            setIsError(true);
            setIsFetch(false);
            setError(error);
            setIsLoading(false);
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
        if (Object.keys(sendEnquire?.sendEnquire || {}).length === 0 || count == 0) {
            fetchData();
            dispatch(modelData(model));
            fetchCourse();
            if (count == 0) {
                setCount(1);
            }
        }

    }, [sendEnquire]);

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

    const handleInput = (e, form, name) => {
        form.setFieldValue(name, e.target.value);
    };


    return (
        <Box display="flex" flexDirection="column" className="report">

            <Box display="flex" flexDirection="column">
                <Formik
                    initialValues={{
                        enquireFor: [],
                        name: '',
                        dob: '',
                        mobileNumber: '',
                        parentMobileNumber: '',
                        email: '',
                        address: '',
                        education: '',
                        reference: [],
                        suggestedCourse: '',
                        enquiryTokenBy: '',
                        referenceName: '',
                        branch: '',
                        // Add other form fields here
                    }}

                    onSubmit={(values, { setSubmitting }) => {
                        (async () => {
                            setBtnDisable(true);
                            // // setIsLoading(true);
                            try {
                                const filteredValues = filterEmptyValues(values);
                                const url = `${process.env.REACT_APP_HOST}/api/itCourses/findFilteritCourses`
                                const response = await postApi(url, filteredValues);
                                setData(response?.pageItems);
                                setIsFetch(false);
                                setIsLoading(false);
                                toast.success(response?.message || "Api Call Successful!");
                                setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                                setSubmitting(false); // Enable buttons after API call completes (success or failure)
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
                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                    <Field
                                        name="enquireFor"
                                        render={({ form }) => (
                                            <CustomMultiSelect
                                                name="enquireFor"
                                                placeholder="Enquire For"
                                                options={course}
                                                value={form.values.enquireFor}
                                                handleInputChange={(e) => {
                                                    handleInput(e, form, "enquireFor");
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
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
                                        name='status'
                                        render={({ field, form }) => (
                                            <CustomSelectComponent
                                                name='status'
                                                label='Status'
                                                placeholder={`Enter Status`}
                                                form={form}
                                                field={field}
                                                options={[{
                                                    label: "Pending",
                                                    value: "pending"
                                                },
                                                {
                                                    label: "Demo",
                                                    value: "demo"
                                                },
                                                {
                                                    label: "Enroll",
                                                    value: "enroll"
                                                },
                                                {
                                                    label: "Reject",
                                                    value: "reject"
                                                },
                                                ]}
                                            />
                                        )}
                                    />
                                    {/* Add other InputFields for additional form fields */}
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="mobileNumber"
                                        render={({ form }) => (
                                            <InputField
                                                name="mobileNumber"
                                                placeholder="Enter Mobile Number"
                                                form={form}
                                                type="number"
                                            />
                                        )}
                                    />
                                    {/* Add other InputFields for additional form fields */}
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="email"
                                        render={({ form }) => (
                                            <InputField
                                                name="email"
                                                placeholder="Enter Email"
                                                form={form}
                                                type="email"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="address"
                                        render={({ form }) => (
                                            <CustomTextAreaComponents
                                                name="address"
                                                placeholder="Enter Addresss"
                                                form={form}

                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="education"
                                        render={({ form }) => (
                                            <InputField
                                                name="education"
                                                placeholder="Enter S.S.C/H.S.C/Dipoma"
                                                form={form}
                                                type="text"
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                    <Field
                                        name="reference"
                                        render={({ form }) => (
                                            <CustomMultiSelect
                                                name="reference"
                                                placeholder="Reference"
                                                options={[
                                                    'Reference', 'News Paper', 'Social Media', 'School', 'Old Student', 'Other'
                                                ]}
                                                value={form.values.reference}
                                                handleInputChange={(e) => {
                                                    handleInput(e, form, "reference");
                                                }}
                                                form={form}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                    <Field
                                        name="referenceName"
                                        render={({ form }) => (
                                            <InputField
                                                name="referenceName"
                                                placeholder="Reference Name"
                                                form={form}
                                                type="text"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                    <Field
                                        name="enquiryTokenBy"
                                        render={({ form }) => (
                                            <InputField
                                                name="enquiryTokenBy"
                                                placeholder="Enquiry Token By"
                                                form={form}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                    <Field
                                        name="suggestedCourse"
                                        render={({ form }) => (
                                            <CustomMultiSelect
                                                name="suggestedCourse"
                                                placeholder="Enter Suggested Course"
                                                options={course}
                                                value={form.values.suggestedCourse}
                                                handleInputChange={(e) => {
                                                    handleInput(e, form, "suggestedCourse");
                                                }}
                                                form={form}
                                            />
                                        )}
                                    />
                                </Grid>
                                {isUser === "master" &&
                                    <Grid item xs={12} lg={3} sm={6} md={4}>
                                        <Field
                                            name="branch"
                                            render={({ form }) => (
                                                <Field
                                                    name='branch'
                                                    render={({ field, form }) => (
                                                        <CustomSelectComponent
                                                            name='branch'
                                                            label='Enter Enquire Branch'
                                                            placeholder={`Enter Enquire Branch`}
                                                            form={form}
                                                            field={field}
                                                            options={[{
                                                                label: "Abrama, Mota Varachha",
                                                                value: "Abrama, Mota Varachha"
                                                            },
                                                            {
                                                                label: "Sita Nagar",
                                                                value: "Sita Nagar"
                                                            },
                                                            {
                                                                label: "ABC, Mota Varachha",
                                                                value: "ABC, Mota Varachha"
                                                            }]}
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
                                    Submit
                                </Button>
                                <Field
                                    name="reset"
                                    render={({ form }) => (
                                        <Button
                                            type="reset"
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => { form && form.resetForm(); fetchData() }}
                                            disabled={selected.isEdit && btnDisable}
                                        >
                                            Reset
                                        </Button>
                                    )}
                                />
                            </Grid>
                        </Form>
                    )}
                </Formik>
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
                            page="ItCoursesReport"
                            tableTitle="IT Courses Enquire"
                            url={putUrl}
                            deleteUrl={deleteUrl}
                            setIsFetch={setIsFetch}
                            toast={toast}
                            courseData={courseData}
                        />
                    </Box>
                }
            </Box>
            <ToastContainer autoClose={1500} />
        </Box >
    )
}

export default ItCoursesReport
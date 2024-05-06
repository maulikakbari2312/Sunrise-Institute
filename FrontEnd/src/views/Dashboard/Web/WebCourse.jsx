import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { useApi } from 'network/api';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { modelData, modelEdit, selectData, totalRowsCount } from 'store/action';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import CommonTable from 'component/CommonTable/CommonTable';
import AddIcon from '@mui/icons-material/Add';
import { CustomTextAreaComponents, InputField, InputFieldValue, CustomTextAreaComponentsvalue, InputImage } from 'component/InputFiled';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
function WebCourse() {
    const { getApi, postApi, putApi } = useApi();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const [addGallery, setAddGallery] = useState(null);
    const [isImage, setIsImage] = useState(null);
    const [btnDisable, setBtnDisable] = useState(false);
    const [isTitle, setIsTitle] = useState([]);
    const [isDetails, setIsDetails] = useState(false);
    const [isModules, setIsModules] = useState(1);
    const dispatch = useDispatch();

    const selected = useSelector((state) => state.selected);
    const [isFetch, setIsFetch] = useState(false);
    const putUrl = "/api/enroll/edit-web-course"
    const deleteUrl = "/api/enroll/delete-web-course"
    const model = {
        btnTitle: "Add WebCourse",
        page: "WebCourse",
        fieldData: [
            {
                name: "Title",
                type: "text",
            },
            {
                name: "Gallery",
                type: "file",
            },
            {
                name: "Duration",
                type: "text",
            },
            {
                name: "Course Description",
                type: "number",
            },
            {
                name: "Daily Hours",
                type: "number",
            },
        ]
    }


    const fetchData = async () => {
        setIsLoading(false);
        try {
            const url = `${process.env.REACT_APP_HOST}/api/enroll/find-web-course`
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

    const initialValues = {
        gallery: selected?.isEdit ? selected?.selectData?.user?.gallery : '',
        dailyHours: selected?.isEdit ? selected?.selectData?.user?.dailyHours : '',
        courseDescription: selected?.isEdit ? selected?.selectData?.user?.courseDescription : '',
        duration: selected?.isEdit ? selected?.selectData?.user?.duration : '',
        title: selected?.isEdit ? selected?.selectData?.user?.title : '',
    }
    useEffect(() => {
        if (selected.isEdit == true) {
            setIsModules(Object.keys(selected?.selectData?.user?.modules).length);
        }
        const modulesTitle = [];
        const modulesDetails = [];
        for (const title in selected?.selectData?.user?.modules) {
            if (selected?.selectData?.user?.modules.hasOwnProperty(title)) {
                // Joining the array elements with commas
                modulesTitle.push(title);
                modulesDetails.push(selected?.selectData?.user?.modules[title].join(", "));
            }
        }
        initialValues.modulesTitle = modulesTitle;
        initialValues.modulesDetails = modulesDetails;
        setIsDetails([...modulesDetails]);
        setIsTitle([...modulesTitle]);
    }, [selected.isEdit]);

    const validationSchema = Yup.object().shape({
        gallery: Yup.mixed().required('Image is required'),
        dailyHours: Yup.number().required('Daily Hours is required'),
        courseDescription: Yup.string().required('Course Description is required'),
        duration: Yup.number().required('Duration is required'),
        title: Yup.string().required('Title is required'),
    });
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setBtnDisable(true);

        // Transforming modulesTitle and modulesDetails into modules object
        const modules = {};
        for (let i = 0; i < isTitle.length; i++) {
            // Splitting the string by comma and trimming each resulting substring
            const detailsArray = isDetails[i].split(",").map(str => str.trim());
            modules[isTitle[i]] = detailsArray;
        }

        // Modifying values to include the transformed modules object
        const modifiedValues = {
            ...values,
            modules
        };

        delete modifiedValues.modulesTitle;
        delete modifiedValues.modulesDetails;
        try {
            if (selected?.isEdit) {
                const url = `${process.env.REACT_APP_HOST}/api/enroll/edit-web-course/${selected?.selectData?.user?.tokenId}`
                const response = await putApi(url, modifiedValues);
                setIsFetch(false);
                setIsLoading(false)
                toast.success(response?.message || "New Data ADD successful!");
                setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                setSubmitting(false);
                setAddGallery(false);
                fetchData();
                setIsModules(1);
                dispatch(modelEdit(false));
                dispatch(selectData({}));
                setIsDetails([]);
                setIsTitle([]);
            } else {
                const url = `${process.env.REACT_APP_HOST}/api/enroll/create-web-course`
                const response = await postApi(url, modifiedValues);
                setIsFetch(false);
                setIsLoading(false)
                toast.success(response?.message || "New Data ADD successful!");
                setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                setSubmitting(false);
                setAddGallery(false);
                fetchData();
                setIsModules(1);
                dispatch(modelEdit(false));
                setIsDetails([]);
                setIsTitle([]);
                dispatch(selectData({}));
            }
        } catch (error) {
            setIsError(true);
            setIsFetch(false);
            setError(error);
            toast.error(error?.message || "Please Try After Sometime");
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
            setAddGallery(false);
        }
    }

    const handleImageChange = (setFieldValue, file) => {
        if (file) {
            setIsImage(file)
            const reader = new FileReader();

            reader.onload = (event) => {
                const imageUrl = event.target.result;
                setFieldValue("gallery", imageUrl); // Update Formik field value with the image URL
            };
            reader.readAsDataURL(file);
        } else {
            setFieldValue("gallery", ""); // Clear Formik field value if no file
        }
    };

    const handleModulesDelete = (values, index, form) => {
        if (isModules > 1) {
            setIsModules(isModules - 1);
            values?.modulesDetails?.splice(index, 1);
            values?.modulesTitle?.splice(index, 1);
            isDetails.splice(index, 1);
            isTitle.splice(index, 1);
            setIsTitle([...isTitle]);
            setIsDetails([...isDetails]);
        }
    }
    const handleInputDetails = (e, form) => {
        const { name, value } = e.target;
        form.setFieldValue(name, value);
        const afterDot = name.split('.')[1];
        isDetails[Number(afterDot)] = value;
        setIsDetails([...isDetails]); // Update state with spread operator to trigger re-render
    }
    const handleInputTitle = (e, form) => {
        const { name, value } = e.target;
        form.setFieldValue(name, value);
        const afterDot = name.split('.')[1];
        isTitle[Number(afterDot)] = value;
        setIsTitle([...isTitle]); // Update state with spread operator to trigger re-render
    }


    console.log('isTitle', isTitle)

    // Extract the portion after the dot
    return (
        <Box display="flex" flexDirection="column">
            {isLoading == true ?
                <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" w="100%" mt={{ "xl": "40px", "sm": "10px" }}>
                    <CircularProgress />
                </Box>
                :
                <Box display="flex" flexDirection="column">
                    {
                        !addGallery ?
                            <Box>
                                <Button
                                    startIcon={<AddIcon fontSize="16px" />}
                                    variant="contained"
                                    alignItems="center"
                                    onClick={() => {
                                        setAddGallery(true);
                                        setIsDetails([]);
                                        setIsTitle([]);
                                        setIsModules(1);
                                    }}
                                >
                                    <Typography pt="2px" >
                                        Add Web Course
                                    </Typography>
                                </Button>
                            </Box>
                            :
                            <Box w={100}>
                                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize={true}>
                                    {(values) => (
                                        <Form>
                                            <Grid container spacing={1} pt={3}>
                                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                                    <Field
                                                        name="title"
                                                        render={({ form }) => (
                                                            <InputField
                                                                name="title"
                                                                placeholder="Enter Title"
                                                                form={form}
                                                                type="text"
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                                    <Field
                                                        name="duration"
                                                        render={({ form }) => (
                                                            <InputField
                                                                name="duration"
                                                                placeholder="Enter Duration"
                                                                form={form}
                                                                type="number"
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                                    <Field
                                                        name="courseDescription"
                                                        render={({ form }) => (
                                                            <CustomTextAreaComponents
                                                                name="courseDescription"
                                                                placeholder="Enter Course Description"
                                                                form={form}
                                                                type="text"
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                                    <Field
                                                        name="dailyHours"
                                                        render={({ form }) => (
                                                            <InputField
                                                                name="dailyHours"
                                                                placeholder="Enter Daily Hours"
                                                                form={form}
                                                                type="number"
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                                    <label
                                                        className="picture"
                                                        htmlFor="picture__input"
                                                        tabIndex="0"
                                                    >
                                                        <span className="picture__image">
                                                            {values?.values?.gallery ? (
                                                                <img
                                                                    src={values?.values?.gallery}
                                                                    alt="Uploaded"
                                                                    className="picture__img"
                                                                />
                                                            ) :
                                                                (<Box
                                                                    display="flex"
                                                                    flexDirection="column"
                                                                    justifyContent="center"
                                                                    alignItems="center"
                                                                >
                                                                    <CloudUploadIcon />
                                                                    <Typography>Upload Image</Typography>
                                                                </Box>
                                                                )}
                                                        </span>
                                                    </label>
                                                    <Field
                                                        name="gallery"
                                                        render={({ field, form }) => (
                                                            <InputImage name="gallery" label="Gallery" placeholder="gallery" form={form} field={field} type="text" disabled={true} setIsImage={setIsImage}
                                                                handleImageChange={(file) =>
                                                                    handleImageChange(form.setFieldValue, file)
                                                                }
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} lg={6} sm={12} md={8}>
                                                    <Typography pt="2px" >
                                                        Course Modules
                                                    </Typography>
                                                    {
                                                        Array.from({ length: isModules }, (_, index) => index).map(index => (
                                                            <Grid container spacing={1} pt={1} key={index}>
                                                                <Grid item xs={6} lg={6} sm={6} md={6}>
                                                                    <Field
                                                                        name={`modulesTitle.${index}`} // Use unique names for each field
                                                                        render={({ form }) => (
                                                                            <InputFieldValue
                                                                                name={`modulesTitle.${index}`} // Use unique names for each field
                                                                                placeholder="Enter Modules Title"
                                                                                form={form}
                                                                                type="text"
                                                                                value={isTitle[index]}
                                                                                isManual={true}
                                                                                handleInputChange={handleInputTitle}
                                                                            />
                                                                        )}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={6} lg={6} sm={6} md={6}>
                                                                    <Box display='flex' gap={2} >
                                                                        <Field
                                                                            name={`modulesDetails.${index}`} // Use unique names for each field
                                                                            render={({ form }) => (
                                                                                <CustomTextAreaComponentsvalue
                                                                                    name={`modulesDetails.${index}`} // Use unique names for each field
                                                                                    placeholder="Enter modules Details"
                                                                                    form={form}
                                                                                    type="text"
                                                                                    value={isDetails[index]}
                                                                                    isManual={true}
                                                                                    handleInputChange={handleInputDetails}
                                                                                />
                                                                            )}
                                                                        />
                                                                        {
                                                                            (isModules != index + 1) ?
                                                                                <Field
                                                                                    name={'deleteBtn'} // Use unique names for each field
                                                                                    render={({ form }) => (
                                                                                        <DeleteIcon
                                                                                            onClick={() => {
                                                                                                handleModulesDelete(values?.values, index, form)
                                                                                            }} />
                                                                                    )}
                                                                                />
                                                                                : <Box sx={{ width: '25px' }}></Box>
                                                                        }
                                                                    </Box>
                                                                </Grid>
                                                            </Grid>
                                                        ))
                                                    }
                                                </Grid>
                                                <Grid item xs={12} lg={3} sm={6} md={4} mt={4}>
                                                    <Button variant="contained" color="primary" sx={{ marginRight: 2 }} onClick={() => {
                                                        setIsModules(isModules + 1);
                                                    }}>
                                                        Add Modules
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={1} pt={1} justifyContent={'end'}>

                                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                                    <Grid container justifyContent="flex-start" marginTop={2} marginLeft={2}>
                                                        <Button type="submit" disabled={btnDisable} variant="contained" color="primary" sx={{ marginRight: 2 }}>
                                                            {selected.isEdit ? 'Edit' : 'Submit'}
                                                        </Button>
                                                        <Field
                                                            name="reset"
                                                            render={({ form }) => (
                                                                <Button
                                                                    type="reset"
                                                                    variant="contained"
                                                                    color="secondary"
                                                                    disabled={selected.isEdit && btnDisable}
                                                                    onClick={() => {
                                                                        form && form.resetForm();
                                                                        setIsImage('');
                                                                        setAddGallery(false);
                                                                        dispatch(modelEdit(false));
                                                                        setIsDetails([]);
                                                                        setIsTitle([]);
                                                                        dispatch(selectData({}));
                                                                    }}
                                                                >
                                                                    Close
                                                                </Button>
                                                            )}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Form>
                                    )}
                                </Formik>
                            </Box>
                    }
                    <Box mt="25px">
                        <CommonTable
                            data={data}
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            page="Gallery"
                            tableTitle="Web Course"
                            url={putUrl}
                            deleteUrl={deleteUrl}
                            setIsFetch={setIsFetch}
                            toast={toast}
                            setAddGallery={setAddGallery}
                        />
                    </Box>
                </Box>
            }
            <ToastContainer autoClose={1500} />
        </Box >
    )
}

export default WebCourse
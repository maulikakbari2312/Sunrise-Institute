import { Box, Button, CircularProgress, DialogContent, Grid, Typography } from '@mui/material';
import AddButton from 'component/AddButton/AddButton';
import { useApi } from 'network/api';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { modelData, totalRowsCount } from 'store/action';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import CommonTable from 'component/CommonTable/CommonTable';
import AddIcon from '@mui/icons-material/Add';
import { InputImage } from 'component/InputFiled';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function Gallery() {
    const { getApi, postApi, putApi } = useApi();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const [addGallery, setAddGallery] = useState(null);
    const [isImage, setIsImage] = useState(null);
    const [btnDisable, setBtnDisable] = useState(false);
    const dispatch = useDispatch();

    const selected = useSelector((state) => state.selected);
    const [isFetch, setIsFetch] = useState(false);

    // Fetch data from API
    const putUrl = "/api/enroll/edit-gallery";
    const deleteUrl = "/api/enroll/delete-gallery";
    const model = {
        btnTitle: "Add Gallery",
        page: "Gallery",
        fieldData: [
            {
                name: "Gallery",
                type: "file",
            },
        ]
    }


    const fetchData = async () => {
        setBtnDisable(true);
        try {
            const url = `${process.env.REACT_APP_HOST}/api/enroll/find-gallery`
            const response = await getApi(url);
            setData(response?.pageItems);
            setIsFetch(false);
            dispatch(totalRowsCount(response?.total || 0));
            setBtnDisable(false);
        } catch (error) {
            toast.error(error?.message || "Please Try After Sometime");
            setIsError(true);
            setIsFetch(false);
            setError(error);
            setBtnDisable(false);
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
        gallery: selected?.isEdit ? selected.selectData?.user?.gallery : ''
    }

    const validationSchema = Yup.object().shape({
        gallery: Yup.mixed().required('Image is required'),
    });
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setBtnDisable(true);
        try {
            if (selected?.isEdit) {
                const url = `${process.env.REACT_APP_HOST}/api/enroll/edit-gallery/${selected?.selectData?.user?.tokenId}`
                const response = await putApi(url, values);
                fetchData();
                setIsFetch(false);
                toast.success(response?.message || "New Data ADD successful!");
                setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                setSubmitting(false);
                setAddGallery(false);

            } else {
                const url = `${process.env.REACT_APP_HOST}/api/enroll/create-gallery`
                const response = await postApi(url, values);
                fetchData();
                setIsFetch(false);
                toast.success(response?.message || "New Data ADD successful!");
                setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                setSubmitting(false);
                setAddGallery(false);
            }
        } catch (error) {
            setIsError(true);
            setIsFetch(false);
            setError(error);
            toast.error(error?.message || "Please Try After Sometime");
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)

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
    return (
        <Box display="flex" flexDirection="column">
            {isLoading == true ?
                <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" w="100%" mt={{ "xl": "40px", "sm": "10px" }}>
                    <CircularProgress />
                </Box>
                :
                <Box display="flex" flexDirection="column">

                    <Box w={100}>
                        {
                            !addGallery ?
                                <Box>
                                    <Button
                                        startIcon={<AddIcon fontSize="16px" />}
                                        variant="contained"
                                        alignItems="center"
                                        onClick={() => {
                                            setAddGallery(true);
                                        }}
                                    >
                                        <Typography pt="2px" >
                                            Add Gallery
                                        </Typography>
                                    </Button>
                                </Box>
                                :
                                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize={true}>
                                    {(values) => (
                                        <Form>
                                            <Grid container spacing={1} pt={3}>
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
                                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                                    <Grid container justifyContent="flex-start" marginTop={2} marginLeft={2}>
                                                        <Button type="submit" disabled={btnDisable} variant="contained" color="primary" sx={{ marginRight: 2 }}>
                                                            {selected?.isEdit ? 'Edit' : 'Submit'}
                                                        </Button>
                                                        <Field
                                                            name="reset"
                                                            render={({ form }) => (
                                                                <Button
                                                                    type="reset"
                                                                    variant="contained"
                                                                    color="secondary"
                                                                    disabled={selected.isEdit && btnDisable}
                                                                    onClick={() => { form && form.resetForm(); setIsImage(''); setAddGallery(false) }}
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
                        }
                    </Box>
                    <Box mt="25px">
                        <CommonTable
                            data={data}
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            page="Gallery"
                            tableTitle="Web Gallery"
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

export default Gallery
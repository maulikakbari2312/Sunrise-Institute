import { Box, CircularProgress, Grid, Button } from '@mui/material';
import { useApi } from 'network/api';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { modelData } from 'store/action';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import CommonTable from 'component/CommonTable/CommonTable';
import { Field, Form, Formik } from 'formik';
import { CustomMultiSelect, InputField, CustomTextAreaComponents, CustomSelectComponent, InputDateField, InputCheckBox } from 'component/InputFiled';
import ReportCard from '../ReportCard';
import { useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { gridSpacing } from 'config';

function PaymentReport() {
    const theme = useTheme();
    const { postApi } = useApi();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.isAdmin);
    const [isUser, setIsUser] = useState(user);
    const [btnDisable, setBtnDisable] = useState(false);
    useEffect(() => {
        setIsUser(user);
    }, [user]);
    const selected = useSelector((state) => state.selected);
    const [isFetch, setIsFetch] = useState(false);
    const putUrl = "/api/competitiveExam/editCompetitiveExam/"
    const deleteUrl = "/api/competitiveExam/deleteCompetitiveExam"
    const model = {
        btnTitle: "Competitive Exam Enquire",
        page: "PaymentReport",
        fieldData: [
            {
                name: "Payment Slip Number",
                type: "text",
                isNotRequired: true,
                modelNone: true,
            },
            {
                name: "Name",
                type: "text",
            },
            {
                name: "Enquire Type",
                type: "text",
            },
            {
                name: "Course",
                type: "text",
            },
            {
                name: "Enquire Branch",
                type: "text",
            },
            {
                name: "Payment Receiver",
                type: "text",
                isNotRequired: true,
                modelNone: true,
            },
            {
                name: "Payment Details",
                type: "text",
                isNotRequired: true,
                modelNone: true,
            },
            {
                name: "Student Gst",
                type: "text",
                isNotRequired: true,
                modelNone: true,
                // displayNone: true,
            },
            {
                name: "Installment Date",
                type: "text",
            },
            {
                name: "Pay Amount",
                type: "text",
            },
        ]
    }

    const fetchData = async () => {
        // setIsLoading(true);
        try {
            const url = `${process.env.REACT_APP_HOST}/api/enroll/findFilterEnrollPayment`
            const response = await postApi(url, {});
            setData(response?.pageItems);
            setIsFetch(false);
            setIsLoading(false);
        } catch (error) {
            setIsError(true);
            setIsFetch(false);
            setIsLoading(false);
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
            <Box display="flex" flexDirection="column">
                <Formik
                    initialValues={{
                        startDate: '',
                        endDate: '',
                        // gstBranch: '',
                        enquireBranch: '',
                        payAmount: false,
                        paymentMethod: ''
                    }}

                    onSubmit={(values, { setSubmitting }) => {
                        (async () => {
                            // setIsLoading(true);
                            setBtnDisable(true);
                            try {
                                const filteredValues = filterEmptyValues(values);
                                const url = `${process.env.REACT_APP_HOST}/api/enroll/findFilterEnrollPayment`
                                const response = await postApi(url, filteredValues);
                                setData(response?.pageItems);
                                setIsFetch(false);
                                setIsLoading(false)
                                toast.success(response?.message || "New Data ADD successful!");
                                setSubmitting(false);
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
                                        name="startDate"
                                        render={({ form }) => (
                                            <InputDateField
                                                name="startDate"
                                                placeholder="Enter Start Date"
                                                form={form}
                                                type="date"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="endDate"
                                        render={({ form }) => (
                                            <InputDateField
                                                name="endDate"
                                                placeholder="Enter End Date"
                                                form={form}
                                                type="date"
                                            />
                                        )}
                                    />
                                </Grid>

                                {isUser === "master" &&
                                    <Grid item xs={12} lg={3} sm={6} md={4} >
                                        <Field
                                            name='enquireBranch'
                                            render={({ field, form }) => (
                                                <CustomSelectComponent
                                                    name='enquireBranch'
                                                    label='Enquire Branch'
                                                    placeholder={`Enter Enquire Branch`}
                                                    form={form}
                                                    field={field}
                                                    options={[
                                                        {
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
                                                        }
                                                    ]}
                                                />
                                            )}
                                        />
                                        {/* Add other InputFields for additional form fields */}
                                    </Grid>
                                }
                                {/* {isUser === "master" &&
                                    <Grid item xs={12} lg={3} sm={6} md={4} >
                                        <Field
                                            name='gstBranch'
                                            render={({ field, form }) => (
                                                <CustomSelectComponent
                                                    name='gstBranch'
                                                    label='GST Branch'
                                                    placeholder={`Enter GST Branch`}
                                                    form={form}
                                                    field={field}
                                                    options={[
                                                        {
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
                                                        }
                                                    ]}
                                                />
                                            )}
                                        />
                                    </Grid>
                                } */}
                                <Grid item xs={12} lg={3} sm={6} md={4} style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingLeft: '22px',
                                }}>
                                    <Field
                                        name="payAmount"
                                        render={({ form }) => (
                                            <InputCheckBox
                                                name="payAmount"
                                                placeholder="Enter Pay Amount"
                                                form={form}
                                                values={form?.values}
                                                type="date"
                                            />
                                        )}
                                    />
                                </Grid>
                                {
                                    values?.values?.payAmount == true &&
                                    <Grid item xs={12} lg={3} sm={6} md={4} >
                                        <Field
                                            name='paymentMethod'
                                            render={({ field, form }) => (
                                                <CustomSelectComponent
                                                    name='paymentMethod'
                                                    label='Select Payment Method'
                                                    placeholder={`Enter Payment Method`}
                                                    form={form}
                                                    field={field}
                                                    options={[{
                                                        label: "Cash",
                                                        value: "Cash"
                                                    },
                                                    {
                                                        label: "UPI",
                                                        value: "UPI"
                                                    },
                                                    {
                                                        label: "Bank Transfer",
                                                        value: "Bank Transfer"
                                                    },
                                                    {
                                                        label: "Settlement",
                                                        value: "Settlement"
                                                    },
                                                    ]}
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
                {isLoading == true ?
                    <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" w="100%" mt={{ "xl": "40px", "sm": "10px" }}>
                        <CircularProgress />
                    </Box>
                    :
                    <Box mt="25px">
                        {
                            data && <Grid item xs={12} mb="20px">
                                <Grid container spacing={gridSpacing}>
                                    <Grid item lg={3} sm={6} xs={12}>
                                        <ReportCard
                                            primary={data?.totalPayAmount?.toFixed(2)?.toString()}
                                            color={theme.palette.enroll.main}
                                            footerData="Total Payment Amount"
                                            iconPrimary={ThumbUpIcon}
                                            iconFooter={TrendingUpIcon}
                                        />
                                    </Grid>
                                    <Grid item lg={3} sm={6} xs={12}>
                                        <ReportCard
                                            primary={(data?.totalPayAmount - (data?.totalPayAmount * 18) / 100)?.toFixed(2)?.toString()}
                                            color={theme.palette.primary.main}
                                            footerData="Total Excluded GST Amount"
                                            iconPrimary={ThumbUpIcon}
                                            iconFooter={TrendingUpIcon}
                                        />
                                    </Grid>
                                    <Grid item lg={3} sm={6} xs={12}>
                                        <ReportCard
                                            primary={(data?.cGst)?.toFixed(2)?.toString()}
                                            color={theme.palette.secondary.main}
                                            footerData="Total CGST Amount"
                                            iconPrimary={ThumbUpIcon}
                                            iconFooter={TrendingUpIcon}
                                        />
                                    </Grid>
                                    <Grid item lg={3} sm={6} xs={12}>
                                        <ReportCard
                                            primary={(data?.sGst)?.toFixed(2)?.toString()}
                                            color={theme.palette.secondary.main}
                                            footerData="Total SGST Amount"
                                            iconPrimary={ThumbUpIcon}
                                            iconFooter={TrendingUpIcon}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        }
                        <CommonTable
                            data={data?.pageItems}
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            page="PaymentReport"
                            tableTitle="Payment Report"
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

export default PaymentReport
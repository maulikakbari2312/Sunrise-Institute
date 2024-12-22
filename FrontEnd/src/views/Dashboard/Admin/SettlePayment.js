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

function SettlePayment() {
    const theme = useTheme();
    const { postApi, getApi } = useApi();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [btnDisable, setBtnDisable] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.isAdmin);
    const [isUser, setIsUser] = useState(user);

    useEffect(() => {
        setIsUser(user);
    }, [user]);
    const selected = useSelector((state) => state.selected);
    const [isFetch, setIsFetch] = useState(false);
    const putUrl = "/api/competitiveExam/editCompetitiveExam/"
    const deleteUrl = "/api/competitiveExam/deleteCompetitiveExam"
    const model = {
        btnTitle: "Competitive Exam Enquire",
        page: "SettlePayment",
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
                name: "Mobile Number",
                type: "text",
            },
            {
                name: "Enroll Date",
                type: "text",
            },
            {
                name: "Settlement Date",
                type: "text",
            },
            {
                name: "Course",
                type: "text",
            },
            {
                name: "Total Fees",
                type: "text",
            },
            {
                name: "Discount",
                type: "text",
            },
            {
                name: "Pay Fees",
                type: "text",
            },
            {
                name: "Pending Fees",
                type: "text",
            },
            {
                name: "Refund Amount",
                type: "text",
            },
            {
                name: "Pay Installment Date",
                type: "text",
            },
            {
                name: "Payment Receiver",
                type: "text",
            },
            {
                name: "Payment Method",
                type: "text",
            },
            {
                name: "Payment Details",
                type: "text",
            },

        ]
    }
    const [branchData, setBranchData] = useState([]);
    const fetchData = async () => {
        // setIsLoading(true);
        try {
            const url = `/api/enroll/find-settle-enroll`
            const response = await postApi(url, {});
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
                        paymentMethod: ''
                    }}

                    onSubmit={(values, { setSubmitting }) => {
                        (async () => {
                            setBtnDisable(true);
                            // setIsLoading(true);
                            try {
                                const filteredValues = filterEmptyValues(values);
                                const url = `/api/enroll/find-settle-enroll`
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
                                                    options={branchData}
                                                />
                                            )}
                                        />
                                        {/* Add other InputFields for additional form fields */}
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
                                            footerData="Total Refund Amount"
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
                            page="SettlePayment"
                            tableTitle="Settle Payment"
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

export default SettlePayment
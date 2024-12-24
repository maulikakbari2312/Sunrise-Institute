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
import { useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { gridSpacing } from 'config';

function PaymentSlipBook() {
    const cm = localStorage.getItem('cm');
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
    const isAdmin = useSelector((state) => state.user?.isAdmin);

    useEffect(() => {
        setIsUser(user);
    }, [user]);
    const selected = useSelector((state) => state.selected);
    const [isFetch, setIsFetch] = useState(false);
    const putUrl = ""
    const deleteUrl = ""
    const model = {
        btnTitle: "Payment Slip Report",
        page: "PaymentSlipBook",
        fieldData: [
            {
                name: "Payment Slip Number",
                type: "text",
            },
            {
                name: "Name",
                type: "text",
            },
            {
                name: "Course",
                type: "text",
            },
            {
                name: "Pay Fees Date",
                type: "text",
            },
            {
                name: "Pay Installment",
                type: "text",
            },
            {
                name: "Pay Installment Fees",
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
            {
                name: "Payment Receiver",
                type: "text",
            },
            {
                name: "Pay Installment Date",
                type: "text",
            },
            {
                name: "Pay Installment Numbers",
                type: "text",
            },
            {
                name: "Installment Amount",
                type: "text",
            },
            {
                name: "Enquire Branch",
                type: "text",
            },
        ]
    }
    const [branchData, setBranchData] = useState([]);
    const isBranch = useSelector((state) => state.user?.userBranch);
    const fetchData = async () => {
        // setIsLoading(true);
        try {
            const url = `/api/enroll/find-payment-slip`
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
                        paymentMethod: '',
                        paymentSlipNumber: ''
                    }}

                    onSubmit={(values, { setSubmitting }) => {
                        (async () => {
                            // setIsLoading(true);
                            setBtnDisable(true);
                            try {
                                const filteredValues = filterEmptyValues(values);
                                const url = `/api/enroll/find-payment-slip`
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
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name='paymentSlipNumber'>
                                        {({ field, form }) => (
                                            <InputField
                                                name='paymentSlipNumber'
                                                label='Enter Payment Slip Number'
                                                placeholder={`Enter Payment Slip Number`}
                                                form={form}
                                                field={field}
                                                type='number'
                                                isManual={false}
                                            />
                                        )}
                                    </Field>
                                </Grid>
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
                {
                    isAdmin &&
                    <Box display="flex" flexDirection="column">
                        <Formik
                            initialValues={{
                                startDate: '',
                                endDate: '',
                                paymentType: '',
                                enquireBranch: ''
                            }}
                            onSubmit={async (values, { setSubmitting, resetForm }) => {
                                setBtnDisable(true);
                                try {
                                    let urls = `/api/enroll/download-slip-data/${isAdmin}/${isBranch}`;
                                    if (cm == "true" || cm === true) {
                                        urls = `${process.env.REACT_APP_HOST}${urls}`;
                                    } else {
                                        urls = `${process.env.REACT_APP_HOST_SECOND}${urls}`;
                                    }
                                    const response = await fetch(urls, {
                                        method: 'POST',
                                        body: JSON.stringify(values),
                                        headers: {
                                            'Content-type': 'application/json',
                                            'authorization': localStorage.getItem('token')
                                        }
                                    });

                                    if (!response.ok) {
                                        throw new Error('Failed to download file');
                                    }

                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `slip-${values.startDate || new Date().toISOString().slice(0, 10)} to ${values?.endDate || new Date().toISOString().slice(0, 10)}.xlsx`;
                                    document.body.appendChild(a);
                                    a.click();
                                    // Cleanup
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                    setBtnDisable(false); // Re-enable the button regardless of success or failure
                                    resetForm();
                                } catch (error) {
                                    toast.error(error?.message || "Please Try After Sometime");
                                    setBtnDisable(false); // Re-enable the button regardless of success or failure
                                    console.error(error);
                                    // Handle error: You might want to show a notification to the user
                                }
                            }}

                        >
                            {(values) => (
                                <Form>
                                    {(isUser === "master" || isUser == 'true' || isUser == true) &&
                                        <Grid container spacing={1} mt={3}>
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
                                                {/* Add other InputFields for additional form fields */}
                                            </Grid>
                                            <Grid item xs={12} lg={3} sm={6} md={4} >
                                                <Field
                                                    name='endDate'
                                                    render={({ field, form }) => (
                                                        <InputDateField
                                                            name="endDate"
                                                            placeholder="Enter End Date"
                                                            form={form}
                                                            type="date"
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                            <Grid item xs={12} lg={3} sm={6} md={4} >
                                                <Field
                                                    name="paymentType"
                                                    render={({ field, form }) => (
                                                        <CustomSelectComponent
                                                            name="paymentType"
                                                            label="Select Slip Type"
                                                            placeholder={`Enter Slip Type`}
                                                            form={form}
                                                            field={field}
                                                            options={[
                                                                {
                                                                    label: 'CN',
                                                                    value: 'Settlement'
                                                                },
                                                                {
                                                                    label: 'Other',
                                                                    value: 'other'
                                                                },
                                                            ]}
                                                        />
                                                    )}
                                                />
                                            </Grid>
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
                                            <Grid item xs={12} lg={3} sm={6} md={4} >
                                                <Grid container justifyContent="flex-start" marginTop={2} marginLeft={2}>
                                                    <Button type="submit" disabled={btnDisable} variant="contained" color="primary" sx={{ marginRight: 2 }}>
                                                        Download
                                                    </Button>
                                                    <Field
                                                        name="reset"
                                                        render={({ form }) => (
                                                            <Button
                                                                type="reset"
                                                                variant="contained"
                                                                color="secondary"
                                                                disabled={selected.isEdit && btnDisable}
                                                                onClick={() => { form && form.resetForm(); }}
                                                            >
                                                                Reset
                                                            </Button>
                                                        )}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    }
                                </Form>
                            )}
                        </Formik>
                    </Box>
                }
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
                            page="PaymentSlipBook"
                            tableTitle="Payment Slip Report"
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

export default PaymentSlipBook
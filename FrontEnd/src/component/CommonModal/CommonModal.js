import React, { useState, useEffect } from 'react'
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { modelDelete, modelEdit } from 'store/action';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { InputField, CustomSelectComponent, InputRadioGroup, InputDateField } from 'component/InputFiled';
import { toast } from "react-toastify";
import { useApi } from 'network/api';
import Logo from "../../assets/images/logoSunrise.png"
import SunLogo from "../../assets/images/SunLogo.png"
import DigitalImage from '../../assets/images/copy.jpg';
import html2pdf from "html2pdf.js";
function CommonModal({ isDialogOpen, setIsDialogOpen, url, setIsFetch }) {
    const { postApi, putApi, getApi } = useApi();
    const [userData, setUserData] = useState(null); // Local state to store user data
    const [btnDisable, setBtnDisable] = useState(false);
    const [isPaymentDetails, setIsPaymentDetails] = useState(false);
    const modelData = useSelector((state) => state?.selected?.modelData);
    const selected = useSelector((state) => state?.selected);
    const dispatch = useDispatch();
    const [isCounterNumber, setIsCounterNumber] = useState({});
    const isBranch = useSelector((state) => state.user?.userBranch);
    const name = localStorage.getItem('name');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [branchData, setBranchData] = useState([]);
    const [isMatchBranch, setIsMatchBranch] = useState({});
    const conterNumber = async () => {
        try {
            const response = await getApi(`${process.env.REACT_APP_HOST}/api/enroll/find-book-numbers`);
            const branchUrl = `${process.env.REACT_APP_HOST}/api/admin/branchList`
            const branchResponse = await getApi(branchUrl);
            const branchData = branchResponse?.pageItems.map(branch => ({
                label: branch.branchName,
                value: branch.branchName,
                ...branch
            }));
            setBranchData(branchData);
            const matchedBranch = branchData.find(branch => branch.branchName === isBranch);
            setIsMatchBranch(matchedBranch);
            setIsCounterNumber(response?.pageItems);
        } catch (error) {
            toast.error(error?.message || "Please Try After Sometime");
        }
    }
    function formatDateSplit(inputDate) {

        var dateComponents = inputDate?.split('-');
        var year = dateComponents[0];
        var month = dateComponents[1];
        var day = dateComponents[2];


        var formattedDate = `${day}/${month}/${year}`;

        return formattedDate;
    }
    useEffect(() => {
        if (selected?.modelData?.page === 'pendingInstallments') {
            try {
                let url = ''
                if (selected?.selectData?.user?.enquireType == "Immigration") {
                    url = `${process.env.REACT_APP_HOST}/api/admin/findcourse/Immigration`
                } else if (selected?.selectData?.user?.enquireType == "CompetitiveExam") {
                    url = `${process.env.REACT_APP_HOST}/api/admin/findcourse/CompetitiveExam`
                } else if (selected?.selectData?.user?.enquireType == "ItCourses") {
                    url = `${process.env.REACT_APP_HOST}/api/admin/findcourse/ItCourses`
                } else {
                    url = `${process.env.REACT_APP_HOST}/api/admin/findcourse/Immigration`
                }
                (async () => {
                    try {
                        const response = await getApi(url);
                        if (response?.pageItems && Array.isArray(response.pageItems)) {
                            setSelectedCourse(() => {
                                return response.pageItems?.filter((item) => item?.courseName === selected?.selectData?.user?.course);
                            });
                        }
                    } catch (error) {
                        toast.error(error?.message || "Please Try After Sometime");
                    }
                })()
            } catch {

            }
        }
    }, [selected, isDialogOpen]);
    useEffect(() => {
        conterNumber();
    }, []);
    useEffect(() => {
        setUserData(modelData);
        setIsPaymentDetails(null);
    }, [modelData]);

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        dispatch(modelEdit(false));
        dispatch(modelDelete(false));
    };

    if (!Array.isArray(userData?.fieldData) || userData?.fieldData.length === 0) {
        return null; // If userData?.fieldData is not an array or is empty, don't render anything
    }
    // Dynamically create validation schema based on userData?.fieldData
    const validationSchema = Yup.object().shape(
        userData?.fieldData.reduce((acc, field) => {
            if (!field?.isNotRequired) {
                if (field?.name === "Password" && field?.name !== "Email") {
                    acc[field.name.split(' ').map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)).join('')] = Yup.string()
                        .matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]{8,}$/, 'Password must contain at least one uppercase letter, one number, and one special character')
                        .required(`${field.name} is required`);
                } else if (field?.name === "Email") {
                    acc[field.name.split(' ').map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)).join('')] = Yup.string()

                        .required('An email address is required');
                } else {
                    acc[field.name.split(' ').map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)).join('')] = Yup.string().required(`${field.name} is required`);
                }
            }
            return acc;
        }, {})
    );

    // Create initialValues object based on userData?.fieldData
    const initialValues = userData?.fieldData.reduce((acc, field) => {
        if (field?.name) {
            acc[field.name.split(' ').map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)).join('')] = selected.isEdit ? selected?.selectData?.[field.name.split(' ')?.map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)).join('').replace(/(\([^)]*\))/g, '')] || '' : '';
        }
        return acc;
    }, {});
    if (selected?.modelData?.page === "pendingInstallments" && selected.isEdit) {
        initialValues.duePartialPayment = selected.selectData?.user?.partialPayment?.toFixed(2);
        initialValues.payInstallmentFees = ((selected.selectData?.user?.duePendingInstallment * selected.selectData?.user?.installmentAmount) + selected.selectData?.user?.partialPayment)?.toFixed(2);
        initialValues.partialPayment = 0;
    }
    if (selected?.modelData?.page === "pendingInstallments") {
        initialValues.paymentReceiver = localStorage.getItem('name');
    }
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setBtnDisable(true);
        // Handle form submission logic here
        let body = { ...values }
        if (selected?.modelData?.page === 'pendingInstallments') {
            const date = new Date();
            const formattedDate = date.toISOString().slice(0, 10);
            body = {
                ...values,
                installmentDate: formattedDate,
                dob: selected?.selectData?.user?.dob,
                email: selected?.selectData?.user?.email,
                mobileNumber: selected?.selectData?.user?.mobileNumber,
                enquireDate: selected?.selectData?.user?.enquireDate,
                payFeesDate: new Date().toISOString().slice(0, 10)
            };
        }
        try {
            const apiUrl = `${process.env.REACT_APP_HOST}${url}`;
            let headers = {};
            // Make the callback function inside .then() async
            headers = {
                'Content-type': 'application/json',
                'authorization': localStorage.getItem('token')
            }
            if (url === '/api/enroll/pay-installments' && selected?.modelData?.page === 'pendingInstallments') {
                const invoice = document.getElementById('invoice_digital');
                const fileName = `${values?.name}-${isCounterNumber?.paymentNumber}.pdf`;
                var opt = {
                    margin: 0,
                    filename: fileName,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2
                    },
                    jsPDF: {
                        unit: 'in',
                        format: 'a4',
                        orientation: 'portrait'
                    }
                };

                const pdfExporter = html2pdf().from(invoice).set(opt);
                const pdf = await pdfExporter.toPdf().get('pdf');
                const blob = new Blob([pdf.output('blob')], { type: 'application/pdf' });

                // Convert blob to base64
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    const base64data = reader.result;
                    // console.log('base64data', base64data);
                    body.file = base64data;
                    body.fileName = fileName;
                    if (!selected.isEdit) {
                        postApi(apiUrl, (selected?.modelData?.page == 'pendingInstallments' ? { ...body, enrollDate: new Date() } : values), headers)
                            .then(async (response) => {
                                // You can access the response data using apiOtpResponse in your component
                                toast.success(response?.message || "New Data ADD successful!");
                                dispatch(modelEdit(false));
                                dispatch(modelDelete(false));
                                handleDialogClose();
                                setIsFetch(true);
                                setSubmitting(false);
                                resetForm();
                                setIsPaymentDetails(null);
                                conterNumber();
                                setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                            })
                            .catch((error) => {
                                toast.error(error?.message || "Please Try After Sometime");
                                setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                            });
                    } else {
                        putApi(`${apiUrl}/${selected.selectData.user.tokenId}`, body, headers)
                            .then(async (response) => {
                                // You can access the response data using apiOtpResponse in your component
                                toast.success(response?.message || "Data Update successful!");
                                dispatch(modelEdit(false));
                                dispatch(modelDelete(false));
                                handleDialogClose();
                                setIsFetch(true);
                                setSubmitting(false);
                                resetForm();
                                setIsPaymentDetails(null);
                                conterNumber();
                                setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                            })
                            .catch((error) => {
                                toast.error(error?.message || "Please Try After Sometime");
                                setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                            });
                    }
                }
            } else {
                if (!selected.isEdit) {
                    postApi(apiUrl, (selected?.modelData?.page === 'pendingInstallments' ? { ...body, enrollDate: new Date() } : values), headers)
                        .then(async (response) => {
                            // You can access the response data using apiOtpResponse in your component
                            toast.success(response?.message || "New Data ADD successful!");
                            dispatch(modelEdit(false));
                            dispatch(modelDelete(false));
                            handleDialogClose();
                            setIsFetch(true);
                            setSubmitting(false);
                            resetForm();
                            setIsPaymentDetails(null);
                            conterNumber();
                            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                        })
                        .catch((error) => {
                            toast.error(error?.message || "Please Try After Sometime");
                            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                        });
                } else {
                    putApi(`${apiUrl}/${selected.selectData.user.tokenId}`, body, headers)
                        .then(async (response) => {
                            // You can access the response data using apiOtpResponse in your component
                            toast.success(response?.message || "Data Update successful!");
                            dispatch(modelEdit(false));
                            dispatch(modelDelete(false));
                            handleDialogClose();
                            setIsFetch(true);
                            setSubmitting(false);
                            resetForm();
                            setIsPaymentDetails(null);
                            conterNumber();
                            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                        })
                        .catch((error) => {
                            toast.error(error?.message || "Please Try After Sometime");
                            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                        });
                }
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again later.");
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        }
    };
    const getFieldName = (name) =>
        name
            ?.split(' ')
            .map((word, index) =>
                index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join('');

    const handleInputChange = (e, form) => {
        const { name, value } = e.target;
        form.setFieldValue(name, value);
        setIsPaymentDetails(value);
    }
    const handlePrint = (data) => {
        // Check if payment method is UPI or Bank Transfer
        if (data?.paymentMethod === 'UPI' || data?.paymentMethod === 'Bank Transfer') {
            // Check if payment details are provided
            if (data?.paymentDetails !== '') {
                // Validate data
                validationSchema.validate(data, { abortEarly: false })
                    .then(() => {
                        // Generate PDF
                        generatePDF(data);
                    })
                    .catch(() => {
                        // Handle validation errors
                        toast?.error('Please check required fields');
                    });
            } else {
                // Handle missing payment details
                toast?.error('Payment method is invalid or payment details are missing.');
            }
        } else {
            // Validate data
            validationSchema.validate(data, { abortEarly: false })
                .then(() => {
                    // Generate PDF
                    generatePDF(data);
                })
                .catch(() => {
                    // Handle validation errors
                    toast?.error('Please check required fields');
                });
        }
    }

    const generatePDF = (data) => {
        const invoice = document.getElementById("invoice");
        const fileName = `${data?.name}-${isCounterNumber?.paymentNumber}.pdf`;
        var opt = {
            margin: 0,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2
            },
            jsPDF: {
                unit: 'in',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        const pdfExporter = html2pdf().from(invoice).set(opt);

        pdfExporter.toPdf().get('pdf').then(function (pdf) {
            pdf.save(fileName);
            // Create a Blob from the PDF data
            const blob = new Blob([pdf.output('blob')], { type: 'application/pdf' });
            // Create a URL for the Blob
            const url = URL.createObjectURL(blob);
            // Open the PDF in a new tab
            const newTab = window.open(url, '_blank');
            // Wait for the PDF to be fully loaded before printing
            newTab.onload = function () {
                setTimeout(function () {
                    newTab.print();
                }, 1000); // Adjust the timeout if needed
            };
        });
    };



    return (
        <Dialog
            open={isDialogOpen}
            onClose={handleDialogClose}
        >
            <DialogTitle>{userData?.btnTitle}</DialogTitle>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {(values) => (
                    <Form>
                        <DialogContent sx={{
                            width: "500px",
                            margin: 'auto', // Center the dialog horizontally
                            '@media (max-width: 600px)': {
                                width: '80vw',
                            },
                        }}>
                            <Box display="flex" flexWrap="unWrap" flexDirection="column" gap="10px">
                                {modelData?.fieldData.map((fieldData, index) => (
                                    // Check if modelNone is not true
                                    !fieldData?.modelNone && (
                                        <>
                                            {
                                                fieldData.type === "selectBox" ? (
                                                    <Box
                                                        key={index}
                                                        mr={{
                                                            "2xl": "5px",
                                                            xl: "5px",
                                                            lg: "4.5px",
                                                            md: "4px",
                                                            sm: "0px",
                                                        }}
                                                        w={{
                                                            "2xl": "100%",
                                                            xl: "100%",
                                                            lg: "100%",
                                                            md: "100%",
                                                            sm: "100%",
                                                        }}
                                                    >
                                                        <Field
                                                            name={getFieldName(fieldData.name)}>
                                                            {({ field, form }) => (
                                                                <CustomSelectComponent
                                                                    name={getFieldName(fieldData.name)}
                                                                    label={fieldData.name}
                                                                    placeholder={`Enter ${fieldData.name}`}
                                                                    form={form}
                                                                    field={field}
                                                                    type={fieldData.type}
                                                                    disabled={fieldData.disabled || false}
                                                                    options={fieldData.options}
                                                                />
                                                            )}
                                                        </Field>
                                                    </Box>
                                                )
                                                    : fieldData.type === "redioEnroll" ? (
                                                        <Box
                                                            key={index}
                                                            mr={{
                                                                "2xl": "5px",
                                                                xl: "5px",
                                                                lg: "4.5px",
                                                                md: "4px",
                                                                sm: "0px",
                                                            }}
                                                            w={{
                                                                "2xl": "100%",
                                                                xl: "100%",
                                                                lg: "100%",
                                                                md: "100%",
                                                                sm: "100%",
                                                            }}
                                                        >
                                                            <Field
                                                                name="paymentType">
                                                                {({ form }) => (
                                                                    <InputRadioGroup
                                                                        name="paymentType"
                                                                        form={form}
                                                                        label="payment Type"
                                                                        options={[
                                                                            { value: 'fullFees', label: 'Full Fees' },
                                                                            { value: 'installment', label: 'installment' },
                                                                        ]}
                                                                    />
                                                                )}
                                                            </Field>
                                                        </Box>
                                                    )
                                                        : fieldData.type === "date" ? (
                                                            <Box
                                                                key={index}
                                                                mr={{
                                                                    "2xl": "5px",
                                                                    xl: "5px",
                                                                    lg: "4.5px",
                                                                    md: "4px",
                                                                    sm: "0px",
                                                                }}
                                                                w={{
                                                                    "2xl": "100%",
                                                                    xl: "100%",
                                                                    lg: "100%",
                                                                    md: "100%",
                                                                    sm: "100%",
                                                                }}
                                                            >
                                                                <Field
                                                                    name={getFieldName(fieldData.name)}>
                                                                    {({ form }) => (
                                                                        <InputDateField
                                                                            name={getFieldName(fieldData.name)}
                                                                            placeholder={`Enter ${fieldData.name}`}
                                                                            form={form}
                                                                            type="date"
                                                                        />
                                                                    )}
                                                                </Field>
                                                            </Box>
                                                        )
                                                            :
                                                            fieldData.type === "paymentSelectBox" ? (
                                                                <>
                                                                    <Box
                                                                        key={index}
                                                                        mr={{
                                                                            "2xl": "5px",
                                                                            xl: "5px",
                                                                            lg: "4.5px",
                                                                            md: "4px",
                                                                            sm: "0px",
                                                                        }}
                                                                        w={{
                                                                            "2xl": "100%",
                                                                            xl: "100%",
                                                                            lg: "100%",
                                                                            md: "100%",
                                                                            sm: "100%",
                                                                        }}
                                                                    >
                                                                        <Field
                                                                            name={getFieldName(fieldData.name)}>
                                                                            {({ field, form }) => (
                                                                                <CustomSelectComponent
                                                                                    name={getFieldName(fieldData.name)}
                                                                                    label={fieldData.name}
                                                                                    placeholder={`Enter ${fieldData.name}`}
                                                                                    form={form}
                                                                                    field={field}
                                                                                    type={fieldData.type}
                                                                                    disabled={fieldData.disabled || false}
                                                                                    options={fieldData.options}
                                                                                    handleInputChange={(e) => { handleInputChange(e, form) }}

                                                                                    isManual={true}
                                                                                />
                                                                            )}
                                                                        </Field>
                                                                    </Box>
                                                                    {
                                                                        (isPaymentDetails == 'UPI' || isPaymentDetails == 'Bank Transfer') &&
                                                                        <Box
                                                                            key={index}
                                                                            mr={{
                                                                                "2xl": "5px",
                                                                                xl: "5px",
                                                                                lg: "4.5px",
                                                                                md: "4px",
                                                                                sm: "0px",
                                                                            }}
                                                                            w={{
                                                                                "2xl": "100%",
                                                                                xl: "100%",
                                                                                lg: "100%",
                                                                                md: "100%",
                                                                                sm: "100%",
                                                                            }}
                                                                        >
                                                                            <Field
                                                                                name="paymentDetails"
                                                                                render={({ field, form }) => (
                                                                                    <InputField
                                                                                        name="paymentDetails"
                                                                                        label="Payment Details"
                                                                                        placeholder={`Enter ${isPaymentDetails == 'UPI' ? 'Transactions ID' : 'Check Number'}`}
                                                                                        form={form}
                                                                                        field={field}
                                                                                    />
                                                                                )}
                                                                            />
                                                                        </Box>
                                                                    }
                                                                </>
                                                            )
                                                                :
                                                                <Box
                                                                    key={index}
                                                                    mr={{
                                                                        "2xl": "5px",
                                                                        xl: "5px",
                                                                        lg: "4.5px",
                                                                        md: "4px",
                                                                        sm: "0px",
                                                                    }}
                                                                    w={{
                                                                        "2xl": "100%",
                                                                        xl: "100%",
                                                                        lg: "100%",
                                                                        md: "100%",
                                                                        sm: "100%",
                                                                    }}
                                                                >
                                                                    <Field
                                                                        name={getFieldName(fieldData.name)}>
                                                                        {({ field, form }) => (
                                                                            <InputField
                                                                                name={getFieldName(fieldData.name)}
                                                                                label={fieldData.name}
                                                                                placeholder={`Enter ${fieldData.name}`}
                                                                                form={form}
                                                                                field={field}
                                                                                type={fieldData.type}
                                                                                disabled={fieldData.disabled || false}
                                                                                isManual={fieldData.isManual || false}
                                                                                handleInputChange={fieldData.handleInputChange}
                                                                            />
                                                                        )}
                                                                    </Field>
                                                                </Box>
                                            }
                                        </>)
                                ))}
                            </Box >
                        </DialogContent>
                        <div className="col-md-12" style={{ display: 'none' }} >
                            <div id="invoice">
                                <div className="container" >
                                    <div className="row">
                                        <div className="receipt-header">
                                            <div style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginButtom: '10px', height: '80px', alignItems: 'center', display: 'flex' }}>
                                                <div style={{
                                                    width: '120px',
                                                    height: '100%'
                                                }}>
                                                    <img
                                                        style={{ width: '100%', height: '100%' }}
                                                        src={Logo}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                                            <div className='sun-text'>
                                                                <img
                                                                    style={{ width: '100%', height: '100%' }}
                                                                    src={SunLogo}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="nav-details">
                                                            <div className="nav-detail">
                                                                <div className="nav-title" style={{ width: '100px' }}>Receipt No :</div>
                                                                <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>{isCounterNumber?.paymentNumber}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                                        <div className="nav-detail">
                                                            <div className="nav-title">Mobile No:</div>
                                                            <div className="nav-data">{isMatchBranch?.branchPhoneNumber}</div>
                                                        </div>
                                                        <div className="nav-detail">
                                                            <div className="nav-title" style={{ width: '61px' }}>Email Id:</div>
                                                            <div className="nav-data" style={{ fontSize: '.75rem' }}>sunriseinstitute.tech@gmail.com</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='divider-form'></div>
                                    <div style={{ marginBottom: '5px' }}>
                                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>
                                            Fee Receipt
                                        </h2>
                                    </div>
                                    <div className="row">
                                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                                            <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                                                <div className="receipt-right" style={{ width: '100%' }}>
                                                    <p style={{ display: 'flex', alignItems: 'center', height: '15px', margin: '1px 0', fontWeight: '500', fontSize: '16px' }}><h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4><div className="border-line-fileds"> {values?.values?.name}</div></p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '40px', marginTop: '6px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}><h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4><div className="border-line-fileds mr-6p">{selectedCourse?.[0]?.courseName}</div></p>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}><h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4><div className="border-line-fileds">{selectedCourse?.[0]?.courseDuration} Months</div></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                                            <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                                                <div className="receipt-right" style={{ width: '100%' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '16px', marginTop: '6px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}><h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4><div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div></p>
                                                        {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}><h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>{values?.values?.paymentMethod === 'UPI' ? 'Transactions ID :' : values?.values?.paymentMethod === 'Bank Transfer' ? 'Check No :' : 'Cash'} </h4><div className="border-line-fileds">{values?.values?.paymentDetails}</div></p>}
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '40px', marginTop: '6px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}><h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4><div className="border-line-fileds mr-6p">{name}</div></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <table className="table table-bordered w-100">
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                                <tr>
                                                    <td className="text-right">
                                                        <p>
                                                            <strong>Total Amount Due: </strong>
                                                        </p>
                                                        <p>
                                                            <strong>Paid Amount: </strong>
                                                        </p>
                                                        <p>
                                                            <strong>Balance Due: </strong>
                                                        </p>
                                                    </td>
                                                    <td>
                                                        <p>
                                                            <strong><i className="fa fa-inr"></i>{(!isNaN(parseFloat(selected?.selectData?.user?.pendingFees)) ? parseFloat(selected?.selectData?.user?.pendingFees) : 0)?.toFixed(2)}/-</strong>
                                                        </p>
                                                        <p>
                                                            <strong><i className="fa fa-inr"></i> {(!isNaN(parseFloat(values?.values?.payInstallmentFees)) ? parseFloat(values?.values?.payInstallmentFees) : 0)?.toFixed(2)}/-</strong>
                                                        </p>
                                                        <p>
                                                            <strong><i className="fa fa-inr"></i> {((!isNaN(parseFloat(selected?.selectData?.user?.pendingFees)) ? parseFloat(selected?.selectData?.user?.pendingFees) : 0) - (!isNaN(parseFloat(values?.values?.payInstallmentFees)) ? parseFloat(values?.values?.payInstallmentFees) : 0))?.toFixed(2)}/-</strong>
                                                        </p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="row">
                                        <div className="receipt-header receipt-header-mid receipt-footer" style={{ margin: '2px 0px 24px' }}>
                                            <div className="col-xs-8 col-sm-8 col-md-8 text-left">
                                                <div className="receipt-right">
                                                    <p style={{ margin: '0' }}><b>Date :</b> {new Date().toLocaleDateString('en-GB')}</p>
                                                </div>
                                            </div>
                                            <div className="col-xs-4 col-sm-4 col-md-4">
                                                <div className="receipt-left">
                                                    <h2 style={{ margin: '0' }}>Signature</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='footer-divider-form'></div>
                                        <div className='branch-address'>
                                            {isMatchBranch?.branchPhoneNumber}
                                        </div>
                                    </div>
                                </div>
                                <div className="container" >
                                    <div className="row">
                                        <div className="receipt-header">
                                            <div style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginButtom: '10px', height: '80px', alignItems: 'center', display: 'flex' }}>
                                                <div style={{
                                                    width: '120px',
                                                    height: '100%'
                                                }}>
                                                    <img
                                                        style={{ width: '100%', height: '100%' }}
                                                        src={Logo}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                                            <div className='sun-text'>
                                                                <img
                                                                    style={{ width: '100%', height: '100%' }}
                                                                    src={SunLogo}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="nav-details">
                                                            <div className="nav-detail">
                                                                <div className="nav-title" style={{ width: '100px' }}>Receipt No :</div>
                                                                <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>{isCounterNumber?.paymentNumber}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                                        <div className="nav-detail">
                                                            <div className="nav-title">Mobile No:</div>
                                                            <div className="nav-data">{isMatchBranch?.branchPhoneNumber}</div>
                                                        </div>
                                                        <div className="nav-detail">
                                                            <div className="nav-title" style={{ width: '61px' }}>Email Id:</div>
                                                            <div className="nav-data" style={{ fontSize: '.75rem' }}>sunriseinstitute.tech@gmail.com</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='divider-form'></div>
                                    <div style={{ marginBottom: '5px' }}>
                                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>
                                            Fee Receipt
                                        </h2>
                                    </div>
                                    <div className="row">
                                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                                            <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                                                <div className="receipt-right" style={{ width: '100%' }}>
                                                    <p style={{ display: 'flex', alignItems: 'center', height: '15px', margin: '1px 0', fontWeight: '500', fontSize: '16px' }}><h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4><div className="border-line-fileds"> {values?.values?.name}</div></p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '40px', marginTop: '6px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}><h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4><div className="border-line-fileds mr-6p">{selectedCourse?.[0]?.courseName}</div></p>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}><h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4><div className="border-line-fileds">{selectedCourse?.[0]?.courseDuration} Months</div></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                                            <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                                                <div className="receipt-right" style={{ width: '100%' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '16px', marginTop: '6px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}><h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4><div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div></p>
                                                        {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}><h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>{values?.values?.paymentMethod === 'UPI' ? 'Transactions ID :' : values?.values?.paymentMethod === 'Bank Transfer' ? 'Check No :' : 'Cash'} </h4><div className="border-line-fileds">{values?.values?.paymentDetails}</div></p>}
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '40px', marginTop: '6px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}><h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4><div className="border-line-fileds mr-6p">{name}</div></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <table className="table table-bordered w-100">
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                                <tr>
                                                    <td className="text-right">
                                                        <p>
                                                            <strong>Total Amount Due: </strong>
                                                        </p>
                                                        <p>
                                                            <strong>Paid Amount: </strong>
                                                        </p>
                                                        <p>
                                                            <strong>Balance Due: </strong>
                                                        </p>
                                                    </td>
                                                    <td>
                                                        <p>
                                                            <strong><i className="fa fa-inr"></i>{(!isNaN(parseFloat(selected?.selectData?.user?.pendingFees)) ? parseFloat(selected?.selectData?.user?.pendingFees) : 0)?.toFixed(2)}/-</strong>
                                                        </p>
                                                        <p>
                                                            <strong><i className="fa fa-inr"></i> {(!isNaN(parseFloat(values?.values?.payInstallmentFees)) ? parseFloat(values?.values?.payInstallmentFees) : 0)?.toFixed(2)}/-</strong>
                                                        </p>
                                                        <p>
                                                            <strong><i className="fa fa-inr"></i> {((!isNaN(parseFloat(selected?.selectData?.user?.pendingFees)) ? parseFloat(selected?.selectData?.user?.pendingFees) : 0) - (!isNaN(parseFloat(values?.values?.payInstallmentFees)) ? parseFloat(values?.values?.payInstallmentFees) : 0))?.toFixed(2)}/-</strong>
                                                        </p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="row">
                                        <div className="receipt-header receipt-header-mid receipt-footer" style={{ margin: '2px 0px 24px' }}>
                                            <div className="col-xs-8 col-sm-8 col-md-8 text-left">
                                                <div className="receipt-right">
                                                    <p style={{ margin: '0' }}><b>Date :</b> {new Date().toLocaleDateString('en-GB')}</p>
                                                </div>
                                            </div>
                                            <div className="col-xs-4 col-sm-4 col-md-4">
                                                <div className="receipt-left">
                                                    <h2 style={{ margin: '0' }}>Signature</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='footer-divider-form'></div>
                                        <div className='branch-address'>
                                            {isMatchBranch?.branchAddress}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="invoice_digital" style={{ position: 'relative', height: '100%', width: '100%' }}>
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '409px',
                                        height: '402px',
                                        backgroundImage: `url(${DigitalImage})`,
                                        backgroundSize: 'cover',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center',
                                        opacity: 0.1,
                                    }}
                                />
                                <div className="container" >
                                    <div className="row">
                                        <div className="receipt-header">
                                            <div style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginButtom: '10px', height: '80px', alignItems: 'center', display: 'flex' }}>
                                                <div style={{
                                                    width: '120px',
                                                    height: '100%'
                                                }}>
                                                    <img
                                                        style={{ width: '100%', height: '100%' }}
                                                        src={Logo}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                                            <div className='sun-text'>
                                                                <img
                                                                    style={{ width: '100%', height: '100%' }}
                                                                    src={SunLogo}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="nav-details">
                                                            <div className="nav-detail">
                                                                <div className="nav-title" style={{ width: '100px' }}>Receipt No :</div>
                                                                <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>{isCounterNumber?.paymentNumber}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                                        <div className="nav-detail">
                                                            <div className="nav-title">Mobile No:</div>
                                                            <div className="nav-data">{
                                                                isMatchBranch?.branchPhoneNumber
                                                            }</div>
                                                        </div>
                                                        <div className="nav-detail">
                                                            <div className="nav-title" style={{ width: '61px' }}>Email Id:</div>
                                                            <div className="nav-data" style={{ fontSize: '.75rem' }}>sunriseinstitute.tech@gmail.com</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='divider-form'></div>
                                    <div style={{ marginBottom: '5px' }}>
                                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>
                                            Fee Receipt
                                        </h2>
                                    </div>
                                    <div className="row">
                                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                                            <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                                                <div className="receipt-right" style={{ width: '100%' }}>
                                                    <p style={{ display: 'flex', alignItems: 'center', height: '15px', margin: '1px 0', fontWeight: '500', fontSize: '16px' }}><h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4><div className="border-line-fileds"> {values?.values?.name}</div></p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '40px', marginTop: '6px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}><h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4><div className="border-line-fileds mr-6p">{selectedCourse?.[0]?.courseName}</div></p>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}><h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4><div className="border-line-fileds">{selectedCourse?.[0]?.courseDuration} Months</div></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                                            <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                                                <div className="receipt-right" style={{ width: '100%' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '16px', marginTop: '6px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}><h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4><div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div></p>
                                                        {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}><h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>{values?.values?.paymentMethod === 'UPI' ? 'Transactions ID :' : values?.values?.paymentMethod === 'Bank Transfer' ? 'Check No :' : 'Cash'} </h4><div className="border-line-fileds">{values?.values?.paymentDetails}</div></p>}
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '40px', marginTop: '6px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}><h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4><div className="border-line-fileds mr-6p">{name}</div></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <table className="table table-bordered w-100">
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                                <tr>
                                                    <td className="text-right">
                                                        <p>
                                                            <strong>Total Amount Due: </strong>
                                                        </p>
                                                        <p>
                                                            <strong>Paid Amount: </strong>
                                                        </p>
                                                        <p>
                                                            <strong>Balance Due: </strong>
                                                        </p>
                                                    </td>
                                                    <td>
                                                        <p>
                                                            <strong><i className="fa fa-inr"></i>{(!isNaN(parseFloat(selected?.selectData?.user?.pendingFees)) ? parseFloat(selected?.selectData?.user?.pendingFees) : 0)?.toFixed(2)}/-</strong>
                                                        </p>
                                                        <p>
                                                            <strong><i className="fa fa-inr"></i> {(!isNaN(parseFloat(values?.values?.payInstallmentFees)) ? parseFloat(values?.values?.payInstallmentFees) : 0)?.toFixed(2)}/-</strong>
                                                        </p>
                                                        <p>
                                                            <strong><i className="fa fa-inr"></i> {((!isNaN(parseFloat(selected?.selectData?.user?.pendingFees)) ? parseFloat(selected?.selectData?.user?.pendingFees) : 0) - (!isNaN(parseFloat(values?.values?.payInstallmentFees)) ? parseFloat(values?.values?.payInstallmentFees) : 0))?.toFixed(2)}/-</strong>
                                                        </p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="row">
                                        <div className="receipt-header receipt-header-mid receipt-footer" style={{ margin: '2px 0px 10px', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <div className="col-xs-8 col-sm-8 col-md-8 text-left">
                                                    <div className="receipt-right">
                                                        <p style={{ margin: '0' }}>
                                                            <b>Date :</b> {new Date().toLocaleDateString('en-GB')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-xs-4 col-sm-4 col-md-4">
                                                    <div className="receipt-left">
                                                        <h2 style={{ margin: '0' }}>Signature</h2>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'end', width: '100%', justifyContent: 'center', fontWeight: '600', marginTop: '6px' }}>
                                                *This is a Computer  Generated Copy.
                                            </div>
                                        </div>
                                        <div className='footer-divider-form'></div>
                                        <div className='branch-address'>
                                            {isMatchBranch?.branchAddress}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogActions>
                            {modelData?.page == "pendingInstallments"
                                &&
                                <Button
                                    disabled={btnDisable}
                                    colorScheme='blue'
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => { handlePrint(values?.values) }}
                                >
                                    print
                                </Button>
                            }
                            {
                                selected.isEdit ?
                                    <Button colorScheme='blue' variant="contained" color="primary" type='submit' disabled={btnDisable} >{modelData?.page == "pendingInstallments" ? "Pay" : "Edit"}</Button>
                                    :
                                    <Button colorScheme='blue' variant="contained" color="primary" type='submit' disabled={btnDisable}>{userData?.btnTitle}</Button>
                            }
                            <Button colorScheme='gray' color="secondary" variant="contained" disabled={btnDisable} mr={3} onClick={handleDialogClose}>
                                Close
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog >
    )
}

export default CommonModal
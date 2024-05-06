import React, { useEffect, useState } from 'react';
import ItemPaper from 'component/Item/ItemPaper';
import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { InputField, InputDateField, CustomTextAreaComponents, CustomMultiSelect, CustomSelectComponent } from 'component/InputFiled';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { modelDelete, modelEdit } from 'store/action';
import { ToastContainer, toast } from 'react-toastify';
import { useApi } from 'network/api';
import * as actionTypes from 'store/action/actions';
import { useSocket } from 'layout/SocketContext';
import Logo from "../../../assets/images/logoSunrise.png";
import SunLogo from "../../../assets/images/SunLogo.png";
import html2pdf from "html2pdf.js";
function CompetitiveExam() {
    const [course, setCourse] = useState([]);
    const [branchStaff, setBanchStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [btnDisable, setBtnDisable] = useState(false);
    const selected = useSelector((state) => state.selected);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { postApi, putApi, getApi } = useApi();
    const { socket } = useSocket();
    const [isPrint, setIsPrint] = useState(false);
    function formatDate(inputDate) {
        // Split the input date string by dashes
        var parts = inputDate.split('-');

        // Rearrange the parts to the desired format
        var formattedDate = parts[2] + '/' + parts[1] + '/' + parts[0];

        return formattedDate;
    }
    const fetchData = async () => {
        // setIsLoading(true);
        try {
            const url = `${process.env.REACT_APP_HOST}/api/admin/findcourse/CompetitiveExam`
            const response = await getApi(url);
            if (response?.pageItems && Array.isArray(response.pageItems)) {
                const courseTypes = response.pageItems.map(course => course.courseName);
                setCourse(courseTypes);
            }
            const urlBranchStaff = `${process.env.REACT_APP_HOST}/api/branch/getBranchStaff`
            const responseBranchStaff = await getApi(urlBranchStaff);
            if (responseBranchStaff?.pageItems && Array.isArray(responseBranchStaff.pageItems)) {
                setBanchStaff(responseBranchStaff.pageItems);
            }
            setIsLoading(false);
        } catch (error) {
            // setIsLoading(true);
            toast.error(error?.message || "Please Try After Sometime");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInput = (e, form, name) => {
        form.setFieldValue(name, e.target.value);
    };
    function reverseConvertDateFormat(inputDate) {
        // Split the input date into day, month, and year
        var dateParts = inputDate.split('/');

        // Create a new Date object with the extracted parts
        var convertedDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

        // Extract year, month, and day from the Date object
        var year = convertedDate.getFullYear();
        var month = convertedDate.getMonth() + 1; // Month is zero-based, so we add 1
        var day = convertedDate.getDate();

        // Format the date in YYYY-MM-DD
        var formattedDate = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;

        return formattedDate;
    }
    const validationSchema = Yup.object().shape({
        enquireFor: Yup.array().min(1, 'Please select at least one option').required('Please select at least one option'),
        name: Yup.string().min(2, 'Too Short!').required('Name is required'),
        dob: Yup.string().required('Date of birth is required'),
        mobileNumber: Yup.string()
            .required('Mobile number is required')
            .min(10, 'Mobile number must be 10 digits')
            .max(10, 'Mobile number must be 10 digits'),

        parentMobileNumber: Yup.string()
            .required('Mobile number is required')
            .min(10, 'Mobile number must be 10 digits')
            .max(10, 'Mobile number must be 10 digits'),
        address: Yup.string().required('Address is required'),
        education: Yup.string().required('Education are required'),
        reference: Yup.array().min(1, 'Please select at least one option').required('Please select at least one option'),
        enquiryTokenBy: Yup.string().required('Enquiry Token By are required'),
    });

    const generateUniqueToken = () => {
        const timestamp = new Date().getTime().toString(36); // Convert timestamp to base36 string
        const randomString1 = Math.random().toString(36).substring(2, 8); // Random string of length 6
        const randomString2 = Math.random().toString(36).substring(2, 8); // Another random string of length 6
        const randomString3 = Math.random().toString(36).substring(2, 8); // Another random string of length 6
        return `${timestamp}${randomString1}${randomString2}${randomString3}`;
    };

    // Assuming values, course, and headers are defined elsewhere
    let uniqueToken = generateUniqueToken();
    const [formData, setFormData] = useState({});
    const isBranch = useSelector((state) => state.user?.userBranch);
    function setEnquiryTokenLabel(values) {


        // Filter the array based on the branchStaff variable
        const filteredData = branchStaff.filter(obj => obj.branchStaff === values?.values?.enquiryTokenBy);

        // If there's a matching object, set its label
        if (filteredData.length > 0) {
            return filteredData[0].label;
        } else {
            return ''; // Or any default value you want to set if no match found
        }
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
        const fileName = `${data?.name}.pdf`;
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
            // pdf.save(fileName);
            // Create a Blob from the PDF data
            const blob = new Blob([pdf.output('blob')], { type: 'application/pdf' });
            // Create a URL for the Blob
            const url = URL.createObjectURL(blob);
            // Open the PDF in a new tab
            const newTab = window.open(url, '_blank');
            // Print the PDF after it's loaded
            newTab.onload = function () {
                newTab.print();
            };
        });
    }

    const handleDialogClose = () => {
        setIsPrint(false);
    };
    return (
        <ItemPaper>
            {isLoading == true ?
                <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" w="100%" mt={{ "xl": "40px", "sm": "10px" }}>
                    <CircularProgress />
                </Box>
                :
                <Formik
                    initialValues={{
                        enquireFor: selected.isEdit ? selected?.selectData?.user?.enquireFor || [] : [],
                        name: selected.isEdit ? selected?.selectData?.user?.name || '' : '',
                        dob: selected.isEdit ? reverseConvertDateFormat(selected?.selectData?.user?.dob) || '' : '',
                        mobileNumber: selected.isEdit ? selected?.selectData?.user?.mobileNumber || '' : '',
                        parentMobileNumber: selected.isEdit ? selected?.selectData?.user?.parentMobileNumber || '' : '',
                        email: selected.isEdit ? selected?.selectData?.user?.email || '' : '',
                        address: selected.isEdit ? selected?.selectData?.user?.address || '' : '',
                        education: selected.isEdit ? selected?.selectData?.user?.education || '' : '',
                        bachelor: selected.isEdit ? selected?.selectData?.user?.bachelor || '' : '',
                        master: selected.isEdit ? selected?.selectData?.user?.master || '' : '',
                        educationother: selected.isEdit ? selected?.selectData?.user?.educationother || '' : '',
                        gpsc: selected.isEdit ? selected?.selectData?.user?.gpsc || '' : '',
                        psi: selected.isEdit ? selected?.selectData?.user?.psi || '' : '',
                        class3: selected.isEdit ? selected?.selectData?.user?.class3 || '' : '',
                        other: selected.isEdit ? selected?.selectData?.user?.other || '' : '',
                        reference: selected.isEdit ? selected?.selectData?.user?.reference || [] : [],
                        referenceName: selected.isEdit ? selected?.selectData?.user?.referenceName || '' : '',
                        suggestedCourse: selected.isEdit ? selected?.selectData?.user?.suggestedCourse || '' : '',
                        enquiryTokenBy: selected.isEdit ? selected?.selectData?.user?.enquiryTokenBy || '' : '',
                        remark: selected.isEdit ? selected?.selectData?.user?.remark || '' : '',
                        // Add other form fields here
                    }}
                    validationSchema={validationSchema}

                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        setBtnDisable(true);
                        try {
                            const headers = {
                            }
                            if (selected.isEdit) {
                                const apiUrl = `${process.env.REACT_APP_HOST}/api/competitiveExam/editCompetitiveExam/${selected?.selectData?.user?.tokenId}`;
                                putApi(`${apiUrl}`, values, headers)
                                    .then(async (response) => {
                                        // You can access the response data using apiOtpResponse in your component
                                        toast.success(response?.message || "Data Deleted successful!");
                                        dispatch(modelEdit(false));
                                        dispatch(modelDelete(false));
                                        navigate('/report/competitiveExam');
                                        setSubmitting(false);
                                        resetForm();
                                        dispatch({ type: actionTypes.MENU_OPEN, isOpen: 'reportCompetitiveExam' });
                                        setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                                        uniqueToken = generateUniqueToken();
                                    })
                                    .catch((error) => {
                                        toast.error(error?.message || "Please Try After Sometime");
                                        setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                                    });
                            }
                            else {
                                postApi(`${process.env.REACT_APP_HOST}/api/enquire/createSendEnquire`, { ...values, course: course, type: 'CompetitiveExam', tokenId: uniqueToken }, headers).then(async (response) => {
                                    socket.emit('sendMessage', {
                                        to: values.enquiryTokenBy, message: { ...values, course: course, type: 'CompetitiveExam', tokenId: uniqueToken }
                                    });
                                    toast.success("Send Enquire Successfully" || "Please Try After Sometime");
                                    setSubmitting(false);
                                    resetForm();
                                    setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                                    uniqueToken = generateUniqueToken();
                                })
                                    .catch((error) => {
                                        toast.error(error?.message || "Please Try After Sometime");
                                        setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                                    });
                            }
                        } catch (error) {
                            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                            toast.error("Something went wrong. Please try again later.");
                        }
                    }}
                >
                    {(values) => (
                        <Form>
                            <Typography sx={{
                                padding: "20px 20px 20px 0",
                                fontSize: '1.5rem',
                                fontWeight: '600',// Center the dialog horizontally
                                '@media (max-width: 600px)': {
                                    padding: "10px 5px 10px 0px",
                                    fontSize: '1.2rem',
                                }
                            }} >Competitive Exam Enquiry Form</Typography>
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
                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                    <Field
                                        name="dob"
                                        render={({ form }) => (
                                            <InputDateField
                                                name="dob"
                                                placeholder="Enter D.O.B"
                                                form={form}
                                                type="date"
                                            />
                                        )}
                                    />
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
                                        name="parentMobileNumber"
                                        render={({ form }) => (
                                            <InputField
                                                name="parentMobileNumber"
                                                placeholder="Enter Parent Mobile Number"
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
                            </Grid>
                            <Typography sx={{
                                padding: "20px 20px 20px 0",
                                fontSize: '1.2rem',
                                alignItems: "start",
                                textAlign: "start",
                                fontWeight: '500',// Center the dialog horizontally
                                '@media (max-width: 600px)': {
                                    padding: "10px 5px 10px 0px",
                                    fontSize: '1rem',
                                }
                            }} >Education Background</Typography>
                            <Grid container spacing={1}>
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
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="bachelor"
                                        render={({ form }) => (
                                            <InputField
                                                name="bachelor"
                                                placeholder="Enter Bachelor"
                                                form={form}
                                                type="text"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="master"
                                        render={({ form }) => (
                                            <InputField
                                                name="master"
                                                placeholder="Enter Master"
                                                form={form}
                                                type="text"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="educationother"
                                        render={({ form }) => (
                                            <InputField
                                                name="educationother"
                                                placeholder="Enter Other Education"
                                                form={form}
                                                type="text"
                                            />
                                        )}
                                    />
                                </Grid>

                            </Grid>
                            <Typography sx={{
                                padding: "10px 10px 10px 0",
                                fontSize: '1rem',
                                alignItems: "start",
                                textAlign: "start",
                                fontWeight: '400',// Center the dialog horizontally
                                '@media (max-width: 600px)': {
                                    padding: "10px 5px 10px 0",
                                    fontSize: '1rem',
                                }
                            }} >Which Exam Have You Appeared :-</Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="gpsc"
                                        render={({ form }) => (
                                            <InputField
                                                name="gpsc"
                                                placeholder="GPSC-1/2"
                                                form={form}
                                                type="text"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="psi"
                                        render={({ form }) => (
                                            <InputField
                                                name="psi"
                                                placeholder="PSI"
                                                form={form}
                                                type="text"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="class3"
                                        render={({ form }) => (
                                            <InputField
                                                name="class3"
                                                placeholder="Class-3"
                                                form={form}
                                                type="text"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={3} sm={6} md={4} >
                                    <Field
                                        name="other"
                                        render={({ form }) => (
                                            <InputField
                                                name="other"
                                                placeholder="Other"
                                                form={form}
                                                type="text"
                                            />
                                        )}
                                    />
                                </Grid>

                            </Grid>
                            <Typography sx={{
                                padding: "20px 20px 20px 0",
                                fontSize: '1.2rem',
                                alignItems: "start",
                                textAlign: "start",
                                fontWeight: '500',// Center the dialog horizontally
                                '@media (max-width: 600px)': {
                                    padding: "10px 5px 10px 0px",
                                    fontSize: '1rem',
                                }
                            }} >How Did You Hear About Sunrise Institute ?</Typography>
                            <Grid container spacing={1}>
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
                                {
                                    values?.values?.reference?.includes('Reference') && (
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
                                    )
                                }
                            </Grid>
                            <Typography sx={{
                                padding: "20px 20px 20px 0",
                                fontSize: '1.2rem',
                                alignItems: "start",
                                textAlign: "start",
                                fontWeight: '500',// Center the dialog horizontally
                                '@media (max-width: 600px)': {
                                    padding: "10px 5px 10px 0px",
                                    fontSize: '1rem',
                                }
                            }} >Office Use Only</Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                    <Field
                                        name="enquiryTokenBy"
                                        render={({ field, form }) => (
                                            <CustomSelectComponent
                                                name="enquiryTokenBy"
                                                label={'Enquiry Token By'}
                                                placeholder={`Enquiry Token By`}
                                                form={form}
                                                field={field}
                                                options={branchStaff}
                                            />
                                        )}
                                    />
                                </Grid>
                                {
                                    selected?.isEdit &&
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
                                }
                            </Grid>
                            <Grid container spacing={1}>
                                <Grid item xs={12} lg={12} sm={12} md={12}>
                                    <Field
                                        name="remark"
                                        render={({ form }) => (
                                            <CustomTextAreaComponents
                                                name="remark"
                                                placeholder="Remark"
                                                form={form}
                                                min={3}
                                                max={3}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
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
                                                                    <div className="nav-title" style={{ width: '45px' }}>Date :</div>
                                                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>{new Date().toLocaleDateString('en-GB')}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                                            <div className="nav-detail">
                                                                <div className="nav-title">Mobile No:</div>
                                                                <div className="nav-data">{
                                                                    (isBranch === 'Sita Nagar') ? '+91 99252 53632' : (isBranch === 'ABC, Mota Varachha') ? '+91 99786 26333' : ' +91 99796 86333'
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
                                                Competitive Exam Enquire
                                            </h2>
                                        </div>
                                        <div className="row">
                                            <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                                                <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                                                    <div className="receipt-right" style={{ width: '100%' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', margin: '1px 0', fontWeight: '500', fontSize: '16px' }}><h4 style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>Full Name :</h4><div className="border-line-fileds"> {values?.values?.name}</div></p>
                                                    </div>
                                                    <div className="receipt-right" style={{ width: '100%', marginTop: '13px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', margin: '1px 0', marginTop: '13px' }}><h4 style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>Enquire For :</h4><div className="border-line-fileds"> {Array.isArray(values?.values?.enquireFor) && values?.values?.enquireFor.join(', ')}</div></p>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '40px', marginTop: '-5px' }}>
                                                            <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}><h4 style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>Date of Birth :</h4><div className="border-line-fileds mr-6p">{formatDate(values?.values?.dob)}</div></p>
                                                        </div>
                                                    </div>
                                                    <div className="receipt-right" style={{ width: '100%', marginTop: '0px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', margin: '1px 0' }}><h4 style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>Address : </h4><div className="border-line-fileds"> {values?.values?.address}</div></p>
                                                    </div>
                                                    <div className="receipt-right" style={{ width: '100%', marginTop: '13px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', margin: '1px 0' }}><h4 style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>Education :</h4><div className="border-line-fileds">{values?.values?.education}</div></p>
                                                    </div>

                                                    {(values?.values?.class3 || values?.values?.psi || values?.values?.gpsc || values?.values?.master) && (
                                                        <div className="receipt-right" style={{ width: '100%', marginTop: '13px' }}>
                                                            <p style={{ display: 'flex', alignItems: 'center', height: '15px', margin: '1px 0' }}><h4 style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>Exam Token :</h4><div className="border-line-fileds">{[
                                                                values?.values?.class3,
                                                                values?.values?.psi,
                                                                values?.values?.master,
                                                                values?.values?.gpsc
                                                            ].filter(Boolean).join(', ')}</div></p>
                                                        </div>
                                                    )}
                                                    <div className="receipt-right" style={{ width: '100%', marginTop: '5px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '22px', marginTop: '-5px' }}>
                                                            <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}><h4 style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>Reference :</h4><div className="border-line-fileds mr-6p">{Array.isArray(values?.values?.reference) && values?.values?.reference.join(', ')}</div></p>
                                                            {(values?.values?.referenceName && values?.values?.reference?.includes('Reference')) && (
                                                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}><h4 style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>Reference Name :</h4><div className="border-line-fileds">{
                                                                    values?.values?.referenceName
                                                                }</div></p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="receipt-right" style={{ width: '100%', marginTop: '20px' }}>
                                                        <p style={{ display: 'flex', alignItems: 'center', height: '15px', margin: '1px 0' }}><h4 style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>Enquire Token By :</h4><div className="border-line-fileds">{setEnquiryTokenLabel(values?.values?.enquiryTokenBy)}</div></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className='footer-divider-form'></div>
                                            <div className='branch-address'>
                                                {(isBranch === 'Sita Nagar') ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat' : (isBranch === 'ABC, Mota Varachha') ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat' : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Grid container justifyContent="flex-end" marginTop={2}>
                                <Button
                                    disabled={btnDisable}
                                    colorScheme='blue'
                                    variant="outlined"
                                    color="primary"
                                    sx={{ marginRight: 2 }}
                                    onClick={() => { handlePrint(values?.values) }}
                                >
                                    print
                                </Button>
                                <Button type="submit" variant="contained" color="primary" disabled={btnDisable} sx={{ marginRight: 2 }}>
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
                                            onClick={() => form && form.resetForm()}
                                        >
                                            Reset
                                        </Button>
                                    )}
                                />
                            </Grid>
                        </Form>
                    )}
                </Formik>
            }
            <ToastContainer autoClose={1500} />
        </ItemPaper >
    );
}

export default CompetitiveExam;
import React, { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Fade, Button, ClickAwayListener, Paper, Popper, List, ListItemText, ListItemIcon, ListItemButton, Dialog, DialogTitle, DialogContent, Box, DialogActions, Grid, Typography } from '@mui/material';

// assets
import PersonTwoToneIcon from '@mui/icons-material/PersonTwoTone';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import MeetingRoomTwoToneIcon from '@mui/icons-material/MeetingRoomTwoTone';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { modelDelete, modelEdit, removeSendEnquire, userBranch, userLogout, userRole } from 'store/action';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import * as actionTypes from 'store/action/actions';
import { useSocket } from 'layout/SocketContext';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { CustomMultiSelect, CustomSelectComponent, CustomTextAreaComponents, InputDateField, InputField, InputRadioGroup } from 'component/InputFiled';
import { useApi } from 'network/api';
import { ToastContainer, toast } from 'react-toastify';
import { sendEnquire } from 'store/action';
import ApartmentIcon from '@mui/icons-material/Apartment';
import DeleteIcon from '@mui/icons-material/Delete';
import DateRangeIcon from '@mui/icons-material/DateRange';

// ==============================|| PROFILE SECTION ||============================== //

const ProfileSection = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { postApi, deleteApi, getApi } = useApi()
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const [openSendEnquire, setOpenSendEnquire] = React.useState(false);
  const [openReminderDate, setOpenReminderDate] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const anchorRefSendEnquire = React.useRef(null);
  const anchorRefReminderDate = React.useRef(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const sendEnquires = useSelector((state) => state?.sendEnquire);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [reminderDate, setReminderDate] = useState([]);
  const [selectedEnquire, setSelectedEnquire] = useState();
  const [btnDisable, setBtnDisable] = useState();
  const fetchDb = async () => {
    try {
      const url = `/api/enquire/findSendEnquire`;
      const body = {
        staff: localStorage.getItem('email')
      }
      const response = await postApi(url, body);
      const urlreminderDate = `/api/remainder/findReminder`;

      const responsereminderDate = await getApi(urlreminderDate);
      setReminderDate(responsereminderDate.pageItems);
      if (response && response.pageItems && response.pageItems.length > 0) {
        response.pageItems.forEach(item => dispatch(sendEnquire(item)));
      } else {
        console.error("No page items found in response:", response);
      }
    } catch {

    }
  }
  useEffect(() => {
    try {
      fetchDb()
    } catch (error) {
      console.error("Error:", error);
    }

  }, []);
  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsDeleteDialogOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleToggleSendEnquire = () => {
    setOpenSendEnquire((prevOpen) => !prevOpen);
  };

  const handleToggleReminderDate = () => {
    setOpenReminderDate((prevOpen) => !prevOpen);
  };


  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };
  const handleCloseSendEnquire = (event) => {
    if (anchorRefSendEnquire.current && anchorRefSendEnquire.current.contains(event.target)) {
      return;
    }

    setOpenSendEnquire(false);
  };
  const handleCloseReminderDate = (event) => {
    if (anchorRefReminderDate.current && anchorRefReminderDate.current.contains(event.target)) {
      return;
    }

    setOpenReminderDate(false);
  };


  useEffect(() => {
    setReceivedMessages(sendEnquires);
  }, [sendEnquires]);
  const prevOpen = React.useRef(open);
  const prevOpenSendEnquire = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  React.useEffect(() => {
    if (prevOpenSendEnquire.current === true && openSendEnquire === false) {
      anchorRefSendEnquire.current.focus();
    }

    prevOpenSendEnquire.current = openSendEnquire;
  }, [openSendEnquire]);

  const handleInput = (e, form, name) => {
    form.setFieldValue(name, e.target.value);
  };

  function formatDate(date) {
    // Get the day, month, and year
    let day = date.getDate();
    let month = date.getMonth() + 1; // Note: January is 0, so we add 1
    let year = date.getFullYear();

    // Pad day and month with leading zeros if necessary
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;

    // Construct the formatted date string
    return `${day}/${month}/${year}`;
  }

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    setBtnDisable(true);
    try {
      // try {
      const headers = {
      }
      let enquireDate = new Date();
      const body = {
        ...values,
        enquiryTokenBy: selectedEnquire?.enquiryTokenBy,
        enquireDate: formatDate(enquireDate)
      }
      let url = '';
      if (selectedEnquire?.type === 'Immigration') {
        url = '/api/immigration/createImmigration';
      } else if (selectedEnquire?.type === "CompetitiveExam") {
        url = '/api/competitiveExam/createCompetitiveExam';
      } else {
        url = '/api/itCourses/createItCourses';
      }
      const apiUrl = `${url}`;
      postApi(`${apiUrl}`, { ...body, status: 'pending', tokenId: selectedEnquire?.tokenId }, headers)
        .then(async (response) => {
          // You can access the response data using apiOtpResponse in your component
          if (selectedEnquire?.type === 'Immigration') {
            navigate('/report/enquire');
          } else if (selectedEnquire?.type === "CompetitiveExam") {
            navigate('/report/competitiveExam');
          } else {
            navigate('/report/itCourses');
          }
          dispatch({ type: actionTypes.MENU_OPEN, isOpen: 'reportImmigration' });
          toast.success(response?.message || "Data Deleted successful!");
          dispatch(modelEdit(false));
          dispatch(modelDelete(false));
          setIsDialogOpen(false);
          setIsDeleteDialogOpen(false);
          deleteApi(`/api/enquire/deleteSendEnquire/${selectedEnquire?.tokenId}`)
            .then(async (response) => {
              dispatch(removeSendEnquire(selectedEnquire));
              setSubmitting(false);
              resetForm();
            })
            .catch((error) => {
              toast.error(error?.message || "Please Try After Sometime");
            });
          setSelectedEnquire({});
          setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        })
        .catch((error) => {
          toast.error(error?.message || "Please Try After Sometime");
          setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        });
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      setBtnDisable(false); // Enable buttons after API call completes (success or failure)
    }
    // }
  }
  const handleDeleteApi = () => {
    let url = ''
    if (openReminderDate) {
      url = '/api/remainder/deleteReminder';
    } else {
      url = '/api/enquire/deleteSendEnquire';
    }
    deleteApi(`${url}/${selectedEnquire?.tokenId}`)
      .then(async (response) => {
        if (openReminderDate) {
          const urlreminderDate = `/api/remainder/findReminder`;

          const responsereminderDate = await getApi(urlreminderDate);
          setReminderDate(responsereminderDate.pageItems);
        } else {
          dispatch(removeSendEnquire(selectedEnquire));
        }
        toast.success(response?.message || "Data Deleted successful!");
        setIsDeleteDialogOpen(false);
      })
      .catch((error) => {
        toast.error(error?.message || "Please Try After Sometime");
        setIsDeleteDialogOpen(false);
      });
  }

  const immigrationValidationSchema = Yup.object().shape({
    suggestedCourse: Yup.array().min(1, 'Please select at least one option').required('Please select at least one option'),
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
    state: Yup.string().required('State is required'),
    passport: Yup.string().required('Passport is required'),
    education: Yup.string().required('Education are required'),
    interestedCountry: Yup.array().min(1, 'Please select at least one option').required('Please select at least one option'),
    intakePlannig: Yup.array().min(1, 'Please select at least one option').required('Please select at least one option'),
    // suggestedCourse: Yup.array().min(1, 'Please select at least one option').required('Please select at least one option'),
    enquiryTokenBy: Yup.string().required('Enquiry Token By are required'),
    reference: Yup.array().min(1, 'Please select at least one option').required('Please select at least one option'),
  });

  const competitiveExamValidationSchema = Yup.object().shape({
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
    suggestedCourse: Yup.array().min(1, 'Please select at least one option').required('Please select at least one option'),
  });

  const itCoursesValidationSchema = Yup.object().shape({
    suggestedCourse: Yup.array().min(1, 'Please select at least one option').required('Please select at least one option'),
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
    state: Yup.string().required('State is required'),
    education: Yup.string().required('Education are required'),
    enquiryTokenBy: Yup.string().required('Enquiry Token By are required'),
    reference: Yup.array().min(1, 'Please select at least one option').required('Please select at least one option'),
  });

  return (
    <div className='profile-section'>
      {reminderDate?.length > 0 &&
        <Button
          sx={{ minWidth: { sm: 50, xs: 35 } }}
          ref={anchorRefReminderDate}
          aria-controls={openReminderDate ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          aria-label="enquire"
          onClick={handleToggleReminderDate}
          color="inherit"
        >
          <DateRangeIcon sx={{ fontSize: '1.5rem' }} />
        </Button>
      }
      {receivedMessages?.sendEnquire?.length > 0 &&
        <Button
          sx={{ minWidth: { sm: 50, xs: 35 } }}
          ref={anchorRefSendEnquire}
          aria-controls={openSendEnquire ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          aria-label="enquire"
          onClick={handleToggleSendEnquire}
          color="inherit"
        >
          <NoteAltIcon sx={{ fontSize: '1.5rem' }} />
        </Button>
      }
      <Button
        sx={{ minWidth: { sm: 50, xs: 35 } }}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        aria-label="Profile"
        onClick={handleToggle}
        color="inherit"
      >
        <AccountCircleTwoToneIcon sx={{ fontSize: '1.5rem' }} />
      </Button>
      <Popper
        placement="bottom-end"
        open={openReminderDate}
        anchorEl={anchorRefReminderDate.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 10]
            }
          },
          {
            name: 'preventOverflow',
            options: {
              altAxis: true
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleCloseReminderDate}>
                <List
                  sx={{
                    width: '100%',
                    maxWidth: 450,
                    minWidth: 250,
                    backgroundColor: theme.palette.background.paper,
                    pb: 0,
                    borderRadius: '10px',
                    // overflowY: 'scroll'
                  }}
                >
                  {
                    reminderDate?.map((item, index) => {
                      return (
                        <ListItemButton>
                          <ListItemIcon onClick={() => {
                            setSelectedEnquire(item);
                            setOpenReminderDate(true);
                          }}>
                            <PersonTwoToneIcon />
                          </ListItemIcon>
                          <div style={{ width: '350px', alignItems: 'center', }} onClick={() => {
                            setSelectedEnquire(item);
                            setOpenReminderDate(true);
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: '90px', fontWeight: '600' }}>Name:</div> <ListItemText primary={item?.name} /></div>
                            <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: '90px', fontWeight: '600' }}>Course:</div> <ListItemText primary={item?.course} /></div>
                            <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: '90px', fontWeight: '600' }}>Reminder: </div><ListItemText primary={item?.reminderDate ? new Date(item.reminderDate).toLocaleDateString('en-GB') : ''} /></div>
                          </div>
                          <ListItemIcon sx={{ marginLeft: '20px' }} onClick={() => {
                            setSelectedEnquire(item);
                            setIsDeleteDialogOpen(true);
                          }}>
                            <DeleteIcon />
                          </ListItemIcon>
                        </ListItemButton>
                      )
                    })
                  }
                </List>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
      <Popper
        placement="bottom-end"
        open={openSendEnquire}
        anchorEl={anchorRefSendEnquire.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 10]
            }
          },
          {
            name: 'preventOverflow',
            options: {
              altAxis: true
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleCloseSendEnquire}>
                <List
                  sx={{
                    width: '100%',
                    maxWidth: 450,
                    minWidth: 250,
                    backgroundColor: theme.palette.background.paper,
                    pb: 0,
                    borderRadius: '10px',
                    // overflowY: 'scroll'
                  }}
                >
                  {
                    receivedMessages?.sendEnquire.map((item, index) => {
                      return (
                        <ListItemButton>
                          <div style={{ width: '350px', alignItems: 'center', display: 'flex' }} onClick={() => {
                            setSelectedEnquire(item);
                            setIsDialogOpen(true);
                          }}>
                            <ListItemIcon >
                              <PersonTwoToneIcon />
                            </ListItemIcon>
                            <ListItemText primary={item?.enquireFor?.join(" , ")} />
                          </div>
                          <ListItemIcon sx={{ marginLeft: '20px' }} onClick={() => {
                            setSelectedEnquire(item);
                            setIsDeleteDialogOpen(true);
                          }}>
                            <DeleteIcon />
                          </ListItemIcon>
                        </ListItemButton>
                      )
                    })
                  }

                </List>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 10]
            }
          },
          {
            name: 'preventOverflow',
            options: {
              altAxis: true
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <List
                  sx={{
                    width: '100%',
                    maxWidth: 350,
                    minWidth: 250,
                    backgroundColor: theme.palette.background.paper,
                    pb: 0,
                    borderRadius: '10px'
                  }}
                >
                  <ListItemButton selected={selectedIndex === 1} onClick={(event) => handleListItemClick(event, 1)}>
                    <ListItemIcon>
                      <PersonTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary={localStorage.getItem('email')} />
                  </ListItemButton>
                  <ListItemButton selected={selectedIndex === 2} onClick={(event) => handleListItemClick(event, 1)}>
                    <ListItemIcon>
                      <ApartmentIcon />
                    </ListItemIcon>
                    <ListItemText primary={user?.userBranch} />
                  </ListItemButton>

                  <ListItemButton selected={selectedIndex === 3} onClick={() => {
                    localStorage.clear();
                    navigate('/');
                    dispatch({ type: actionTypes.MENU_OPEN, isOpen: 'dashboard' });
                    dispatch(userLogout());
                  }} >
                    <ListItemIcon>
                      <MeetingRoomTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </List>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
      <Dialog
        maxWidth="lg"
        open={isDialogOpen}
        onClose={handleDialogClose}
      >
        {
          selectedEnquire?.type === "Immigration" ?
            <Formik
              initialValues={{
                enquireFor: selectedEnquire?.enquireFor || [],
                name: selectedEnquire?.name || '',
                dob: selectedEnquire?.dob || '',
                mobileNumber: selectedEnquire?.mobileNumber || '',
                parentMobileNumber: selectedEnquire?.parentMobileNumber || '',
                email: selectedEnquire?.email || '',
                address: selectedEnquire?.address || '',
                state: selectedEnquire?.state || '',
                passport: selectedEnquire?.passport || '',
                education: selectedEnquire?.education || '',
                bachelor: selectedEnquire?.bachelor || '',
                master: selectedEnquire?.master || '',
                educationother: selectedEnquire?.educationother || '',
                interestedCountry: selectedEnquire?.interestedCountry || [],
                intakePlannig: selectedEnquire?.intakePlannig || [],
                ieltsExamToken: selectedEnquire?.ieltsExamToken || '',
                greExamToken: selectedEnquire?.greExamToken || '',
                otherExamToken: selectedEnquire?.otherExamToken || '',
                reference: selectedEnquire?.reference || [],
                referenceName: selectedEnquire?.referenceName || '',
                enquiryTokenBy: selectedEnquire?.enquiryTokenBy || '',
                remark: selectedEnquire?.remark || '',
                suggestedCourse: '',
              }}
              validationSchema={immigrationValidationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {(values) => (
                <Form>
                  <DialogContent>
                    <Typography sx={{
                      padding: "20px 20px 20px 0",
                      fontSize: '1.5rem',
                      fontWeight: '600',// Center the dialog horizontally
                      '@media (max-width: 600px)': {
                        padding: "10px 5px 10px 0px",
                        fontSize: '1.2rem',
                      }
                    }} >Immigration Enquiry Form</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12} lg={3} sm={6} md={4}>
                        <Field
                          name="enquireFor"
                          render={({ form }) => (
                            <CustomMultiSelect
                              name="enquireFor"
                              placeholder="Enquire For"
                              options={selectedEnquire?.course}
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
                              valueDate={form?.values?.dob}
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
                        {/* Add other InputFields for additional form fields */}
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
                          name="state"
                          render={({ form }) => (
                            <CustomTextAreaComponents
                              name="state"
                              placeholder="Enter State"
                              form={form}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} lg={3} sm={6} md={4} >
                        <Field
                          name="passport"
                          render={({ form }) => (
                            <InputRadioGroup
                              name="passport"
                              form={form}
                              label="Do You Have Valid Passport ?"
                              options={[
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' },
                              ]}
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
                    <Grid container spacing={1} mt="2px">
                      <Grid item xs={12} lg={3} sm={6} md={4}>
                        <Field
                          name="interestedCountry"
                          render={({ form }) => (
                            <CustomMultiSelect
                              name="interestedCountry"
                              placeholder="Interested Country"
                              options={[
                                'USA', 'CANADA', 'AUS', 'UK', 'Other'
                              ]}
                              value={form.values.interestedCountry}
                              handleInputChange={(e) => {
                                handleInput(e, form, "interestedCountry");
                              }}
                              form={form}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} lg={3} sm={6} md={4}>
                        <Field
                          name="intakePlannig"
                          render={({ form }) => (
                            <CustomMultiSelect
                              name="intakePlannig"
                              placeholder="Which Intake Are You Plannig For"
                              options={[
                                'January', 'May', 'September', 'Other'
                              ]}
                              value={form.values.intakePlannig}
                              handleInputChange={(e) => {
                                handleInput(e, form, "intakePlannig");
                              }}
                              form={form}
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
                    }} >Which Exam Have You Taken :-</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12} lg={3} sm={6} md={4} >
                        <Field
                          name="ieltsExamToken"
                          render={({ form }) => (
                            <InputField
                              name="ieltsExamToken"
                              placeholder="IELTS/PTE"
                              form={form}
                              type="text"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} lg={3} sm={6} md={4} >
                        <Field
                          name="greExamToken"
                          render={({ form }) => (
                            <InputField
                              name="greExamToken"
                              placeholder="GRE"
                              form={form}
                              type="text"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} lg={3} sm={6} md={4} >
                        <Field
                          name="otherExamToken"
                          render={({ form }) => (
                            <InputField
                              name="otherExamToken"
                              placeholder="Other Exam Token"
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
                          name="suggestedCourse"
                          render={({ form }) => (
                            <CustomMultiSelect
                              name="suggestedCourse"
                              placeholder="Enter Suggested Course"
                              options={selectedEnquire?.course}
                              value={form.values.suggestedCourse}
                              handleInputChange={(e) => {
                                handleInput(e, form, "suggestedCourse");
                              }}
                              form={form}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} mt="2px">
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
                    <Grid container justifyContent="flex-end" marginTop={2}>
                      <Button type="submit" disabled={btnDisable} variant="contained" color="primary" sx={{ marginRight: 2 }}>
                        Submit
                      </Button>
                      <Button
                        type="reset"
                        variant="contained"
                        color="secondary"
                        disabled={btnDisable}
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Close
                      </Button>
                    </Grid>
                  </DialogContent>
                </Form>
              )}
            </Formik>
            : selectedEnquire?.type === "CompetitiveExam" ?
              <Formik
                initialValues={{
                  enquireFor: selectedEnquire?.enquireFor || [],
                  name: selectedEnquire?.name || '',
                  dob: selectedEnquire?.dob || '',
                  mobileNumber: selectedEnquire?.mobileNumber || '',
                  parentMobileNumber: selectedEnquire?.parentMobileNumber || '',
                  email: selectedEnquire?.email || '',
                  address: selectedEnquire?.address || '',
                  state: selectedEnquire?.state || '',
                  state:selectedEnquire?.state || '',
                  education: selectedEnquire?.education || '',
                  bachelor: selectedEnquire?.bachelor || '',
                  master: selectedEnquire?.master || '',
                  educationother: selectedEnquire?.educationother || '',
                  gpsc: selectedEnquire?.gpsc || '',
                  psi: selectedEnquire?.psi || '',
                  class3: selectedEnquire?.class3 || '',
                  other: selectedEnquire?.other || '',
                  reference: selectedEnquire?.reference || [],
                  referenceName: selectedEnquire?.referenceName || '',
                  enquiryTokenBy: selectedEnquire?.enquiryTokenBy || '',
                  remark: selectedEnquire?.remark || '',
                  suggestedCourse: '',
                }}
                validationSchema={competitiveExamValidationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
              >
                {(values) => (
                  <Form>
                    <DialogContent>
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
                                options={selectedEnquire?.course}
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
                        <Grid item xs={12} lg={3} sm={6} md={4} >
                          <Field
                            name="state"
                            render={({ form }) => (
                              <CustomTextAreaComponents
                                name="state"
                                placeholder="Enter State"
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
                            name="suggestedCourse"
                            render={({ form }) => (
                              <CustomMultiSelect
                                name="suggestedCourse"
                                placeholder="Enter Suggested Course"
                                options={selectedEnquire?.course}
                                value={form.values.suggestedCourse}
                                handleInputChange={(e) => {
                                  handleInput(e, form, "suggestedCourse");
                                }}
                                form={form}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={1} mt="2px">
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

                      <Grid container justifyContent="flex-end" marginTop={2}>
                        <Button type="submit" disabled={btnDisable} variant="contained" color="primary" sx={{ marginRight: 2 }}>
                          Submit
                        </Button>
                        <Button
                          type="reset"
                          variant="contained"
                          color="secondary"
                          disabled={btnDisable}
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Close
                        </Button>
                      </Grid>
                    </DialogContent>
                  </Form>
                )}
              </Formik>
              : selectedEnquire?.type === "ItCourses" ?
                <Formik
                  initialValues={{
                    enquireFor: selectedEnquire?.enquireFor || [],
                    name: selectedEnquire?.name || '',
                    dob: selectedEnquire?.dob || '',
                    mobileNumber: selectedEnquire?.mobileNumber || '',
                    parentMobileNumber: selectedEnquire?.parentMobileNumber || '',
                    email: selectedEnquire?.email || '',
                    address: selectedEnquire?.address || '',
                    state: selectedEnquire?.state || '',
                    education: selectedEnquire?.education || '',
                    reference: selectedEnquire?.reference || [],
                    percentageCgpi: selectedEnquire?.percentageCgpi || '',
                    stdSemester: selectedEnquire?.stdSemester || '',
                    enquiryTokenBy: selectedEnquire?.enquiryTokenBy || '',
                    referenceName: selectedEnquire?.referenceName || '',
                    remark: selectedEnquire?.remark || '',
                    suggestedCourse: '',
                  }}
                  validationSchema={itCoursesValidationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize={true}
                >
                  {(values) => (
                    <Form>
                      <DialogContent>
                        <Typography sx={{
                          padding: "20px 20px 20px 0",
                          fontSize: '1.5rem',
                          fontWeight: '600',// Center the dialog horizontally
                          '@media (max-width: 600px)': {
                            padding: "10px 5px 10px 0px",
                            fontSize: '1.2rem',
                          }
                        }} >It Courses Enquiry Form</Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={12} lg={3} sm={6} md={4}>
                            <Field
                              name="enquireFor"
                              render={({ form }) => (
                                <CustomMultiSelect
                                  name="enquireFor"
                                  placeholder="Enquire For"
                                  options={selectedEnquire?.course}
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
                          <Grid item xs={12} lg={3} sm={6} md={4} >
                            <Field
                              name="state"
                              render={({ form }) => (
                                <CustomTextAreaComponents
                                  name="state"
                                  placeholder="Enter State"
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
                              name="stdSemester"
                              render={({ form }) => (
                                <InputField
                                  name="stdSemester"
                                  placeholder="Enter STD/SEMESTER"
                                  form={form}
                                  type="text"
                                />
                              )}
                            />
                          </Grid>

                          <Grid item xs={12} lg={3} sm={6} md={4} >
                            <Field
                              name="percentageCgpi"
                              render={({ form }) => (
                                <InputField
                                  name="percentageCgpi"
                                  placeholder="Enter Other Education"
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
                              name="suggestedCourse"
                              render={({ form }) => (
                                <CustomMultiSelect
                                  name="suggestedCourse"
                                  placeholder="Enter Suggested Course"
                                  options={selectedEnquire?.course}
                                  value={form.values.suggestedCourse}
                                  handleInputChange={(e) => {
                                    handleInput(e, form, "suggestedCourse");
                                  }}
                                  form={form}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={1} mt="2px">
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

                        <Grid container justifyContent="flex-end" marginTop={2}>

                          <Button type="submit" disabled={btnDisable} variant="contained" color="primary" sx={{ marginRight: 2 }}>
                            Submit
                          </Button>
                          <Button
                            type="reset"
                            variant="contained"
                            color="secondary"
                            disabled={btnDisable}
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Close
                          </Button>
                        </Grid>
                      </DialogContent>
                    </Form>
                  )}
                </Formik>
                :
                <Button
                  type="reset"
                  variant="contained"
                  color="secondary"
                  disabled={btnDisable}
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
        }
      </Dialog >
      <Dialog open={isDeleteDialogOpen} onClose={handleDialogClose}>
        <DialogContent
          sx={{
            width: '500px',
            margin: 'auto',
            '@media (max-width: 600px)': {
              width: '80vw'
            }
          }}
        >
          <Typography>Are you sure you want to delete ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button colorScheme="gray" mr={3} disabled={btnDisable} onClick={handleDialogClose}>
            No
          </Button>
          <Button colorScheme="blue" type="submit" disabled={btnDisable} onClick={handleDeleteApi}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer autoClose={1500} />
    </div>
  );
};

export default ProfileSection;

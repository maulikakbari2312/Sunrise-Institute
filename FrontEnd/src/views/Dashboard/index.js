import React, { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, CircularProgress, Grid } from '@mui/material';

//project import
import ReportCard from './ReportCard';
import { gridSpacing } from 'config.js';

// assets
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import SchoolIcon from '@mui/icons-material/School';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useApi } from 'network/api';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { modelData, totalRowsCount } from 'store/action';
import 'react-toastify/dist/ReactToastify.css';
import CommonTable from 'component/CommonTable/CommonTable';
import { Field, Form, Formik } from 'formik';
import { CustomSelectComponent, InputDateField } from 'component/InputFiled';
import SecondaryCommonTable from 'component/CommonTable/SecondaryCommonTable';
// ==============================|| DASHBOARD DEFAULT ||============================== //

const Default = () => {
  const theme = useTheme();
  const { getApi, postApi } = useApi();
  const [dataBase, setDataBase] = useState({});
  const [data, setData] = useState({});
  const [demoData, setDemoData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [btnDisable, setBtnDisable] = useState(false);
  const user = useSelector(state => state.user.isAdmin);
  const [isUser, setIsUser] = useState(user);
  const [totalPendingInstallmentAmount, setTotalPendingInstallmentAmount] = useState(0)
  useEffect(() => {
    setIsUser(user);
  }, [user]);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const selected = useSelector((state) => state.selected);
  const [isFetch, setIsFetch] = useState(false);
  const putUrl = '/api/enroll/pay-installments';
  const deleteUrl = '/api/admin/deleteCourse';
  const handlePartialPayment = (e, form) => {
    const { name, value } = e.target;
    if (((isNaN(parseFloat(form?.values?.installmentAmount)) ? 0 : parseFloat(form?.values?.installmentAmount)) * Number(form.values.duePendingInstallment) + (isNaN(parseFloat(form?.values?.duePartialPayment)) ? 0 : parseFloat(form?.values?.duePartialPayment))) >= value) {
      form.setFieldValue(name, value)
      form.setFieldValue('payInstallmentFees', ((Number(form?.values?.duePendingInstallment) * Number(form?.values?.installmentAmount)) + Number(form?.values?.duePartialPayment) - Number(value))?.toFixed(2));
    }
  }
  const model = {
    btnTitle: 'Pending Installments',
    page: 'pendingInstallments',
    fieldData: [
      {
        name: 'name',
        type: 'text',
        disabled: true
      },
      {
        name: 'Enquire Type',
        type: 'text',
        modelNone: true
      },
      {
        name: 'Course',
        type: 'text',
        disabled: true
      },
      {
        name: 'Total Fees',
        type: 'text',
        modelNone: true
      },
      {
        name: 'Installment',
        type: 'text',
        modelNone: true
      },
      {
        name: 'Installment Amount',
        type: 'text',
        disabled: true
      },
      {
        name: 'Due Partial Payment',
        type: 'number',
        displayNone: true,
        disabled: true,
        isNotRequired: true
      },
      {
        name: 'Partial Payment',
        type: 'number',
        isManual: true,
        handleInputChange: handlePartialPayment
      },
      {
        name: 'Pay Installment',
        type: 'text',
        modelNone: true
      },
      {
        name: 'Total Pending Installment',
        type: 'text',
        modelNone: true,
        isNotRequired: true
      },
      {
        name: 'Due Pending Installment',
        type: 'Number',
        isManual: true,
        isNotRequired: true
      },
      {
        name: 'Payment Method',
        type: "paymentSelectBox",
        options: [{
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
        }],
        displayNone: true,
      },
      {
        name: 'Pending Installment Date',
        type: 'text',
        modelNone: true
      },
      {
        name: 'Pay Installment Fees',
        type: 'Number',
        displayNone: true,
        disabled: true
      },
      {
        name: "Name",
        type: "text",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
      },
      {
        name: "Enquire For",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "text",
      },
      {
        name: "Enquire Date",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "text",
      },
      {
        name: "Status",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "select",
      },
      {
        name: "Demo Date",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "text",
      },
      {
        name: "Email",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "email",
      },
      {
        name: "DOB",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "date",
      },
      {
        name: "Mobile Number",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "number",
      },
      {
        name: "Parent Mobile Number",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "number",
      },
      {
        name: "Address",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "text"
      },
      {
        name: "Suggested Course",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "multiSelect"
      },
      {
        name: "Enquiry Token By",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "text"
      },
      {
        name: "Reference",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "multiSelect"
      },
      {
        name: "Reference Name",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "text"
      },
      {
        name: "Branch",
        pageShow: 'showDemo',
        modelNone: true,
        isNotRequired: true,
        type: "text"
      },
    ]
  };
  const fetchDataBase = async () => {
    setBtnDisable(false);
    // setIsLoading(true);
    try {
      const url = `${process.env.REACT_APP_HOST}/api/enroll/check-installments`;
      const response = await getApi(url);
      setData(response?.pageItems);
      const urlDataBase = `${process.env.REACT_APP_HOST}/api/enquire/findEnquire`;
      setTotalPendingInstallmentAmount(0);
      const responseDataBase = await getApi(urlDataBase);
      setDataBase(responseDataBase?.pageItems);
      const demoUrl = `${process.env.REACT_APP_HOST}/api/enroll/findDemoEnroll`;
      const demoResponse = await getApi(demoUrl);
      setDemoData(demoResponse?.pageItems);
      setTotalPendingInstallmentAmount(response?.pageItems?.length > 0 ? response?.totalPendingInstallmentAmount : 0)
      setIsFetch(false);
      setIsLoading(false);

      dispatch(totalRowsCount(response?.total || 0));
      setBtnDisable(false); // Enable buttons after API call completes (success or failure)
    } catch (error) {
      setIsError(true);
      setIsFetch(false);
      setIsLoading(false);
      setTotalPendingInstallmentAmount(0)
      setError(error);
      toast.error(error?.message || 'Please Try After Sometime');
      setBtnDisable(false); // Enable buttons after API call completes (success or failure)
    }
  };

  useEffect(() => {
    if (isFetch == true) {
      setIsFetch(false);
      fetchDataBase();
    }
  }, [isFetch, selected.isEdit]);
  useEffect(() => {
    fetchDataBase();
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
    <>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          {isLoading == true ? (
            <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" w="100%" mt={{ xl: '40px', sm: '10px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={gridSpacing}>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <ReportCard
                  primary={dataBase?.totalEnquire?.toString()}
                  color={theme.palette.secondary.main}
                  footerData="Total Enquire"
                  iconPrimary={ReceiptIcon}
                  iconFooter={TrendingUpIcon}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <ReportCard
                  primary={dataBase?.demo?.toString()}
                  color={theme.palette.primary.main}
                  footerData="Total Demo Enquire"
                  iconPrimary={AssignmentIcon}
                  iconFooter={TrendingUpIcon}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <ReportCard
                  primary={dataBase?.pending?.toString()}
                  color={theme.palette.warning.main}
                  footerData="Total Pending Enquire"
                  iconPrimary={PendingActionsIcon}
                  iconFooter={TrendingUpIcon}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <ReportCard
                  primary={dataBase?.enroll?.toString()}
                  color={theme.palette.enroll.main}
                  footerData="Total Success Enquire"
                  iconPrimary={ThumbUpIcon}
                  iconFooter={TrendingUpIcon}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <ReportCard
                  primary={dataBase?.reject?.toString()}
                  color={theme.palette.error.main}
                  footerData="Total Reject Enquire"
                  iconPrimary={ThumbDownAltIcon}
                  iconFooter={TrendingDownIcon}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <ReportCard
                  primary={dataBase?.completeEnroll?.toString()}
                  color={theme.palette.success.main}
                  footerData="Total Course Completion Student"
                  iconPrimary={SchoolIcon}
                  iconFooter={TrendingUpIcon}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <ReportCard
                  primary={totalPendingInstallmentAmount?.toFixed(2)?.toString()}
                  color={theme.palette.secondary.main}
                  footerData="Total Pending Installment Amount"
                  iconPrimary={SchoolIcon}
                  iconFooter={TrendingUpIcon}
                />
              </Grid>
            </Grid>
          )}
        </Grid>
        <ToastContainer autoClose={1500} />
      </Grid>
      <Box mt="25px">
        <Box display="flex" flexDirection="column" gap={"10px"}>
          <Formik
            initialValues={{
              startDate: '',
              endDate: '',
              enquireBranch: ''
            }}

            onSubmit={(values, { setSubmitting }) => {
              setBtnDisable(true);

              (async () => {
                // setIsLoading(true);
                try {
                  const filteredValues = filterEmptyValues(values);
                  const url = `${process.env.REACT_APP_HOST}/api/enroll/findCheckFilterEnroll`
                  const response = await postApi(url, filteredValues);
                  setData(response?.pageItems);
                  setTotalPendingInstallmentAmount(response?.totalPendingInstallmentAmount || 0);
                  setIsFetch(false);
                  setIsLoading(false)
                  toast.success(response?.message || "New Data ADD successful!");
                  setBtnDisable(false);
                } catch (error) {
                  setIsError(true);
                  setIsFetch(false);
                  setError(error);
                  toast.error(error?.message || "Please Try After Sometime");
                  setBtnDisable(false);

                }
              })()
            }}
          >
            {(values) => (
              <Form>
                <Grid container spacing={1}>
                  <Grid item xs={12} lg={3} sm={6} md={4} >
                    <Field
                      name="startDate">
                      {({ form }) => (
                        <InputDateField
                          name="startDate"
                          placeholder="Enter Start Date"
                          form={form}
                          type="date"
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} lg={3} sm={6} md={4} >
                    <Field name="endDate">
                      {({ field, form }) => (
                        <InputDateField
                          name="endDate"
                          placeholder="Enter End Date"
                          form={form}
                          type="date"
                        />
                      )}
                    </Field>

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
                  <Grid item xs={12} lg={3} sm={6} md={4} display={'flex'} alignItems={'end'} justifyContent={'end'}>
                    <Button type="submit" disabled={btnDisable} variant="contained" color="primary" sx={{ marginRight: 2 }}>
                      Filter
                    </Button>
                    <Field
                      name="reset">
                      {({ form }) => (
                        <Button
                          type="reset"
                          variant="contained"
                          color="secondary"
                          disabled={selected.isEdit && btnDisable}
                          onClick={() => { form && form.resetForm(); fetchDataBase() }}
                        >
                          Reset
                        </Button>
                      )}
                    </Field>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
          <CommonTable
            data={data}
            isLoading={isLoading}
            isError={isError}
            error={error}
            page="pendingInstallments"
            tableTitle="Pending Installments"
            url={putUrl}
            deleteUrl={deleteUrl}
            setIsFetch={setIsFetch}
            toast={toast}
          />
          <Box className="report">
            <SecondaryCommonTable
              data={demoData}
              isLoading={isLoading}
              isError={isError}
              error={error}
              page="pendingInstallments"
              tableTitle="Demo Student"
              url={putUrl}
              deleteUrl={deleteUrl}
              setIsFetch={setIsFetch}
              toast={toast}
            />
          </Box>
        </Box>
      </Box >
    </>
  );
};

export default Default;

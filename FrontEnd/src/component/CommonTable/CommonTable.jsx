import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useApi } from 'network/api';
import { modelDelete, modelEdit, selectData } from 'store/action';
import { Button, Card, Dialog, DialogActions, DialogContent, Typography, Box, DialogTitle } from '@mui/material';
import CardBody from 'component/Card/CardBody';
import CommonModal from 'component/CommonModal/CommonModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router';
import { CustomMultiSelect, CustomSelectComponent, InputDateField, InputField, InputRadioGroup, InputSelectNR } from 'component/InputFiled';
import * as actionTypes from 'store/action/actions';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Logo from '../../assets/images/logoSunrise.png';
import BackgroundImage from '../../assets/images/logoSunrise.png';
import SunLogo from '../../assets/images/SunLogo.png';
import RefundImage from '../../assets/images/refund.jpg';
import DigitalImage from '../../assets/images/copy.jpg';
import DateRangeIcon from '@mui/icons-material/DateRange';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
const CommonTable = ({ error, isError, isLoading, data, tableTitle, url, setIsFetch, deleteUrl, isPagination = true, setAddGallery }) => {
  const { deleteApi, putApi, postApi, getApi } = useApi();
  const [course, setCourse] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [type, setType] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [rowData, setRowData] = useState({});
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAdvancePaymentDialogOpen, setIsAdvancePaymentDialogOpen] = useState(false);
  const [ispartialPaymentOpen, setIspartialPaymentOpen] = useState(false);
  const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false);
  const [isPaymentReminderDialogOpen, setIsPaymentReminderDialogOpen] = useState(false);
  const [settlePaymentData, setSettlePaymentData] = useState([]);
  const dispatch = useDispatch();
  const modelData = useSelector((state) => state.selected.modelData);
  const selected = useSelector((state) => state.selected);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.isAdmin);
  const [isUser, setIsUser] = useState(user);
  const [btnDisable, setBtnDisable] = useState(false);
  const [isCounterNumber, setIsCounterNumber] = useState({});
  const isBranch = useSelector((state) => state.user?.userBranch);
  const name = localStorage.getItem('name');
  const conterNumber = async () => {
    try {
      const response = await getApi(`${process.env.REACT_APP_HOST}/api/enroll/find-book-numbers`);
      setIsCounterNumber(response?.pageItems);
    } catch (error) {
      toast.error(error?.message || 'Please Try After Sometime');
    }
  };
  // craete payment slip?
  useEffect(() => {
    setIsUser(user);
  }, [user]);
  useEffect(() => {
    try {
      let url = '';
      if (selected?.modelData?.page == 'ImmigrationReport') {
        url = `${process.env.REACT_APP_HOST}/api/admin/findcourse/Immigration`;
        setType('Immigration');
      } else if (selected?.modelData?.page == 'CompetitiveExamReport') {
        url = `${process.env.REACT_APP_HOST}/api/admin/findcourse/CompetitiveExam`;
        setType('CompetitiveExam');
      } else if (selected?.modelData?.page == 'ItCoursesReport') {
        url = `${process.env.REACT_APP_HOST}/api/admin/findcourse/ItCourses`;
        setType('ItCourses');
      } else {
        setType('Immigration');
        url = `${process.env.REACT_APP_HOST}/api/admin/findcourse/Immigration`;
      }
      (async () => {
        try {
          const response = await getApi(url);
          setCourseData(response?.pageItems);
          if (response?.pageItems && Array.isArray(response.pageItems)) {
            const courseTypes = response.pageItems.map((course) => course.courseName);
            setCourse(courseTypes);
          }
        } catch (error) {
          toast.error(error?.message || 'Please Try After Sometime');
        }
      })();
    } catch (error) {
      toast.error(error?.message || 'Please Try After Sometime');
    }
  }, []);
  useEffect(() => {
    try {
      conterNumber();
      if ((isPaymentDialogOpen && selected?.isEdit === true) || (ispartialPaymentOpen && selected?.isEdit === true) || (isAdvancePaymentDialogOpen && selected?.isEdit === true) || (isSettleDialogOpen && selected?.isEdit === true)) {
        let url = `${process.env.REACT_APP_HOST}/api/admin/findcourse/${selected?.selectData?.user?.enquireType}`;
        (async () => {
          try {
            const response = await getApi(url);
            setCourseData(response?.pageItems);
            if (response?.pageItems && Array.isArray(response.pageItems)) {
              const courseTypes = response.pageItems.map((course) => course.courseName);
              setCourse(courseTypes);
              if (selected?.isEdit === true) {
                const selectedCourse = response?.pageItems?.find((myCourse) => myCourse.courseName === selected?.selectData?.user?.course);
                setSelectedCourse(selectedCourse);
              }
            }
          } catch (error) {
            toast.error(error?.message || 'Please Try After Sometime');
          }
        })();
      }
    } catch { }
  }, [isPaymentDialogOpen, ispartialPaymentOpen, isAdvancePaymentDialogOpen, isSettleDialogOpen]);

  const customStyles = {
    rdt_TableCol: {
      style: {
        whiteSpace: 'pre-line',
        wordWrap: 'break-word'
      }
    }
  };

  const conditionalRowStyles = [
    {
      when: (row) => {
        const dateArray = row.pendingInstallmentDate ? row.pendingInstallmentDate.split(', ') : [];

        if (dateArray.length > 0) {
          const lastDate = new Date(dateArray[dateArray.length - 1].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'));
          const currentDate = new Date();
          const lastDateString = `${lastDate.getMonth() + 1}/${lastDate.getDate()}/${lastDate.getFullYear()}`;
          const currentDateString = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;

          return lastDateString === currentDateString;
        }

        return false;
      },
      style: {
        backgroundColor: '#747474',
        color: 'white'
      }
    }
  ];

  const [isProcessButton, setIsProcessButton] = useState(false);

  if (isError) return <h1>{error?.message}</h1>;
  const handleEdit = (row) => {
    if (selected?.modelData?.page == 'Gallery' || selected?.modelData?.page == 'WebCourse') {
      // dispatch(modelEdit(true));
      // dispatch(modelDelete(false));
      // dispatch(selectData(row));
      setAddGallery(true);
    } else if (selected?.modelData?.page == 'Enroll') {
      setIsPaymentDialogOpen(true);
    } else if (selected?.modelData?.page == 'partialPayment') {
      setIspartialPaymentOpen(true);
    } else if (selected?.modelData?.page == 'ImmigrationReport') {
      navigate('/enquire/immigration');
      dispatch({ type: actionTypes.MENU_OPEN, isOpen: 'immigration' });
    } else if (selected?.modelData?.page == 'CompetitiveExamReport') {
      navigate('/enquire/competitive-exam');
      dispatch({ type: actionTypes.MENU_OPEN, isOpen: 'competitiveExam' });
    } else if (selected?.modelData?.page == 'ItCoursesReport') {
      navigate('/enquire/it-courses');
      dispatch({ type: actionTypes.MENU_OPEN, isOpen: 'itCourses' });
    } else {
      setIsDialogOpen(true);
    }
    dispatch(modelEdit(true));
    dispatch(modelDelete(false));
    dispatch(selectData(row));
  };
  const handleAdvancePayment = (row) => {
    setIsAdvancePaymentDialogOpen(true);
    dispatch(modelEdit(true));
    dispatch(modelDelete(false));
    dispatch(selectData(row));
  };
  const handleSettleEdit = async (row) => {
    const url = `${process.env.REACT_APP_HOST}/api/enroll/settle-payment-data`;
    await postApi(url, { tokenId: row?.user?.tokenId }).then((res) => {
      setSettlePaymentData(res?.pageItems);
    });
    setIsSettleDialogOpen(true);
    dispatch(modelEdit(true));
    dispatch(modelDelete(false));
    dispatch(selectData(row));
  };
  const handlePaymentReminderEdit = (row) => {
    setIsPaymentReminderDialogOpen(true);
    dispatch(modelEdit(true));
    dispatch(modelDelete(false));
    dispatch(selectData(row));
  };

  const handleDelete = (row) => {
    setIsDeleteOpen(true);
    dispatch(modelEdit(false));
    dispatch(modelDelete(true));
    dispatch(selectData(row));
  };

  const ImageCell = ({ row, fieldName }) => {

    return <img src={row?.user?.gallery} alt={fieldName} style={{ maxWidth: '50px' }} />
  };

  const columnsFromModelData = modelData?.fieldData?.map((field, index) => {
    if (field && !field.displayNone && !field.pageShow) {
      if (field.type === 'file') {
        return {
          name: field.name,
          cell: (row) => <ImageCell row={row} fieldName={field.name} />,
          sortable: false,
          id: Date.now().toString(36) + Math.random(10000).toString(36).substr(2, 5),
        };
      } else if (field.type === 'select') {
        return {
          name: field.name,
          cell: (row) => (
            <InputSelectNR
              options={['pending', 'demo', 'enroll', 'reject']}
              value={row?.user['status']}
              name={field.name}
              placeholder={`Enter ${field.name}`}
              handleInputChange={(e) => {
                handleInputChange(e, row);
              }}
            />
          ),
          sortable: false,
          id: `${field.name}${index}`
        };
      } else {
        return {
          name: field.name,
          selector: (row) =>
            row[
            field.name
              .split(' ')
              .map((word, index) => (index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)))
              .join('')
              .replace(/(\([^)]*\))/g, '')
            ],
          sortable: true,
          id: `${field.name}${index}`
        };
      }
    }
  });
  const datas = columnsFromModelData?.filter((column) => column !== undefined);

  const columns = [
    {
      name: 'ID',
      selector: (row) => row.id,
      sortable: true,
      id: (row) => row.id
    },
    ...(Array.isArray(columnsFromModelData) ? datas : [])
  ];

  if (
    modelData?.page !== 'PaymentSlipBook' &&
    modelData?.page !== 'CourseCompletionStudent' &&
    modelData?.page !== 'PaymentReport' &&
    modelData?.page !== 'SettlePayment' &&
    modelData?.page !== 'Contact'
  ) {
    columns.push({
      name: 'Action',
      cell: (row) => (
        <Box display="flex" justifyContent="space-between" width="60px">
          {modelData?.page !== 'pendingInstallments' && modelData?.page !== 'partialPayment' && (
            <>
              <EditIcon onClick={() => handleEdit(row)} />
              {modelData?.page !== 'Enroll' &&
                modelData?.page !== 'ImmigrationReport' &&
                modelData?.page !== 'CompetitiveExamReport' &&
                modelData?.page !== 'ItCoursesReport' && <DeleteIcon onClick={() => handleDelete(row)} />}
            </>
          )}
          {(modelData?.page === 'pendingInstallments' || modelData?.page === 'partialPayment') && <>
            <PointOfSaleIcon onClick={() => handleEdit(row)} />
            <DateRangeIcon onClick={() => { handlePaymentReminderEdit(row) }} />
          </>}
          {(modelData?.page === 'Enroll' && row?.user?.payInstallment != row?.user?.installment) && <PointOfSaleIcon onClick={() => handleAdvancePayment(row)} />}
          {modelData?.page === 'Enroll' && isUser === 'master' && <HourglassBottomIcon onClick={() => handleSettleEdit(row)} />}
        </Box>
      )
    });
  }

  if (modelData?.page === 'Contact') {
    columns.push({
      name: 'Action',
      cell: (row) => (
        <Box display="flex" justifyContent="space-between" width="60px">
          <DeleteIcon onClick={() => handleDelete(row)} />
        </Box>
      )
    });
  }

  const tableData = Array.isArray(data)
    ? data?.map((user, index) => {
      const rowData = {};

      columns.forEach((column) => {
        if (column.selector && column) {
          const columnName = column.name
            .split(' ')
            .map((word, index) => (index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)))
            .join('')
            .replace(/(\([^)]*\))/g, '');

          const columnValue = column.selector(user);

          rowData[columnName] = Array.isArray(columnValue) ? columnValue.join(', ') : columnValue;
        }

        rowData['user'] = user;
      });

      if (user?.pendingInstallmentDate && user?.pendingInstallmentDate.length > 0) {
        const lastDate = new Date(
          user.pendingInstallmentDate[user.pendingInstallmentDate.length - 1].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3')
        );
        const currentDate = new Date();

        const lastDateString = `${lastDate.getMonth() + 1}/${lastDate.getDate()}/${lastDate.getFullYear()}`;

        const currentDateString = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
        if (lastDateString === currentDateString) {
          rowData['backgroundColor'] = 'red';
        }
      }

      rowData['id'] = index + 1;
      return rowData;
    })
    : [];

  const handleDialogClose = () => {
    setIsDeleteOpen(false);
    setIsProcessButton(false);
    dispatch(selectData({}));
    setSettlePaymentData([]);
  };
  const handleDeleteApi = () => {
    setBtnDisable(true);
    try {
      const apiUrl = `${process.env.REACT_APP_HOST}${deleteUrl}`;
      let tokenId = selected.selectData.user.tokenId;
      deleteApi(`${apiUrl}/${tokenId}`)
        .then(async (response) => {
          toast.success(response?.message || 'Data Deleted successful!');
          dispatch(modelEdit(false));
          dispatch(modelDelete(false));
          setIsDeleteOpen(false);
          setIsFetch(true);
          dispatch(selectData({}));
          setBtnDisable(false);
          setIsDeleteOpen(false);
        })
        .catch((error) => {
          toast.error(error?.message || 'Please Try After Sometime');
          dispatch(selectData({}));
          setBtnDisable(false);
        });
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
      setBtnDisable(false);
    }
  };

  const handleGetFees = (e, form) => {
    form.setFieldValue('course', e.target.value);
    const selectedCourse = courseData?.find((myCourse) => myCourse.courseName === e.target.value);
    setSelectedCourse(selectedCourse);
    if (selectedCourse) {
      const totalFees = isNaN(parseFloat(selectedCourse.fees)) ? 0 : parseFloat(selectedCourse.fees);
      form.setFieldValue('totalFees', totalFees);

      const discount = isNaN(parseFloat(form.values.discount)) ? 0 : parseFloat(form.values.discount);
      const partialPayment = isNaN(parseFloat(form.values.partialPayment)) ? 0 : parseFloat(form.values.partialPayment);
      const duePartialPayment = isNaN(parseFloat(form.values.duePartialPayment)) ? 0 : parseFloat(form.values.duePartialPayment);

      const payFees = totalFees - discount - partialPayment + duePartialPayment;
      form.setFieldValue('payFees', payFees?.toFixed(2));
    } else {
      form.setFieldValue('totalFees', 0);

      const discount = isNaN(parseFloat(form.values.discount)) ? 0 : parseFloat(form.values.discount);
      const installment = isNaN(parseFloat(form.values.installment)) ? 0 : parseFloat(form.values.installment);
      const payInstallment = isNaN(parseFloat(form.values.payInstallment)) ? 0 : parseFloat(form.values.payInstallment);
      const partialPayment = isNaN(parseFloat(form.values.partialPayment)) ? 0 : parseFloat(form.values.partialPayment);
      const duePartialPayment = isNaN(parseFloat(form.values.duePartialPayment)) ? 0 : parseFloat(form.values.duePartialPayment);

      const payFees = ((0 - discount) / installment) * payInstallment + duePartialPayment - partialPayment;
      form.setFieldValue('payFees', payFees?.toFixed(2));
    }
  };

  const handleDiscountChange = (e, form) => {
    if (Number(form.values.totalFees) >= Number(e.target.value)) {
      form.setFieldValue('discount', e.target.value);
      if (form.values.paymentType === 'installment') {
        form.setFieldValue(
          'payFees',
          (((Number(form.values.totalFees) - Number(e.target.value)) / Number(form.values.installment)) *
            Number(form.values.payInstallment) -
            Number(form.values.partialPayment))?.toFixed(2)
        );
      } else {
        form.setFieldValue('payFees', (form.values.totalFees - e.target.value - Number(form.values.partialPayment))?.toFixed(2));
      }
    }
  };
  const handleRefundAmountChange = (e, form) => {
    if (Number(form.values.payFees) >= Number(e.target.value)) {
      form.setFieldValue('refundAmount', e.target.value);
    }
  };
  const handleInstallmentChange = (e, form) => {
    if (selectedCourse?.courseDuration >= Number(e.target.value)) {
      form.setFieldValue('installment', e.target.value);
      if (form.values.paymentType === 'installment') {
        form.setFieldValue(
          'payFees',
          (((Number(form.values.totalFees) - Number(form.values.discount)) / Number(e.target.value)) * Number(form.values.payInstallment) -
            Number(form.values.partialPayment))?.toFixed(2)
        );
      } else {
        form.setFieldValue('payFees', ((Number(form.values.totalFees) - Number(form.values.discount)) - Number(e.target.value) - Number(form.values.partialPayment))?.toFixed(2));
      }
    }
  };

  const handlePayInstallmentChange = (e, form) => {
    if (Number(e.target.value) <= Number(form.values.installment)) {
      form.setFieldValue('payInstallment', e.target.value);
      if (form.values.paymentType === 'installment') {
        form.setFieldValue(
          'payFees',
          (((Number(form.values.totalFees) - Number(form.values.discount)) / Number(form.values.installment)) * Number(e.target.value) -
            Number(form.values.partialPayment))?.toFixed(2)
        );
      } else {
        form.setFieldValue('payFees', ((Number(form.values.totalFees) - Number(form.values.discount)) - Number(e.target.value))?.toFixed(2));
      }
    }
  };
  const handlePartialPaymentChange = (e, form) => {
    if (form.values.paymentType == 'fullFees') {
      if (form.values.totalFees > Number(e.target.value)) {
        form.setFieldValue(e.target.name, e.target.value);
        if (form.values.paymentType === 'installment') {
          form.setFieldValue(
            'payFees',
            (((Number(form.values.totalFees) - Number(form.values.discount)) / Number(form.values.installment)) *
              Number(form.values.payInstallment) -
              Number(e.target.value))?.toFixed(2)
          );
        } else {
          form.setFieldValue('payFees', ((Number(form.values.totalFees) - Number(form.values.discount)) - Number(e.target.value))?.toFixed(2));
        }
      }
    } else if (
      ((Number(form.values.totalFees) - Number(form.values.discount)) / Number(form.values.installment)) *
      Number(form.values.payInstallment) >=
      Number(e.target.value)
    ) {
      form.setFieldValue(e.target.name, e.target.value);
      if (form.values.paymentType === 'installment') {
        form.setFieldValue(
          'payFees',
          (((Number(form.values.totalFees) - Number(form.values.discount)) / Number(form.values.installment)) *
            Number(form.values.payInstallment) -
            Number(e.target.value))?.toFixed(2)
        );
      } else {
        form.setFieldValue('payFees', ((Number(form.values.totalFees) - Number(form.values.discount)) - Number(e.target.value))?.toFixed(2));
      }
    }
  };
  const handlePartialPayment = (e, form) => {
    if (
      e.target.value <=
      selected?.selectData?.user?.partialPayment + form?.values?.duePendingInstallment * selected?.selectData?.user?.installmentAmount
    ) {
      form.setFieldValue(e.target.name, e.target.value);
      form.setFieldValue(
        'payInstallmentFees',
        (selected?.selectData?.user?.partialPayment +
          form?.values?.duePendingInstallment * selected?.selectData?.user?.installmentAmount -
          e.target.value)?.toFixed(2)
      );
    }
  };

  const handleDuePendingInstallment = (e, form) => {
    if (e.target.value <= form?.values?.totalPendingInstallment) {
      form.setFieldValue(e.target.name, e.target.value);
      form.setFieldValue(
        'payInstallmentFees',
        (selected?.selectData?.user?.partialPayment +
          e.target.value * selected?.selectData?.user?.installmentAmount -
          form?.values?.partialPayment)?.toFixed(2)
      );
    }
  };

  const handlePartialPaymentModelChange = (e, form) => {
    if (form.values.duePartialPayment >= Number(e.target.value)) {
      form.setFieldValue(e.target.name, e.target.value);
    }
  };

  const handleFeesChange = (e, form) => {
    const { name, checked } = e.target;
    form.setFieldValue('paymentType', name);
    if (name === 'fullFees') {
      form.setFieldValue('payFees', (form.values.totalFees - form.values.discount - form.values.partialPayment)?.toFixed(2));
    } else {
      const totalFees = isNaN(parseFloat(form.values.totalFees)) ? 0 : parseFloat(form.values.totalFees);
      const installment = isNaN(parseFloat(form.values.installment)) ? 0 : parseFloat(form.values.installment);
      const payInstallment = isNaN(parseFloat(form.values.payInstallment)) ? 0 : parseFloat(form.values.payInstallment);
      const partialPayment = isNaN(parseFloat(form.values.partialPayment)) ? 0 : parseFloat(form.values.partialPayment);
      const discount = isNaN(parseFloat(form.values.discount)) ? 0 : parseFloat(form.values.discount);
      form.setFieldValue('payFees', (((totalFees - discount) / installment) * payInstallment - partialPayment)?.toFixed(2));
    }
  };

  function formatDate(inputDate) {
    try {
      // Check if inputDate is an array
      if (Array.isArray(inputDate)) {
        // Map over each date string in the array and format it
        return inputDate.map(dateStr => {
          var dateComponents = dateStr?.split('/');
          var day = dateComponents[0];
          var month = dateComponents[1];
          var year = dateComponents[2];

          var formattedDate = new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];

          return formattedDate;
        });
      } else {
        // If inputDate is not an array, treat it as a single date string
        var dateComponents = inputDate?.split('/');
        var day = dateComponents[0];
        var month = dateComponents[1];
        var year = dateComponents[2];

        var formattedDate = new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];

        return formattedDate;
      }
    } catch {
    }
  }

  const initialValues = {
    name: selected?.isEdit ? selected?.selectData?.user?.name : rowData?.name,
    course: selected?.isEdit ? selected?.selectData?.user?.course : '',
    totalFees: selected?.isEdit ? selected?.selectData?.user?.totalFees : '',
    paymentType: selected?.isEdit ? selected?.selectData?.user?.paymentType : '',
    installment: selected?.isEdit ? selected?.selectData?.user?.installment : '',
    installmentDate:
      selected?.isEdit && selected?.selectData?.user?.installmentDate ? formatDate(selected?.selectData?.user?.installmentDate) : '',
    discount: selected?.isEdit ? selected?.selectData?.user?.discount : '',
    payFees: selected?.isEdit ? selected?.selectData?.user?.payFees?.toFixed(2) : '',
    partialPayment: selected?.isEdit ? selected?.selectData?.user?.partialPayment?.toFixed(2) : 0,
    payInstallment: selected?.isEdit ? selected?.selectData?.user?.payInstallment : '',
    studentGst: selected?.isEdit ? selected?.selectData?.user?.studentGst : rowData?.studentGst,
    paymentMethod:
      selected?.isEdit && selected?.modelData?.page != 'partialPayment' ? selected?.selectData?.user?.paymentMethod?.[0] || '' : '',
    paymentReceiver: localStorage.getItem('name'),
    paymentDetails: '',
    enquireBranch: selected?.isEdit ? selected?.selectData?.user?.enquireBranch : rowData?.branch,
    tokenId: selected?.isEdit ? selected?.selectData?.user?.tokenId : rowData?.tokenId,
    enquireType: selected?.isEdit ? selected?.selectData?.user?.enquireType : type,
    enquireDate: selected?.isEdit ? selected?.selectData?.user?.enquireDate : rowData?.enquireDate
  };

  if (modelData?.page == 'partialPayment') {
    initialValues.duePartialPayment = selected?.isEdit ? selected?.selectData?.user?.partialPayment?.toFixed(2) : 0;
  }

  const validationSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Too Short!').required('Name is required'),
    course: Yup.string().required('Course is required'),
    totalFees: Yup.string().required('Total Fees is required'),
    paymentType: Yup.string().required('Payment Type is required'),
    installmentDate: Yup.string().required('Installment Date is required'),
    paymentMethod: Yup.string().required('Payment Method Type is required')
  });
  const validationSchemaAdvance = Yup.object().shape({
    name: Yup.string().min(2, 'Too Short!').required('Name is required'),
    course: Yup.string().required('Course is required'),
    totalFees: Yup.string().required('Total Fees is required'),
    paymentType: Yup.string().required('Payment Type is required'),
    installmentDate: Yup.string().required('Installment Date is required'),
    paymentMethod: Yup.string().required('Payment Method Type is required'),
    duePendingInstallment: Yup.string().required('Due Pending Installment Type is required'),
  });
  const initialSettleValues = {
    name: selected?.isEdit ? selected?.selectData?.user?.name : rowData?.name,
    course: selected?.isEdit ? selected?.selectData?.user?.course : '',
    totalFees: selected?.isEdit ? selected?.selectData?.user?.totalFees : '',
    payFees: selected?.isEdit ? selected?.selectData?.user?.payFees?.toFixed(2) : '',
    refundAmount: ''
  };

  const validationSettleSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Too Short!').required('Name is required'),
    course: Yup.string().required('Course is required'),
    totalFees: Yup.string().required('Total Fees is required'),
    payFees: Yup.string().required('Pay Fees is required'),
    refundAmount: Yup.string().required('Refund Amount is required')
  });

  const initialPaymentReminderValues = {
    name: selected?.isEdit ? selected?.selectData?.user?.name : rowData?.name,
    course: selected?.isEdit ? selected?.selectData?.user?.course : rowData?.course,
    reminderDate: '',
  };

  const validationPaymentReminderSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Too Short!').required('Name is required'),
    course: Yup.string().required('Course is required'),
    reminderDate: Yup.string().required('Payment Reminder Date is required'),
  });

  const handleInputChange = (e, row) => {
    setBtnDisable(true);
    try {
      setRowData(row?.user);
      if (e.target.value === 'enroll') {
        setIsPaymentDialogOpen(true);
        dispatch(selectData(row));
        setBtnDisable(false); // Enable buttons after API call completes (success or failure)
      } else if (e.target.value === 'partialPayment') {
        setIspartialPaymentOpen(true);
        dispatch(selectData(row));
        setBtnDisable(false); // Enable buttons after API call completes (success or failure)
      } else if (e.target.value === 'demo') {
        const apiUrl = `${process.env.REACT_APP_HOST}/api/enroll/demoEnrollDetail`;
        const body = {
          tokenId: row?.user?.tokenId,
          demoDate: new Date().toISOString()
        };
        const headers = {};

        postApi(apiUrl, body, headers)
          .then(async (response) => {
            let statusApiUrl = '';
            try {
              if (selected?.modelData?.page == 'ImmigrationReport') {
                statusApiUrl = '/api/immigration/editStatusImmigration';
              } else if (selected?.modelData?.page == 'CompetitiveExamReport') {
                statusApiUrl = '/api/competitiveExam/editStatusCompetitiveExam';
              } else if (selected?.modelData?.page == 'ItCoursesReport') {
                statusApiUrl = '/api/itCourses/editStatusItCourses';
              } else {
                statusApiUrl = '/api/immigration/editStatusImmigration';
              }
              const apiUrl = `${process.env.REACT_APP_HOST}${statusApiUrl}/${row?.user?.tokenId}`;
              const body = {
                status: e.target.value
              };
              const headers = {};
              putApi(apiUrl, body, headers)
                .then(async (response) => {
                  toast.success(response?.message || 'New Data ADD successful!');
                  setIsFetch(true);
                  setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                })
                .catch((error) => {
                  toast.error(error?.message || 'Please Try After Sometime');
                  setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                });
            } catch (error) {
              toast.error(error?.message || 'Please Try After Sometime');
              setBtnDisable(false); // Enable buttons after API call completes (success or failure)
            }
          })
          .catch((error) => {
            toast.error(error?.message || 'Please Try After Sometime');
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
          });
      } else {
        let statusApiUrl = '';
        try {
          if (selected?.modelData?.page == 'ImmigrationReport') {
            statusApiUrl = '/api/immigration/editStatusImmigration';
          } else if (selected?.modelData?.page == 'CompetitiveExamReport') {
            statusApiUrl = '/api/competitiveExam/editStatusCompetitiveExam';
          } else if (selected?.modelData?.page == 'ItCoursesReport') {
            statusApiUrl = '/api/itCourses/editStatusItCourses';
          } else {
            statusApiUrl = '/api/immigration/editStatusImmigration';
          }
          const apiUrl = `${process.env.REACT_APP_HOST}${statusApiUrl}/${row?.user?.tokenId}`;
          const body = {
            status: e.target.value
          };
          const headers = {};

          putApi(apiUrl, body, headers)
            .then(async (response) => {
              toast.success(response?.message || 'New Data ADD successful!');
              setIsFetch(true);
              setBtnDisable(false); // Enable buttons after API call completes (success or failure)
            })
            .catch((error) => {
              toast.error(error?.message || 'Please Try After Sometime');
              setBtnDisable(false); // Enable buttons after API call completes (success or failure)
            });
        } catch (error) {
          toast.error(error?.message || 'Please Try After Sometime');
          setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
      setBtnDisable(false); // Enable buttons after API call completes (success or failure)
    }
  };

  const handlePaymentDialogClose = () => {
    setSettlePaymentData([]);
    setIsAdvancePaymentDialogOpen(false);
    setIsPaymentDialogOpen(false);
    setIsPaymentReminderDialogOpen(false);
    setIsSettleDialogOpen(false);
    setIspartialPaymentOpen(false);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setBtnDisable(true);
    try {
      const date = new Date(values?.installmentDate);
      const formattedDate = date.toISOString().split('T')[0];

      const formattedValues = {
        ...values,
        installmentDate: formattedDate,
        dob: rowData?.dob,
        email: rowData?.email,
        mobileNumber: rowData?.mobileNumber
      };
      if (selected?.isEdit) {
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

          formattedValues.file = base64data;
          formattedValues.fileName = fileName;
          putApi(`${process.env.REACT_APP_HOST}/api/enroll/editEnroll/${selected.selectData.user.tokenId}`, formattedValues)
            .then(async (response) => {
              toast.success(response?.message || 'New Data ADD successful!');
              dispatch(modelEdit(false));
              dispatch(modelDelete(false));
              handleDialogClose();
              setIsFetch(true);
              setIsAdvancePaymentDialogOpen(false);
              setIsPaymentDialogOpen(false);
              setIspartialPaymentOpen(false);
              setIsPaymentDialogOpen(false);
              setSubmitting(false);
              resetForm();
              conterNumber();
              setBtnDisable(false); // Enable buttons after API call completes (success or failure)
            })
            .catch((error) => {
              setBtnDisable(false); // Enable buttons after API call completes (success or failure)
              toast.error(error?.message || 'Please Try After Sometime');
            });
        }
      } else {
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

          // Now you can pass base64data to your API
          formattedValues.enrollDate = new Date();
          // console.log('base64data', base64data);
          formattedValues.file = base64data;
          formattedValues.fileName = fileName;

          postApi(`${process.env.REACT_APP_HOST}/api/enroll/createEnroll`, formattedValues)
            .then(async (response) => {
              toast.success(response?.message || 'New Data ADD successful!');
              dispatch(modelEdit(false));
              dispatch(modelDelete(false));
              handleDialogClose();
              setBtnDisable(false); // Enable buttons after API call completes (success or failure)
              try {
                let statusApiUrl = '';
                if (selected?.modelData?.page == 'ImmigrationReport') {
                  statusApiUrl = '/api/immigration/editStatusImmigration';
                } else if (selected?.modelData?.page == 'CompetitiveExamReport') {
                  statusApiUrl = '/api/competitiveExam/editStatusCompetitiveExam';
                } else if (selected?.modelData?.page == 'ItCoursesReport') {
                  statusApiUrl = '/api/itCourses/editStatusItCourses';
                } else {
                  statusApiUrl = '/api/immigration/editStatusImmigration';
                }
                const apiUrl = `${process.env.REACT_APP_HOST}${statusApiUrl}/${values?.tokenId}`;
                const body = {
                  status: 'enroll',
                  tokenId: rowData.tokenId
                };
                const headers = {};

                putApi(apiUrl, body, headers)
                  .then(async (response) => {
                    toast.success(response?.message || 'New Data ADD successful!');
                    setIsFetch(true);
                    setSubmitting(false);
                    resetForm();
                    setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                    conterNumber();
                    setIsPaymentDialogOpen(false);
                  })
                  .catch((error) => {
                    setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                    toast.error(error?.message || 'Please Try After Sometime');
                  });
              } catch (error) {
                setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                toast.error(error?.message || 'Please Try After Sometime');
              }
            })
            .catch((error) => {
              toast.error(error?.message || 'Please Try After Sometime');
              setBtnDisable(false); // Enable buttons after API call completes (success or failure)
            });
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
      setBtnDisable(false); // Enable buttons after API call completes (success or failure)
    }
  };
  const handlepayPartialPaymentSubmit = async (values, { setSubmitting, resetForm }) => {
    setBtnDisable(true);
    const formattedValues = { ...values, dob: rowData?.dob, email: rowData?.email, mobileNumber: rowData?.mobileNumber };
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
      formattedValues.file = base64data;
      formattedValues.fileName = fileName;
      try {
        postApi(`${process.env.REACT_APP_HOST}/api/enroll/partial-payment`, {
          ...formattedValues,
          enrollDate: new Date(),
          tokenId: selected?.selectData?.user?.tokenId,
          installmentAmount: selected?.selectData?.user?.installmentAmount
        })
          .then(async (response) => {
            toast.success(response?.message || 'New Data ADD successful!');
            dispatch(modelEdit(false));
            dispatch(modelDelete(false));
            setIsFetch(true);
            handleDialogClose();
            setIsSettleDialogOpen(false);
            setIspartialPaymentOpen(false);
            setSubmitting(false);
            conterNumber();
            resetForm();
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
          })
          .catch((error) => {
            toast.error(error?.message || 'Please Try After Sometime');
            setIsSettleDialogOpen(false);
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
          });
      } catch (error) {
        toast.error('Something went wrong. Please try again later.');
        setBtnDisable(false); // Enable buttons after API call completes (success or failure)
      }
    }
  };
  const handlePaymentReminderSubmit = (values, { setSubmitting, resetForm }) => {
    setBtnDisable(true);
    try {
      let date = new Date(values?.reminderDate).toISOString();
      postApi(`${process.env.REACT_APP_HOST}/api/remainder/createReminder`, {
        ...values,
        reminderDate: date,
        tokenId: selected?.selectData?.user?.tokenId,
        enquireBranch: selected?.selectData?.user?.enquireBranch
      })
        .then(async (response) => {
          toast.success(response?.message || 'New Data ADD successful!');
          dispatch(modelEdit(false));
          dispatch(modelDelete(false));
          setIsFetch(true);
          handleDialogClose();
          setIsPaymentReminderDialogOpen(false);
          setSubmitting(false);
          resetForm();
          setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        })
        .catch((error) => {
          toast.error(error?.message || 'Please Try After Sometime');
          setIsPaymentReminderDialogOpen(false);
          setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        });
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
      setBtnDisable(false); // Enable buttons after API call completes (success or failure)
    }
  };
  const handleAdvanceaymentSubmit = async (values, { setSubmitting, resetForm }) => {
    setBtnDisable(true);
    const formattedValues = { ...values, dob: rowData?.dob, email: rowData?.email, mobileNumber: rowData?.mobileNumber };
    try {
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10);
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
        formattedValues.file = base64data;
        formattedValues.fileName = fileName;
        putApi(`${process.env.REACT_APP_HOST}/api/enroll/pay-installments/${selected?.selectData?.user?.tokenId}`, {
          ...formattedValues,
          tokenId: selected?.selectData?.user?.tokenId,
          installmentDate: formattedDate,
          dob: selected?.selectData?.user?.dob,
          email: selected?.selectData?.user?.email,
          mobileNumber: selected?.selectData?.user?.mobileNumber,
          enquireDate: selected?.selectData?.user?.enquireDate,
          payFeesDate: new Date().toISOString().slice(0, 10)
        })
          .then(async (response) => {
            toast.success(response?.message || 'New Data ADD successful!');
            dispatch(modelEdit(false));
            dispatch(modelDelete(false));
            setIsFetch(true);
            handleDialogClose();
            setIsSettleDialogOpen(false);
            setSubmitting(false);
            conterNumber();
            handlePaymentDialogClose();
            resetForm();
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
          })
          .catch((error) => {
            toast.error(error?.message || 'Please Try After Sometime');
            setIsSettleDialogOpen(false);
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
          });
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
      setBtnDisable(false); // Enable buttons after API call completes (success or failure)
    }
  };
  const handleSettleSubmit = (values, { setSubmitting, resetForm }) => {
    setBtnDisable(true);
    try {
      postApi(`${process.env.REACT_APP_HOST}/api/enroll/settle-enroll`, {
        ...values,
        token: selected?.selectData?.user?.tokenId,
        paymentReceiver: localStorage.getItem('name')
      })
        .then(async (response) => {
          toast.success(response?.message || 'New Data ADD successful!');
          dispatch(modelEdit(false));
          dispatch(modelDelete(false));
          setIsFetch(true);
          handleDialogClose();
          setIsSettleDialogOpen(false);
          setSubmitting(false);
          conterNumber();
          resetForm();
          setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        })
        .catch((error) => {
          toast.error(error?.message || 'Please Try After Sometime');
          setIsSettleDialogOpen(false);
          setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        });
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
      setBtnDisable(false); // Enable buttons after API call completes (success or failure)
    }
  };

  const handlePrint = (data) => {
    // Check if payment method is UPI or Bank Transfer
    if (data?.paymentMethod === 'UPI' || data?.paymentMethod === 'Bank Transfer') {
      // Check if payment details are provided
      if (data?.paymentDetails !== '') {
        // Validate data
        validationSchema
          .validate(data, { abortEarly: false })
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
      validationSchema
        .validate(data, { abortEarly: false })
        .then(() => {
          // Generate PDF
          generatePDF(data);
        })
        .catch(() => {
          // Handle validation errors
          toast?.error('Please check required fields');
        });
    }
  };
  const generatePDF = (data) => {
    const invoice = document.getElementById('invoice');
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

    pdfExporter
      .toPdf()
      .get('pdf')
      .then(function (pdf) {
        pdf.save(fileName);
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
  };


  return (
    <>
      <Card overflowX={{ sm: 'scroll', xl: 'hidden' }} pb="0px" className="common-table" sx={{ width: '100%' }}>
        <Box p="21px 0px 21px 5px" display="flex" justifyContent="space-between" flexDirection={{ sm: 'column', md: 'row' }}>
          <Typography fontSize="1.25rem" fontWeight="600" paddingLeft="10px">
            {tableTitle}
          </Typography>
        </Box>
        <CardBody>
          <DataTable
            columns={columns}
            data={tableData}
            progressPending={isLoading}
            pagination={isPagination}
            highlightOnHover
            pointerOnHover
            responsive={true}
            customStyles={customStyles}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            conditionalRowStyles={conditionalRowStyles}
            fixedHeader={true}
            fixedHeaderScrollHeight={"560px"}
          />
        </CardBody>
      </Card>
      <Dialog open={isDeleteOpen} onClose={handleDialogClose}>
        <DialogContent
          sx={{
            width: '500px',
            margin: 'auto',
            '@media (max-width: 600px)': {
              width: '80vw'
            }
          }}
        >
          <Typography>
            {modelData?.page === 'ProcessOrder' && isProcessButton
              ? 'Are you sure this order is Completed ?'
              : 'Are you sure you want to delete ?'}
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
      <CommonModal isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} url={url} setIsFetch={setIsFetch} />
      <Box>
        <Dialog open={isPaymentDialogOpen} onClose={handlePaymentDialogClose}>
          <DialogTitle>Payment Model</DialogTitle>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize={true}>
            {(values) => (
              <Form>
                <DialogContent
                  sx={{
                    width: '500px',
                    margin: 'auto',
                    '@media (max-width: 600px)': {
                      width: '80vw'
                    }
                  }}
                >
                  <Box display="flex" flexWrap="wrap" gap="10px">
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="name"
                        render={({ field, form }) => (
                          <InputField name="name" label="name" placeholder="name" form={form} field={field} type="text" disabled={true} />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="status"
                        render={({ field, form }) => (
                          <CustomSelectComponent
                            name="course"
                            label="Select Course"
                            placeholder={`Enter Course`}
                            form={form}
                            field={field}
                            options={course}
                            handleInputChange={(e) => {
                              handleGetFees(e, form);
                            }}
                            isManual={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="totalFees"
                        render={({ field, form }) => (
                          <InputField
                            name="totalFees"
                            label="Total Fees"
                            placeholder="Total Fees"
                            form={form}
                            field={field}
                            type="text"
                            disabled={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="paymentType"
                        render={({ form }) => (
                          <InputRadioGroup
                            name="paymentType"
                            form={form}
                            label="payment Type"
                            isManual={true}
                            handleInputChange={(e) => {
                              handleFeesChange(e, form);
                            }}
                            options={[
                              { value: 'fullFees', label: 'Full Fees' },
                              { value: 'installment', label: 'installment' }
                            ]}
                          />
                        )}
                      />
                    </Box>

                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="discount"
                        render={({ field, form }) => (
                          <InputField
                            name="discount"
                            label="Discount"
                            placeholder="Enter Discount"
                            form={form}
                            field={field}
                            type="number"
                            isManual={true}
                            handleInputChange={(e) => {
                              handleDiscountChange(e, form);
                            }}
                          />
                        )}
                      />
                    </Box>
                    {values?.values?.paymentType == 'installment' && (
                      <Box
                        sx={{
                          width: '100%',
                          marginRight: '0px',
                          '@media (min-width: 600px)': {
                            width: '47%',
                            marginRight: '4px'
                          },
                          '@media (min-width: 960px)': {
                            width: '47%',
                            marginRight: '4.5px'
                          },
                          '@media (min-width: 1280px)': {
                            width: '47%',
                            marginRight: '5px'
                          },
                          '@media (min-width: 1536px)': {
                            width: '47%',
                            marginRight: '5px'
                          }
                        }}
                      >
                        <Field
                          name="installment"
                          render={({ field, form }) => (
                            <InputField
                              name="installment"
                              label="Installment"
                              placeholder="Installment"
                              form={form}
                              field={field}
                              type="number"
                              isManual={true}
                              handleInputChange={(e) => {
                                handleInstallmentChange(e, form);
                              }}
                            />
                          )}
                        />
                      </Box>
                    )}
                    {values?.values?.paymentType == 'installment' && (
                      <Box
                        sx={{
                          width: '100%',
                          marginRight: '0px',
                          '@media (min-width: 600px)': {
                            width: '47%',
                            marginRight: '4px'
                          },
                          '@media (min-width: 960px)': {
                            width: '47%',
                            marginRight: '4.5px'
                          },
                          '@media (min-width: 1280px)': {
                            width: '47%',
                            marginRight: '5px'
                          },
                          '@media (min-width: 1536px)': {
                            width: '47%',
                            marginRight: '5px'
                          }
                        }}
                      >
                        <Field
                          name="payInstallment"
                          render={({ field, form }) => (
                            <InputField
                              name="payInstallment"
                              label="Pay Installment"
                              placeholder="Enter Pay Installment"
                              form={form}
                              field={field}
                              type="number"
                              isManual={true}
                              handleInputChange={(e) => {
                                handlePayInstallmentChange(e, form);
                              }}
                            />
                          )}
                        />
                      </Box>
                    )}
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="partialPayment"
                        render={({ field, form }) => (
                          <InputField
                            name="partialPayment"
                            label="Partial Payment"
                            placeholder="Enter Partial Payment"
                            form={form}
                            field={field}
                            type="number"
                            isManual={true}
                            handleInputChange={(e) => {
                              handlePartialPaymentChange(e, form);
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="payFees"
                        render={({ field, form }) => (
                          <InputField
                            name="payFees"
                            label="Pay Fees"
                            placeholder="Enter Pay Fees"
                            form={form}
                            field={field}
                            type="number"
                            disabled={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="paymentMethod"
                        render={({ field, form }) => (
                          <CustomSelectComponent
                            name="paymentMethod"
                            label="Select Payment Method"
                            placeholder={`Enter Payment Method`}
                            form={form}
                            field={field}
                            options={[
                              {
                                label: 'Cash',
                                value: 'Cash'
                              },
                              {
                                label: 'UPI',
                                value: 'UPI'
                              },
                              {
                                label: 'Bank Transfer',
                                value: 'Bank Transfer'
                              }
                            ]}
                          />
                        )}
                      />
                    </Box>
                    {(values?.values?.paymentMethod == 'UPI' || values?.values?.paymentMethod == 'Bank Transfer') && (
                      <Box
                        sx={{
                          width: '100%',
                          marginRight: '0px',
                          '@media (min-width: 600px)': {
                            width: '47%',
                            marginRight: '4px'
                          },
                          '@media (min-width: 960px)': {
                            width: '47%',
                            marginRight: '4.5px'
                          },
                          '@media (min-width: 1280px)': {
                            width: '47%',
                            marginRight: '5px'
                          },
                          '@media (min-width: 1536px)': {
                            width: '47%',
                            marginRight: '5px'
                          }
                        }}
                      >
                        <Field
                          name="paymentDetails"
                          render={({ field, form }) => (
                            <InputField
                              name="paymentDetails"
                              label="Payment Details"
                              placeholder={`Enter ${values?.values?.paymentMethod == 'UPI' ? 'Transactions ID' : 'Check Number'}`}
                              form={form}
                              field={field}
                            />
                          )}
                        />
                      </Box>
                    )}
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="installmentDate"
                        render={({ form }) => (
                          <InputDateField
                            name="installmentDate"
                            placeholder="Enter Installment Date"
                            form={form}
                            type="date"
                            valueDate={form?.values?.installmentDate}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="studentGst"
                        render={({ form }) => (
                          <Field
                            name='studentGst'
                            render={({ field, form }) => (
                              <InputField
                                name="studentGst"
                                label="Enter Student GST"
                                placeholder="Enter Student GST"
                                form={form}
                                field={field}
                                type='text'
                              />
                            )}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </DialogContent>
                <div className="col-md-12" style={{ display: 'none' }}>
                  <div id="invoice">
                    <div className="container">
                      <div className="row">
                        <div className="receipt-header">
                          <div
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginButtom: '10px',
                              height: '80px',
                              alignItems: 'center',
                              display: 'flex'
                            }}
                          >
                            <div
                              style={{
                                width: '120px',
                                height: '100%'
                              }}
                            >
                              <img style={{ width: '100%', height: '100%' }} src={Logo} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                  <div className="sun-text">
                                    <img style={{ width: '100%', height: '100%' }} src={SunLogo} />
                                  </div>
                                </div>
                                <div className="nav-details">
                                  <div className="nav-detail">
                                    <div className="nav-title" style={{ width: '100px' }}>
                                      Receipt No :
                                    </div>
                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>
                                      {isCounterNumber?.paymentNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                <div className="nav-detail">
                                  <div className="nav-title">Mobile No:</div>
                                  <div className="nav-data">
                                    {isBranch === 'Sita Nagar'
                                      ? '+91 99252 53632'
                                      : isBranch === 'ABC, Mota Varachha'
                                        ? '+91 99786 26333'
                                        : ' +91 99796 86333'}
                                  </div>
                                </div>
                                <div className="nav-detail">
                                  <div className="nav-title" style={{ width: '61px' }}>
                                    Email Id:
                                  </div>
                                  <div className="nav-data" style={{ fontSize: '.75rem' }}>
                                    sunriseinstitute.tech@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divider-form"></div>
                      <div style={{ marginBottom: '5px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Fee Receipt</h2>
                      </div>
                      <div className="row">
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <p
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '15px',
                                  margin: '1px 0',
                                  fontWeight: '500',
                                  fontSize: '16px'
                                }}
                              >
                                <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4>
                                <div className="border-line-fileds"> {values?.values?.name}</div>
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4>
                                  <div className="border-line-fileds mr-6p">{selectedCourse?.courseName}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4>
                                  <div className="border-line-fileds">{selectedCourse?.courseDuration} Months</div>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '16px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}>
                                  <h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4>
                                  <div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div>
                                </p>
                                {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && (
                                  <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}>
                                    <h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                                      {values?.values?.paymentMethod === 'UPI'
                                        ? 'Transactions ID :'
                                        : values?.values?.paymentMethod === 'Bank Transfer'
                                          ? 'Check No :'
                                          : 'Cash'}{' '}
                                    </h4>
                                    <div className="border-line-fileds">{values?.values?.paymentDetails}</div>
                                  </p>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4>
                                  <div className="border-line-fileds mr-6p">{name}</div>
                                </p>
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
                                  <strong>Total Amount: </strong>
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
                                  <strong>
                                    <i className="fa fa-inr"></i>
                                    {((!isNaN(parseFloat(selectedCourse?.fees)) ? parseFloat(selectedCourse?.fees) : 0) -
                                      (!isNaN(parseFloat(values?.values?.discount)) ? parseFloat(values?.values?.discount) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.payFees)) ? parseFloat(values?.values?.payFees) : 0)?.toFixed(2)}/-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {((!isNaN(parseFloat(selectedCourse?.fees)) ? parseFloat(selectedCourse?.fees) : 0) -
                                      (!isNaN(parseFloat(values?.values?.discount)) ? parseFloat(values?.values?.discount) : 0) -
                                      (!isNaN(parseFloat(values?.values?.payFees)) ? parseFloat(values?.values?.payFees) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
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
                        <div className="footer-divider-form"></div>
                        <div className="branch-address">
                          {isBranch === 'Sita Nagar'
                            ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat'
                            : isBranch === 'ABC, Mota Varachha'
                              ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat'
                              : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
                        </div>
                      </div>
                    </div>
                    <div className="container">
                      <div className="row">
                        <div className="receipt-header">
                          <div
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginButtom: '10px',
                              height: '80px',
                              alignItems: 'center',
                              display: 'flex'
                            }}
                          >
                            <div
                              style={{
                                width: '120px',
                                height: '100%'
                              }}
                            >
                              <img style={{ width: '100%', height: '100%' }} src={Logo} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                  <div className="sun-text">
                                    <img style={{ width: '100%', height: '100%' }} src={SunLogo} />
                                  </div>
                                </div>
                                <div className="nav-details">
                                  <div className="nav-detail">
                                    <div className="nav-title" style={{ width: '100px' }}>
                                      Receipt No :
                                    </div>
                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>
                                      {isCounterNumber?.paymentNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                <div className="nav-detail">
                                  <div className="nav-title">Mobile No:</div>
                                  <div className="nav-data">
                                    {isBranch === 'Sita Nagar'
                                      ? '+91 99252 53632'
                                      : isBranch === 'ABC, Mota Varachha'
                                        ? '+91 99786 26333'
                                        : ' +91 99796 86333'}
                                  </div>
                                </div>
                                <div className="nav-detail">
                                  <div className="nav-title" style={{ width: '61px' }}>
                                    Email Id:
                                  </div>
                                  <div className="nav-data" style={{ fontSize: '.75rem' }}>
                                    sunriseinstitute.tech@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divider-form"></div>
                      <div style={{ marginBottom: '5px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Fee Receipt</h2>
                      </div>
                      <div className="row">
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <p
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '15px',
                                  margin: '1px 0',
                                  fontWeight: '500',
                                  fontSize: '16px'
                                }}
                              >
                                <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4>
                                <div className="border-line-fileds"> {values?.values?.name}</div>
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4>
                                  <div className="border-line-fileds mr-6p">{selectedCourse?.courseName}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4>
                                  <div className="border-line-fileds">{selectedCourse?.courseDuration} Months</div>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '16px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}>
                                  <h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4>
                                  <div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div>
                                </p>
                                {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && (
                                  <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}>
                                    <h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                                      {values?.values?.paymentMethod === 'UPI'
                                        ? 'Transactions ID :'
                                        : values?.values?.paymentMethod === 'Bank Transfer'
                                          ? 'Check No :'
                                          : 'Cash'}{' '}
                                    </h4>
                                    <div className="border-line-fileds">{values?.values?.paymentDetails}</div>
                                  </p>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4>
                                  <div className="border-line-fileds mr-6p">{name}</div>
                                </p>
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
                                  <strong>Total Amount: </strong>
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
                                  <strong>
                                    <i className="fa fa-inr"></i>
                                    {((!isNaN(parseFloat(selectedCourse?.fees)) ? parseFloat(selectedCourse?.fees) : 0) -
                                      (!isNaN(parseFloat(values?.values?.discount)) ? parseFloat(values?.values?.discount) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.payFees)) ? parseFloat(values?.values?.payFees) : 0)?.toFixed(2)}/-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {((!isNaN(parseFloat(selectedCourse?.fees)) ? parseFloat(selectedCourse?.fees) : 0) -
                                      (!isNaN(parseFloat(values?.values?.discount)) ? parseFloat(values?.values?.discount) : 0) -
                                      (!isNaN(parseFloat(values?.values?.payFees)) ? parseFloat(values?.values?.payFees) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
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
                        <div className="footer-divider-form"></div>
                        <div className="branch-address">
                          {isBranch === 'Sita Nagar'
                            ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat'
                            : isBranch === 'ABC, Mota Varachha'
                              ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat'
                              : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
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
                    <div className="container">
                      <div className="row">
                        <div className="receipt-header">
                          <div
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginButtom: '10px',
                              height: '80px',
                              alignItems: 'center',
                              display: 'flex'
                            }}
                          >
                            <div
                              style={{
                                width: '120px',
                                height: '100%'
                              }}
                            >
                              <img style={{ width: '100%', height: '100%' }} src={Logo} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                  <div className="sun-text">
                                    <img style={{ width: '100%', height: '100%' }} src={SunLogo} />
                                  </div>
                                </div>
                                <div className="nav-details">
                                  <div className="nav-detail">
                                    <div className="nav-title" style={{ width: '100px' }}>
                                      Receipt No :
                                    </div>
                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>
                                      {isCounterNumber?.paymentNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                <div className="nav-detail">
                                  <div className="nav-title">Mobile No:</div>
                                  <div className="nav-data">
                                    {isBranch === 'Sita Nagar'
                                      ? '+91 99252 53632'
                                      : isBranch === 'ABC, Mota Varachha'
                                        ? '+91 99786 26333'
                                        : ' +91 99796 86333'}
                                  </div>
                                </div>
                                <div className="nav-detail">
                                  <div className="nav-title" style={{ width: '61px' }}>
                                    Email Id:
                                  </div>
                                  <div className="nav-data" style={{ fontSize: '.75rem' }}>
                                    sunriseinstitute.tech@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divider-form"></div>
                      <div style={{ marginBottom: '5px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Fee Receipt</h2>
                      </div>
                      <div className="row">
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <p
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '15px',
                                  margin: '1px 0',
                                  fontWeight: '500',
                                  fontSize: '16px'
                                }}
                              >
                                <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4>
                                <div className="border-line-fileds"> {values?.values?.name}</div>
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4>
                                  <div className="border-line-fileds mr-6p">{selectedCourse?.courseName}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4>
                                  <div className="border-line-fileds">{selectedCourse?.courseDuration} Months</div>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '16px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}>
                                  <h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4>
                                  <div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div>
                                </p>
                                {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && (
                                  <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}>
                                    <h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                                      {values?.values?.paymentMethod === 'UPI'
                                        ? 'Transactions ID :'
                                        : values?.values?.paymentMethod === 'Bank Transfer'
                                          ? 'Check No :'
                                          : 'Cash'}{' '}
                                    </h4>
                                    <div className="border-line-fileds">{values?.values?.paymentDetails}</div>
                                  </p>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4>
                                  <div className="border-line-fileds mr-6p">{name}</div>
                                </p>
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
                                  <strong>Total Amount: </strong>
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
                                  <strong>
                                    <i className="fa fa-inr"></i>
                                    {((!isNaN(parseFloat(selectedCourse?.fees)) ? parseFloat(selectedCourse?.fees) : 0) -
                                      (!isNaN(parseFloat(values?.values?.discount)) ? parseFloat(values?.values?.discount) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.payFees)) ? parseFloat(values?.values?.payFees) : 0)?.toFixed(2)}/-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {((!isNaN(parseFloat(selectedCourse?.fees)) ? parseFloat(selectedCourse?.fees) : 0) -
                                      (!isNaN(parseFloat(values?.values?.discount)) ? parseFloat(values?.values?.discount) : 0) -
                                      (!isNaN(parseFloat(values?.values?.payFees)) ? parseFloat(values?.values?.payFees) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
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
                        <div className="footer-divider-form"></div>
                        <div className="branch-address">
                          {isBranch === 'Sita Nagar'
                            ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat'
                            : isBranch === 'ABC, Mota Varachha'
                              ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat'
                              : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogActions>
                  <Button
                    disabled={btnDisable}
                    colorScheme="blue"
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      handlePrint(values?.values);
                    }}
                  >
                    print
                  </Button>
                  <Button colorScheme="blue" type="submit" variant="contained" color="primary" disabled={btnDisable}>
                    submit
                  </Button>
                  <Button
                    disabled={btnDisable}
                    colorScheme="gray"
                    variant="contained"
                    color="secondary"
                    mr={3}
                    onClick={handlePaymentDialogClose}
                  >
                    Close
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>
        <Dialog open={isSettleDialogOpen} onClose={handlePaymentDialogClose}>
          <DialogTitle>Adjust Payment Model</DialogTitle>
          <Formik
            initialValues={initialSettleValues}
            validationSchema={validationSettleSchema}
            onSubmit={handleSettleSubmit}
            enableReinitialize={true}
          >
            {(values) => (
              <Form>
                <DialogContent
                  sx={{
                    width: '500px',
                    margin: 'auto',
                    '@media (max-width: 600px)': {
                      width: '80vw'
                    }
                  }}
                >
                  <Box display="flex" flexWrap="wrap" gap="10px">
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '100%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '100%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '100%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '100%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="name"
                        render={({ field, form }) => (
                          <InputField name="name" label="name" placeholder="name" form={form} field={field} type="text" disabled={true} />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '100%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '100%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '100%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '100%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="status"
                        render={({ field, form }) => (
                          <InputField
                            name="course"
                            label="Select Course"
                            placeholder={`Enter Course`}
                            form={form}
                            field={field}
                            isManual={true}
                            disabled={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '100%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '100%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '100%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '100%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="payFees"
                        render={({ field, form }) => (
                          <InputField
                            name="payFees"
                            label="Pay Fees"
                            placeholder="Pay Fees"
                            form={form}
                            field={field}
                            type="text"
                            disabled={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '100%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '100%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '100%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '100%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="refundAmount"
                        render={({ field, form }) => (
                          <InputField
                            name="refundAmount"
                            label="Enter Refund Amount"
                            placeholder="Enter Refund Amount"
                            form={form}
                            field={field}
                            type="number"
                            isManual={true}
                            handleInputChange={(e) => {
                              handleRefundAmountChange(e, form);
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </DialogContent>
                <div className="col-md-12 receipt-datas" style={{ display: 'none' }}>
                  <div id="invoice" style={{ position: 'relative', height: '100%', width: '100%' }}>
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '800px',
                        height: '500px',
                        backgroundImage: `url(${RefundImage})`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        opacity: 0.1,
                      }}
                    />
                    <div className="container">
                      <div className="row">
                        <div className="receipt-header">
                          <div
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginButtom: '10px',
                              height: '80px',
                              alignItems: 'center',
                              display: 'flex'
                            }}
                          >
                            <div
                              style={{
                                width: '120px',
                                height: '100%'
                              }}
                            >
                              <img style={{ width: '100%', height: '100%' }} src={Logo} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                  <div className="sun-text">
                                    <img style={{ width: '100%', height: '100%' }} src={SunLogo} />
                                  </div>
                                </div>
                                <div className="nav-details">
                                  <div className="nav-detail">
                                    <div className="nav-title" style={{ width: '100px' }}>
                                      Receipt No :
                                    </div>
                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>
                                      {isCounterNumber?.paymentNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                <div className="nav-detail">
                                  <div className="nav-title">Mobile No:</div>
                                  <div className="nav-data">
                                    {isBranch === 'Sita Nagar'
                                      ? '+91 99252 53632'
                                      : isBranch === 'ABC, Mota Varachha'
                                        ? '+91 99786 26333'
                                        : ' +91 99796 86333'}
                                  </div>
                                </div>
                                <div className="nav-detail">
                                  <div className="nav-title" style={{ width: '61px' }}>
                                    Email Id:
                                  </div>
                                  <div className="nav-data" style={{ fontSize: '.75rem' }}>
                                    sunriseinstitute.tech@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divider-form"></div>
                      <div style={{ marginBottom: '12px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Refund Fee Receipt</h2>
                      </div>
                      <div className="row">
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <p
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '15px',
                                  margin: '1px 0',
                                  fontWeight: '500',
                                  fontSize: '16px'
                                }}
                              >
                                <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4>
                                <div className="border-line-fileds"> {values?.values?.name}</div>
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4>
                                  <div className="border-line-fileds mr-6p">{selectedCourse?.courseName}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4>
                                  <div className="border-line-fileds">{selectedCourse?.courseDuration} Months</div>
                                </p>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Enroll Date : </h4>
                                  <div className="border-line-fileds mr-6p">{selected?.selectData?.user?.enrollDate}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Student Branch : </h4>
                                  <div className="border-line-fileds">{selected?.selectData?.user?.enquireBranch}</div>
                                </p>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Refund By : </h4>
                                  <div className="border-line-fileds mr-6p">{name}</div>
                                </p>
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
                                  <strong>Total Fees Amount: </strong>
                                </p>
                                <p>
                                  <strong>Total Paid Amount: </strong>
                                </p>
                                <p>
                                  <strong>Total Pending Amount: </strong>
                                </p>
                                <p>
                                  <strong>Refund Amount: </strong>
                                </p>
                                <p>
                                  <strong>Net Fees Amount: </strong>
                                </p>
                              </td>
                              <td>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>
                                    {((!isNaN(parseFloat(selectedCourse?.fees)) ? parseFloat(selectedCourse?.fees) : 0) -
                                      (!isNaN(parseFloat(values?.values?.discount)) ? parseFloat(values?.values?.discount) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.payFees)) ? parseFloat(values?.values?.payFees) : 0)?.toFixed(2)}/-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(selectedCourse?.totalPendingInstallment)) ? parseFloat(selectedCourse?.totalPendingInstallment) : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.refundAmount)) ? parseFloat(values?.values?.refundAmount) : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {((!isNaN(parseFloat(values?.values?.payFees)) ? parseFloat(values?.values?.payFees) : 0) - (!isNaN(parseFloat(values?.values?.refundAmount)) ? parseFloat(values?.values?.refundAmount) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table className="table table-bordered w-100 receipt_data">
                          <thead>
                            <tr>
                              <th>Receipt No</th>
                              <th>Pay Date</th>
                              <th>Pay Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(settlePaymentData.length > 0) &&
                              settlePaymentData?.map((payItem) => (
                                <tr key={payItem?.paymentSlipNumber}>
                                  <td className="text-right">
                                    <p>
                                      <strong>{payItem?.paymentSlipNumber}</strong>
                                    </p>
                                  </td>
                                  <td>
                                    <p>
                                      <strong>{payItem?.payFeesDate}</strong>
                                    </p>
                                  </td>
                                  <td>
                                    <p>
                                      <strong>{payItem?.payInstallmentFees}</strong>
                                    </p>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="row">
                        <div className="receipt-header receipt-header-mid receipt-footer" style={{ margin: '2px 0px 24px' }}>
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
                        <div className="footer-divider-form"></div>
                        <div className="branch-address">
                          {isBranch === 'Sita Nagar'
                            ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat'
                            : isBranch === 'ABC, Mota Varachha'
                              ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat'
                              : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
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
                    <div className="container">
                      <div className="row">
                        <div className="receipt-header">
                          <div
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginButtom: '10px',
                              height: '80px',
                              alignItems: 'center',
                              display: 'flex'
                            }}
                          >
                            <div
                              style={{
                                width: '120px',
                                height: '100%'
                              }}
                            >
                              <img style={{ width: '100%', height: '100%' }} src={Logo} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                  <div className="sun-text">
                                    <img style={{ width: '100%', height: '100%' }} src={SunLogo} />
                                  </div>
                                </div>
                                <div className="nav-details">
                                  <div className="nav-detail">
                                    <div className="nav-title" style={{ width: '100px' }}>
                                      Receipt No :
                                    </div>
                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>
                                      {isCounterNumber?.paymentNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                <div className="nav-detail">
                                  <div className="nav-title">Mobile No:</div>
                                  <div className="nav-data">
                                    {isBranch === 'Sita Nagar'
                                      ? '+91 99252 53632'
                                      : isBranch === 'ABC, Mota Varachha'
                                        ? '+91 99786 26333'
                                        : ' +91 99796 86333'}
                                  </div>
                                </div>
                                <div className="nav-detail">
                                  <div className="nav-title" style={{ width: '61px' }}>
                                    Email Id:
                                  </div>
                                  <div className="nav-data" style={{ fontSize: '.75rem' }}>
                                    sunriseinstitute.tech@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divider-form"></div>
                      <div style={{ marginBottom: '12px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Refund Fee Receipt</h2>
                      </div>
                      <div className="row">
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <p
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '15px',
                                  margin: '1px 0',
                                  fontWeight: '500',
                                  fontSize: '16px'
                                }}
                              >
                                <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4>
                                <div className="border-line-fileds"> {values?.values?.name}</div>
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4>
                                  <div className="border-line-fileds mr-6p">{selectedCourse?.courseName}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4>
                                  <div className="border-line-fileds">{selectedCourse?.courseDuration} Months</div>
                                </p>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Enroll Date : </h4>
                                  <div className="border-line-fileds mr-6p">{selected?.selectData?.user?.enrollDate}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Student Branch : </h4>
                                  <div className="border-line-fileds">{selected?.selectData?.user?.enquireBranch}</div>
                                </p>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Refund By : </h4>
                                  <div className="border-line-fileds mr-6p">{name}</div>
                                </p>
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
                                  <strong>Total Fees Amount: </strong>
                                </p>
                                <p>
                                  <strong>Total Paid Amount: </strong>
                                </p>
                                <p>
                                  <strong>Total Pending Amount: </strong>
                                </p>
                                <p>
                                  <strong>Refund Amount: </strong>
                                </p>
                                <p>
                                  <strong>Net Fees Amount: </strong>
                                </p>
                              </td>
                              <td>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>
                                    {((!isNaN(parseFloat(selectedCourse?.fees)) ? parseFloat(selectedCourse?.fees) : 0) -
                                      (!isNaN(parseFloat(values?.values?.discount)) ? parseFloat(values?.values?.discount) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.payFees)) ? parseFloat(values?.values?.payFees) : 0)?.toFixed(2)}/-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(selectedCourse?.totalPendingInstallment)) ? parseFloat(selectedCourse?.totalPendingInstallment) : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.refundAmount)) ? parseFloat(values?.values?.refundAmount) : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {((!isNaN(parseFloat(values?.values?.payFees)) ? parseFloat(values?.values?.payFees) : 0) - (!isNaN(parseFloat(values?.values?.refundAmount)) ? parseFloat(values?.values?.refundAmount) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table className="table table-bordered w-100 receipt_data">
                          <thead>
                            <tr>
                              <th>Receipt No</th>
                              <th>Pay Date</th>
                              <th>Pay Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(settlePaymentData.length > 0) &&
                              settlePaymentData?.map((payItem) => (
                                <tr key={payItem?.paymentSlipNumber}>
                                  <td className="text-right">
                                    <p>
                                      <strong>{payItem?.paymentSlipNumber}</strong>
                                    </p>
                                  </td>
                                  <td>
                                    <p>
                                      <strong>{payItem?.payFeesDate}</strong>
                                    </p>
                                  </td>
                                  <td>
                                    <p>
                                      <strong>{payItem?.payInstallmentFees}</strong>
                                    </p>
                                  </td>
                                </tr>
                              ))}
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
                        <div className="footer-divider-form"></div>
                        <div className="branch-address">
                          {isBranch === 'Sita Nagar'
                            ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat'
                            : isBranch === 'ABC, Mota Varachha'
                              ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat'
                              : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogActions>
                  <Button
                    disabled={btnDisable}
                    colorScheme="blue"
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      generatePDF(values?.values);
                    }}
                  >
                    print
                  </Button>
                  <Button disabled={btnDisable} colorScheme="blue" type="submit" variant="contained" color="primary">
                    submit
                  </Button>
                  <Button
                    disabled={btnDisable}
                    colorScheme="gray"
                    variant="contained"
                    color="secondary"
                    mr={3}
                    onClick={handlePaymentDialogClose}
                  >
                    Close
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>
        <Dialog open={isPaymentReminderDialogOpen} onClose={handlePaymentDialogClose}>
          <DialogTitle>Payment Reminder Model</DialogTitle>
          <Formik
            initialValues={initialPaymentReminderValues}
            validationSchema={validationPaymentReminderSchema}
            onSubmit={handlePaymentReminderSubmit}
            enableReinitialize={true}
          >
            {(values) => (
              <Form>
                <DialogContent
                  sx={{
                    width: '500px',
                    margin: 'auto',
                    '@media (max-width: 600px)': {
                      width: '80vw'
                    }
                  }}
                >
                  <Box display="flex" flexWrap="wrap" gap="10px">
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '100%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '100%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '100%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '100%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="name"
                        render={({ field, form }) => (
                          <InputField name="name" label="name" placeholder="name" form={form} field={field} type="text" disabled={true} />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '100%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '100%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '100%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '100%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="status"
                        render={({ field, form }) => (
                          <InputField
                            name="course"
                            label="Select Course"
                            placeholder={`Enter Course`}
                            form={form}
                            field={field}
                            isManual={true}
                            disabled={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '100%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '100%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '100%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '100%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="reminderDate"
                        render={({ field, form }) => (
                          <InputDateField
                            name="reminderDate"
                            label="Enter Next Reminder Date"
                            placeholder="Enter Next Reminder Date"
                            form={form}
                            field={field}
                            type="date"
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button disabled={btnDisable} colorScheme="blue" type="submit" variant="contained" color="primary">
                    submit
                  </Button>
                  <Button
                    disabled={btnDisable}
                    colorScheme="gray"
                    variant="contained"
                    color="secondary"
                    mr={3}
                    onClick={handlePaymentDialogClose}
                  >
                    Close
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>

        <Dialog open={isAdvancePaymentDialogOpen} onClose={handlePaymentDialogClose}>
          <DialogTitle>Advance Payment Model</DialogTitle>
          <Formik
            initialValues={{
              ...initialValues,
              installmentAmount: selected?.selectData?.user?.installmentAmount?.toFixed(2),
              duePendingInstallment: selected?.selectData?.user?.duePendingInstallment,
              duePartialPayment: selected?.selectData?.user?.partialPayment?.toFixed(2),
              partialPayment: 0,
              totalPendingInstallment: selected?.selectData?.user?.totalPendingInstallment,
              paymentMethod: 'Cash',
              payInstallmentFees:
                ((selected?.selectData?.user?.partialPayment +
                  selected?.selectData?.user?.duePendingInstallment * selected?.selectData?.user?.installmentAmount)?.toFixed(2))
            }}
            validationSchema={validationSchemaAdvance}
            onSubmit={handleAdvanceaymentSubmit}
            enableReinitialize={true}
          >
            {(values) => (
              <Form>
                <DialogContent
                  sx={{
                    width: '500px',
                    margin: 'auto',
                    '@media (max-width: 600px)': {
                      width: '80vw'
                    }
                  }}
                >
                  <Box display="flex" flexWrap="wrap" gap="10px">
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="name"
                        render={({ field, form }) => (
                          <InputField name="name" label="name" placeholder="name" form={form} field={field} type="text" disabled={true} />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="course"
                        render={({ field, form }) => (
                          <InputField
                            name="course"
                            label="Selectd Course"
                            placeholder="Selectd Course"
                            form={form}
                            field={field}
                            type="text"
                            disabled={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="installmentAmount"
                        render={({ field, form }) => (
                          <InputField
                            name="installmentAmount"
                            label="Enter Installment Amount"
                            placeholder="Enter Installment Amount"
                            form={form}
                            field={field}
                            type="text"
                            disabled={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="installment"
                        render={({ field, form }) => (
                          <InputField
                            name="installment"
                            label="Installment"
                            placeholder="Installment"
                            form={form}
                            field={field}
                            type="number"
                            isManual={true}
                            disabled={true}
                            handleInputChange={(e) => {
                              handleInstallmentChange(e, form);
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="totalPendingInstallment"
                        render={({ field, form }) => (
                          <InputField
                            name="totalPendingInstallment"
                            label="Total Pending Installment"
                            placeholder="Enter Total Pending Installment"
                            form={form}
                            field={field}
                            type="number"
                            isManual={true}
                            disabled={true}
                            handleInputChange={(e) => {
                              handlePayInstallmentChange(e, form);
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="duePartialPayment"
                        render={({ field, form }) => (
                          <InputField
                            name="duePartialPayment"
                            label="Due Partial Payment"
                            placeholder="Enter Due Partial Payment"
                            form={form}
                            field={field}
                            type="number"
                            disabled={true}
                            isManual={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="partialPayment"
                        render={({ field, form }) => (
                          <InputField
                            name="partialPayment"
                            label="Partial Payment"
                            placeholder="Enter Partial Payment"
                            form={form}
                            field={field}
                            type="number"
                            isManual={true}
                            handleInputChange={(e) => {
                              handlePartialPayment(e, form);
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="duePendingInstallment"
                        render={({ field, form }) => (
                          <InputField
                            name="duePendingInstallment"
                            label="Enter Due Pending Installment"
                            placeholder="Enter Due Pending Installment"
                            form={form}
                            field={field}
                            type="number"
                            isManual={true}
                            handleInputChange={(e) => {
                              handleDuePendingInstallment(e, form);
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="paymentMethod"
                        render={({ field, form }) => (
                          <CustomSelectComponent
                            name="paymentMethod"
                            label="Select Payment Method"
                            placeholder={`Enter Payment Method`}
                            form={form}
                            field={field}
                            options={[
                              {
                                label: 'Cash',
                                value: 'Cash'
                              },
                              {
                                label: 'UPI',
                                value: 'UPI'
                              },
                              {
                                label: 'Bank Transfer',
                                value: 'Bank Transfer'
                              }
                            ]}
                          />
                        )}
                      />
                    </Box>
                    {(values?.values?.paymentMethod == 'UPI' || values?.values?.paymentMethod == 'Bank Transfer') && (
                      <Box
                        sx={{
                          width: '100%',
                          marginRight: '0px',
                          '@media (min-width: 600px)': {
                            width: '47%',
                            marginRight: '4px'
                          },
                          '@media (min-width: 960px)': {
                            width: '47%',
                            marginRight: '4.5px'
                          },
                          '@media (min-width: 1280px)': {
                            width: '47%',
                            marginRight: '5px'
                          },
                          '@media (min-width: 1536px)': {
                            width: '47%',
                            marginRight: '5px'
                          }
                        }}
                      >
                        <Field
                          name="paymentDetails"
                          render={({ field, form }) => (
                            <InputField
                              name="paymentDetails"
                              label="Payment Details"
                              placeholder={`Enter ${values?.values?.paymentMethod == 'UPI' ? 'Transactions ID' : 'Check Number'}`}
                              form={form}
                              field={field}
                            />
                          )}
                        />
                      </Box>
                    )}
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="payInstallmentFees"
                        render={({ field, form }) => (
                          <InputField
                            name="payInstallmentFees"
                            label="Enter Pay Installment Fees"
                            placeholder={`Enter Pay Installment Fees`}
                            form={form}
                            field={field}
                            disabled={true}
                            isManual={true}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </DialogContent>
                <div className="col-md-12" style={{ display: 'none' }}>
                  <div id="invoice">
                    <div className="container">
                      <div className="row">
                        <div className="receipt-header">
                          <div
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginButtom: '10px',
                              height: '80px',
                              alignItems: 'center',
                              display: 'flex'
                            }}
                          >
                            <div
                              style={{
                                width: '120px',
                                height: '100%'
                              }}
                            >
                              <img style={{ width: '100%', height: '100%' }} src={Logo} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                  <div className="sun-text">
                                    <img style={{ width: '100%', height: '100%' }} src={SunLogo} />
                                  </div>
                                </div>
                                <div className="nav-details">
                                  <div className="nav-detail">
                                    <div className="nav-title" style={{ width: '100px' }}>
                                      Receipt No :
                                    </div>
                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>
                                      {isCounterNumber?.paymentNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                <div className="nav-detail">
                                  <div className="nav-title">Mobile No:</div>
                                  <div className="nav-data">
                                    {isBranch === 'Sita Nagar'
                                      ? '+91 99252 53632'
                                      : isBranch === 'ABC, Mota Varachha'
                                        ? '+91 99786 26333'
                                        : ' +91 99796 86333'}
                                  </div>
                                </div>
                                <div className="nav-detail">
                                  <div className="nav-title" style={{ width: '61px' }}>
                                    Email Id:
                                  </div>
                                  <div className="nav-data" style={{ fontSize: '.75rem' }}>
                                    sunriseinstitute.tech@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divider-form"></div>
                      <div style={{ marginBottom: '5px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Fee Receipt</h2>
                      </div>
                      <div className="row">
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <p
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '15px',
                                  margin: '1px 0',
                                  fontWeight: '500',
                                  fontSize: '16px'
                                }}
                              >
                                <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4>
                                <div className="border-line-fileds"> {values?.values?.name}</div>
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4>
                                  <div className="border-line-fileds mr-6p">{selectedCourse?.courseName}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4>
                                  <div className="border-line-fileds">{selectedCourse?.courseDuration} Months</div>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '16px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}>
                                  <h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4>
                                  <div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div>
                                </p>
                                {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && (
                                  <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}>
                                    <h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                                      {values?.values?.paymentMethod === 'UPI'
                                        ? 'Transactions ID :'
                                        : values?.values?.paymentMethod === 'Bank Transfer'
                                          ? 'Check No :'
                                          : 'Cash'}{' '}
                                    </h4>
                                    <div className="border-line-fileds">{values?.values?.paymentDetails}</div>
                                  </p>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4>
                                  <div className="border-line-fileds mr-6p">{name}</div>
                                </p>
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
                                  <strong>
                                    <i className="fa fa-inr"></i>
                                    {(!isNaN(parseFloat(selected?.selectData?.user?.pendingFees))
                                      ? parseFloat(selected?.selectData?.user?.pendingFees)
                                      : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.payInstallmentFees))
                                      ? parseFloat(values?.values?.payInstallmentFees)
                                      : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {((!isNaN(parseFloat(selected?.selectData?.user?.pendingFees))
                                      ? parseFloat(selected?.selectData?.user?.pendingFees)
                                      : 0) -
                                      (!isNaN(parseFloat(values?.values?.payInstallmentFees))
                                        ? parseFloat(values?.values?.payInstallmentFees)
                                        : 0))?.toFixed(2)}
                                    /-
                                  </strong>
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
                        <div className="footer-divider-form"></div>
                        <div className="branch-address">
                          {isBranch === 'Sita Nagar'
                            ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat'
                            : isBranch === 'ABC, Mota Varachha'
                              ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat'
                              : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
                        </div>
                      </div>
                    </div>
                    <div className="container">
                      <div className="row">
                        <div className="receipt-header">
                          <div
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginButtom: '10px',
                              height: '80px',
                              alignItems: 'center',
                              display: 'flex'
                            }}
                          >
                            <div
                              style={{
                                width: '120px',
                                height: '100%'
                              }}
                            >
                              <img style={{ width: '100%', height: '100%' }} src={Logo} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                  <div className="sun-text">
                                    <img style={{ width: '100%', height: '100%' }} src={SunLogo} />
                                  </div>
                                </div>
                                <div className="nav-details">
                                  <div className="nav-detail">
                                    <div className="nav-title" style={{ width: '100px' }}>
                                      Receipt No :
                                    </div>
                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>
                                      {isCounterNumber?.paymentNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                <div className="nav-detail">
                                  <div className="nav-title">Mobile No:</div>
                                  <div className="nav-data">
                                    {isBranch === 'Sita Nagar'
                                      ? '+91 99252 53632'
                                      : isBranch === 'ABC, Mota Varachha'
                                        ? '+91 99786 26333'
                                        : ' +91 99796 86333'}
                                  </div>
                                </div>
                                <div className="nav-detail">
                                  <div className="nav-title" style={{ width: '61px' }}>
                                    Email Id:
                                  </div>
                                  <div className="nav-data" style={{ fontSize: '.75rem' }}>
                                    sunriseinstitute.tech@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divider-form"></div>
                      <div style={{ marginBottom: '5px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Fee Receipt</h2>
                      </div>
                      <div className="row">
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <p
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '15px',
                                  margin: '1px 0',
                                  fontWeight: '500',
                                  fontSize: '16px'
                                }}
                              >
                                <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4>
                                <div className="border-line-fileds"> {values?.values?.name}</div>
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4>
                                  <div className="border-line-fileds mr-6p">{selectedCourse?.courseName}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4>
                                  <div className="border-line-fileds">{selectedCourse?.courseDuration} Months</div>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '16px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}>
                                  <h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4>
                                  <div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div>
                                </p>
                                {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && (
                                  <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}>
                                    <h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                                      {values?.values?.paymentMethod === 'UPI'
                                        ? 'Transactions ID :'
                                        : values?.values?.paymentMethod === 'Bank Transfer'
                                          ? 'Check No :'
                                          : 'Cash'}{' '}
                                    </h4>
                                    <div className="border-line-fileds">{values?.values?.paymentDetails}</div>
                                  </p>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4>
                                  <div className="border-line-fileds mr-6p">{name}</div>
                                </p>
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
                                  <strong>
                                    <i className="fa fa-inr"></i>
                                    {(!isNaN(parseFloat(selected?.selectData?.user?.pendingFees))
                                      ? parseFloat(selected?.selectData?.user?.pendingFees)
                                      : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.payInstallmentFees))
                                      ? parseFloat(values?.values?.payInstallmentFees)
                                      : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {((!isNaN(parseFloat(selected?.selectData?.user?.pendingFees))
                                      ? parseFloat(selected?.selectData?.user?.pendingFees)
                                      : 0) -
                                      (!isNaN(parseFloat(values?.values?.payInstallmentFees))
                                        ? parseFloat(values?.values?.payInstallmentFees)
                                        : 0))?.toFixed(2)}
                                    /-
                                  </strong>
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
                        <div className="footer-divider-form"></div>
                        <div className="branch-address">
                          {isBranch === 'Sita Nagar'
                            ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat'
                            : isBranch === 'ABC, Mota Varachha'
                              ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat'
                              : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
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
                    <div className="container">
                      <div className="row">
                        <div className="receipt-header">
                          <div
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginButtom: '10px',
                              height: '80px',
                              alignItems: 'center',
                              display: 'flex'
                            }}
                          >
                            <div
                              style={{
                                width: '120px',
                                height: '100%'
                              }}
                            >
                              <img style={{ width: '100%', height: '100%' }} src={Logo} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                  <div className="sun-text">
                                    <img style={{ width: '100%', height: '100%' }} src={SunLogo} />
                                  </div>
                                </div>
                                <div className="nav-details">
                                  <div className="nav-detail">
                                    <div className="nav-title" style={{ width: '100px' }}>
                                      Receipt No :
                                    </div>
                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>
                                      {isCounterNumber?.paymentNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                <div className="nav-detail">
                                  <div className="nav-title">Mobile No:</div>
                                  <div className="nav-data">
                                    {isBranch === 'Sita Nagar'
                                      ? '+91 99252 53632'
                                      : isBranch === 'ABC, Mota Varachha'
                                        ? '+91 99786 26333'
                                        : ' +91 99796 86333'}
                                  </div>
                                </div>
                                <div className="nav-detail">
                                  <div className="nav-title" style={{ width: '61px' }}>
                                    Email Id:
                                  </div>
                                  <div className="nav-data" style={{ fontSize: '.75rem' }}>
                                    sunriseinstitute.tech@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divider-form"></div>
                      <div style={{ marginBottom: '5px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Fee Receipt</h2>
                      </div>
                      <div className="row">
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <p
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '15px',
                                  margin: '1px 0',
                                  fontWeight: '500',
                                  fontSize: '16px'
                                }}
                              >
                                <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4>
                                <div className="border-line-fileds"> {values?.values?.name}</div>
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4>
                                  <div className="border-line-fileds mr-6p">{selectedCourse?.courseName}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4>
                                  <div className="border-line-fileds">{selectedCourse?.courseDuration} Months</div>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '16px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}>
                                  <h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4>
                                  <div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div>
                                </p>
                                {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && (
                                  <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}>
                                    <h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                                      {values?.values?.paymentMethod === 'UPI'
                                        ? 'Transactions ID :'
                                        : values?.values?.paymentMethod === 'Bank Transfer'
                                          ? 'Check No :'
                                          : 'Cash'}{' '}
                                    </h4>
                                    <div className="border-line-fileds">{values?.values?.paymentDetails}</div>
                                  </p>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4>
                                  <div className="border-line-fileds mr-6p">{name}</div>
                                </p>
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
                                  <strong>
                                    <i className="fa fa-inr"></i>
                                    {(!isNaN(parseFloat(selected?.selectData?.user?.pendingFees))
                                      ? parseFloat(selected?.selectData?.user?.pendingFees)
                                      : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.payInstallmentFees))
                                      ? parseFloat(values?.values?.payInstallmentFees)
                                      : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {((!isNaN(parseFloat(selected?.selectData?.user?.pendingFees))
                                      ? parseFloat(selected?.selectData?.user?.pendingFees)
                                      : 0) -
                                      (!isNaN(parseFloat(values?.values?.payInstallmentFees))
                                        ? parseFloat(values?.values?.payInstallmentFees)
                                        : 0))?.toFixed(2)}
                                    /-
                                  </strong>
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
                        <div className="footer-divider-form"></div>
                        <div className="branch-address">
                          {isBranch === 'Sita Nagar'
                            ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat'
                            : isBranch === 'ABC, Mota Varachha'
                              ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat'
                              : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogActions>
                  <Button
                    disabled={btnDisable}
                    colorScheme="blue"
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      handlePrint(values?.values);
                    }}
                  >
                    print
                  </Button>
                  <Button colorScheme="blue" type="submit" variant="contained" color="primary" disabled={btnDisable}>
                    submit
                  </Button>
                  <Button
                    disabled={btnDisable}
                    colorScheme="gray"
                    variant="contained"
                    color="secondary"
                    mr={3}
                    onClick={handlePaymentDialogClose}
                  >
                    Close
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>
        <Dialog open={ispartialPaymentOpen} onClose={handlePaymentDialogClose}>
          <DialogTitle>Partial Payment Model</DialogTitle>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handlepayPartialPaymentSubmit}
            enableReinitialize={true}
          >
            {(values) => (
              <Form>
                <DialogContent
                  sx={{
                    width: '500px',
                    margin: 'auto',
                    '@media (max-width: 600px)': {
                      width: '80vw'
                    }
                  }}
                >
                  <Box display="flex" flexWrap="wrap" gap="10px">
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="name"
                        render={({ field, form }) => (
                          <InputField name="name" label="name" placeholder="name" form={form} field={field} type="text" disabled={true} />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="course"
                        render={({ field, form }) => (
                          <InputField
                            name="course"
                            label="Selectd Course"
                            placeholder="Selectd Course"
                            form={form}
                            field={field}
                            type="text"
                            disabled={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="totalFees"
                        render={({ field, form }) => (
                          <InputField
                            name="totalFees"
                            label="Total Fees"
                            placeholder="Total Fees"
                            form={form}
                            field={field}
                            type="text"
                            disabled={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="paymentType"
                        render={({ field, form }) => (
                          <InputField
                            name="paymentType"
                            label="Payment Type"
                            placeholder="Payment Type"
                            form={form}
                            field={field}
                            type="text"
                            disabled={true}
                          />
                        )}
                      />
                    </Box>
                    {values?.values?.paymentType == 'installment' && (
                      <Box
                        sx={{
                          width: '100%',
                          marginRight: '0px',
                          '@media (min-width: 600px)': {
                            width: '47%',
                            marginRight: '4px'
                          },
                          '@media (min-width: 960px)': {
                            width: '47%',
                            marginRight: '4.5px'
                          },
                          '@media (min-width: 1280px)': {
                            width: '47%',
                            marginRight: '5px'
                          },
                          '@media (min-width: 1536px)': {
                            width: '47%',
                            marginRight: '5px'
                          }
                        }}
                      >
                        <Field
                          name="installment"
                          render={({ field, form }) => (
                            <InputField
                              name="installment"
                              label="Installment"
                              placeholder="Installment"
                              form={form}
                              field={field}
                              type="number"
                              isManual={true}
                              disabled={true}
                              handleInputChange={(e) => {
                                handleInstallmentChange(e, form);
                              }}
                            />
                          )}
                        />
                      </Box>
                    )}
                    {values?.values?.paymentType == 'installment' && (
                      <Box
                        sx={{
                          width: '100%',
                          marginRight: '0px',
                          '@media (min-width: 600px)': {
                            width: '47%',
                            marginRight: '4px'
                          },
                          '@media (min-width: 960px)': {
                            width: '47%',
                            marginRight: '4.5px'
                          },
                          '@media (min-width: 1280px)': {
                            width: '47%',
                            marginRight: '5px'
                          },
                          '@media (min-width: 1536px)': {
                            width: '47%',
                            marginRight: '5px'
                          }
                        }}
                      >
                        <Field
                          name="payInstallment"
                          render={({ field, form }) => (
                            <InputField
                              name="payInstallment"
                              label="Pay Installment"
                              placeholder="Enter Pay Installment"
                              form={form}
                              field={field}
                              type="number"
                              isManual={true}
                              disabled={true}
                              handleInputChange={(e) => {
                                handlePayInstallmentChange(e, form);
                              }}
                            />
                          )}
                        />
                      </Box>
                    )}
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="payFees"
                        render={({ field, form }) => (
                          <InputField
                            name="payFees"
                            label="Pay Fees"
                            placeholder="Enter Pay Fees"
                            form={form}
                            field={field}
                            type="number"
                            disabled={true}
                            isManual={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="duePartialPayment"
                        render={({ field, form }) => (
                          <InputField
                            name="duePartialPayment"
                            label="Due Partial Payment"
                            placeholder="Enter Due Partial Payment"
                            form={form}
                            field={field}
                            type="number"
                            disabled={true}
                            isManual={true}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="partialPayment"
                        render={({ field, form }) => (
                          <InputField
                            name="partialPayment"
                            label="Pay Amount"
                            placeholder="Enter Pay Amount"
                            form={form}
                            field={field}
                            type="number"
                            isManual={true}
                            handleInputChange={(e) => {
                              handlePartialPaymentModelChange(e, form);
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="paymentMethod"
                        render={({ field, form }) => (
                          <CustomSelectComponent
                            name="paymentMethod"
                            label="Select Payment Method"
                            placeholder={`Enter Payment Method`}
                            form={form}
                            field={field}
                            options={[
                              {
                                label: 'Cash',
                                value: 'Cash'
                              },
                              {
                                label: 'UPI',
                                value: 'UPI'
                              },
                              {
                                label: 'Bank Transfer',
                                value: 'Bank Transfer'
                              }
                            ]}
                          />
                        )}
                      />
                    </Box>
                    {(values?.values?.paymentMethod == 'UPI' || values?.values?.paymentMethod == 'Bank Transfer') && (
                      <Box
                        sx={{
                          width: '100%',
                          marginRight: '0px',
                          '@media (min-width: 600px)': {
                            width: '47%',
                            marginRight: '4px'
                          },
                          '@media (min-width: 960px)': {
                            width: '47%',
                            marginRight: '4.5px'
                          },
                          '@media (min-width: 1280px)': {
                            width: '47%',
                            marginRight: '5px'
                          },
                          '@media (min-width: 1536px)': {
                            width: '47%',
                            marginRight: '5px'
                          }
                        }}
                      >
                        <Field
                          name="paymentDetails"
                          render={({ field, form }) => (
                            <InputField
                              name="paymentDetails"
                              label="Payment Details"
                              placeholder={`Enter ${values?.values?.paymentMethod == 'UPI' ? 'Transactions ID' : 'Check Number'}`}
                              form={form}
                              field={field}
                            />
                          )}
                        />
                      </Box>
                    )}
                    {/* <Box
                      sx={{
                        width: '100%',
                        marginRight: '0px',
                        '@media (min-width: 600px)': {
                          width: '47%',
                          marginRight: '4px'
                        },
                        '@media (min-width: 960px)': {
                          width: '47%',
                          marginRight: '4.5px'
                        },
                        '@media (min-width: 1280px)': {
                          width: '47%',
                          marginRight: '5px'
                        },
                        '@media (min-width: 1536px)': {
                          width: '47%',
                          marginRight: '5px'
                        }
                      }}
                    >
                      <Field
                        name="gstBranch"
                        render={({ form }) => (
                          <Field
                            name="gstBranch"
                            render={({ field, form }) => (
                              <CustomSelectComponent
                                name="gstBranch"
                                label="Enter GST Branch"
                                placeholder={`Enter GST Branch`}
                                form={form}
                                field={field}
                                options={[
                                  {
                                    label: 'Abrama, Mota Varachha',
                                    value: 'Abrama, Mota Varachha'
                                  },
                                  {
                                    label: 'Sita Nagar',
                                    value: 'Sita Nagar'
                                  },
                                  {
                                    label: 'ABC, Mota Varachha',
                                    value: 'ABC, Mota Varachha'
                                  }
                                ]}
                              />
                            )}
                          />
                        )}
                      />
                    </Box> */}
                  </Box>
                </DialogContent>
                <div className="col-md-12" style={{ display: 'none' }}>
                  <div id="invoice">
                    <div className="container">
                      <div className="row">
                        <div className="receipt-header">
                          <div
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginButtom: '10px',
                              height: '80px',
                              alignItems: 'center',
                              display: 'flex'
                            }}
                          >
                            <div
                              style={{
                                width: '120px',
                                height: '100%'
                              }}
                            >
                              <img style={{ width: '100%', height: '100%' }} src={Logo} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                  <div className="sun-text">
                                    <img style={{ width: '100%', height: '100%' }} src={SunLogo} />
                                  </div>
                                </div>
                                <div className="nav-details">
                                  <div className="nav-detail">
                                    <div className="nav-title" style={{ width: '100px' }}>
                                      Receipt No :
                                    </div>
                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>
                                      {isCounterNumber?.paymentNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                <div className="nav-detail">
                                  <div className="nav-title">Mobile No:</div>
                                  <div className="nav-data">
                                    {isBranch === 'Sita Nagar'
                                      ? '+91 99252 53632'
                                      : isBranch === 'ABC, Mota Varachha'
                                        ? '+91 99786 26333'
                                        : ' +91 99796 86333'}
                                  </div>
                                </div>
                                <div className="nav-detail">
                                  <div className="nav-title" style={{ width: '61px' }}>
                                    Email Id:
                                  </div>
                                  <div className="nav-data" style={{ fontSize: '.75rem' }}>
                                    sunriseinstitute.tech@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divider-form"></div>
                      <div style={{ marginBottom: '5px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Fee Receipt</h2>
                      </div>
                      <div className="row">
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <p
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '15px',
                                  margin: '1px 0',
                                  fontWeight: '500',
                                  fontSize: '16px'
                                }}
                              >
                                <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4>
                                <div className="border-line-fileds"> {values?.values?.name}</div>
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4>
                                  <div className="border-line-fileds mr-6p">{selectedCourse?.courseName}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4>
                                  <div className="border-line-fileds">{selectedCourse?.courseDuration} Months</div>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '16px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}>
                                  <h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4>
                                  <div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div>
                                </p>
                                {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && (
                                  <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}>
                                    <h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                                      {values?.values?.paymentMethod === 'UPI'
                                        ? 'Transactions ID :'
                                        : values?.values?.paymentMethod === 'Bank Transfer'
                                          ? 'Check No :'
                                          : 'Cash'}{' '}
                                    </h4>
                                    <div className="border-line-fileds">{values?.values?.paymentDetails}</div>
                                  </p>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4>
                                  <div className="border-line-fileds mr-6p">{name}</div>
                                </p>
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
                                  <strong>
                                    <i className="fa fa-inr"></i>
                                    {(!isNaN(parseFloat(values?.values?.duePartialPayment))
                                      ? parseFloat(values?.values?.duePartialPayment)
                                      : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.partialPayment)) ? parseFloat(values?.values?.partialPayment) : 0)?.toFixed(2)}/-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {((!isNaN(parseFloat(values?.values?.duePartialPayment))
                                      ? parseFloat(values?.values?.duePartialPayment)
                                      : 0) -
                                      (!isNaN(parseFloat(values?.values?.partialPayment)) ? parseFloat(values?.values?.partialPayment) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
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
                        <div className="footer-divider-form"></div>
                        <div className="branch-address">
                          {isBranch === 'Sita Nagar'
                            ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat'
                            : isBranch === 'ABC, Mota Varachha'
                              ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat'
                              : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
                        </div>
                      </div>
                    </div>
                    <div className="container">
                      <div className="row">
                        <div className="receipt-header">
                          <div
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginButtom: '10px',
                              height: '80px',
                              alignItems: 'center',
                              display: 'flex'
                            }}
                          >
                            <div
                              style={{
                                width: '120px',
                                height: '100%'
                              }}
                            >
                              <img style={{ width: '100%', height: '100%' }} src={Logo} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                  <div className="sun-text">
                                    <img style={{ width: '100%', height: '100%' }} src={SunLogo} />
                                  </div>
                                </div>
                                <div className="nav-details">
                                  <div className="nav-detail">
                                    <div className="nav-title" style={{ width: '100px' }}>
                                      Receipt No :
                                    </div>
                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>
                                      {isCounterNumber?.paymentNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                <div className="nav-detail">
                                  <div className="nav-title">Mobile No:</div>
                                  <div className="nav-data">
                                    {isBranch === 'Sita Nagar'
                                      ? '+91 99252 53632'
                                      : isBranch === 'ABC, Mota Varachha'
                                        ? '+91 99786 26333'
                                        : ' +91 99796 86333'}
                                  </div>
                                </div>
                                <div className="nav-detail">
                                  <div className="nav-title" style={{ width: '61px' }}>
                                    Email Id:
                                  </div>
                                  <div className="nav-data" style={{ fontSize: '.75rem' }}>
                                    sunriseinstitute.tech@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divider-form"></div>
                      <div style={{ marginBottom: '5px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Fee Receipt</h2>
                      </div>
                      <div className="row">
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <p
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '15px',
                                  margin: '1px 0',
                                  fontWeight: '500',
                                  fontSize: '16px'
                                }}
                              >
                                <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4>
                                <div className="border-line-fileds"> {values?.values?.name}</div>
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4>
                                  <div className="border-line-fileds mr-6p">{selectedCourse?.courseName}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4>
                                  <div className="border-line-fileds">{selectedCourse?.courseDuration} Months</div>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '16px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}>
                                  <h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4>
                                  <div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div>
                                </p>
                                {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && (
                                  <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}>
                                    <h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                                      {values?.values?.paymentMethod === 'UPI'
                                        ? 'Transactions ID :'
                                        : values?.values?.paymentMethod === 'Bank Transfer'
                                          ? 'Check No :'
                                          : 'Cash'}{' '}
                                    </h4>
                                    <div className="border-line-fileds">{values?.values?.paymentDetails}</div>
                                  </p>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4>
                                  <div className="border-line-fileds mr-6p">{name}</div>
                                </p>
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
                                  <strong>
                                    <i className="fa fa-inr"></i>
                                    {(!isNaN(parseFloat(values?.values?.duePartialPayment))
                                      ? parseFloat(values?.values?.duePartialPayment)
                                      : 0).toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.partialPayment)) ? parseFloat(values?.values?.partialPayment) : 0)?.toFixed(2)}/-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {((!isNaN(parseFloat(values?.values?.duePartialPayment))
                                      ? parseFloat(values?.values?.duePartialPayment)
                                      : 0) -
                                      (!isNaN(parseFloat(values?.values?.partialPayment)) ? parseFloat(values?.values?.partialPayment) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
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
                        <div className="footer-divider-form"></div>
                        <div className="branch-address">
                          {isBranch === 'Sita Nagar'
                            ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat'
                            : isBranch === 'ABC, Mota Varachha'
                              ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat'
                              : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
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
                    <div className="container">
                      <div className="row">
                        <div className="receipt-header">
                          <div
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginButtom: '10px',
                              height: '80px',
                              alignItems: 'center',
                              display: 'flex'
                            }}
                          >
                            <div
                              style={{
                                width: '120px',
                                height: '100%'
                              }}
                            >
                              <img style={{ width: '100%', height: '100%' }} src={Logo} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '85%', display: 'flex', justifyContent: 'center', marginLeft: '50px' }}>
                                  <div className="sun-text">
                                    <img style={{ width: '100%', height: '100%' }} src={SunLogo} />
                                  </div>
                                </div>
                                <div className="nav-details">
                                  <div className="nav-detail">
                                    <div className="nav-title" style={{ width: '100px' }}>
                                      Receipt No :
                                    </div>
                                    <div className="nav-data" style={{ fontWeight: '500', fontSize: '1rem', width: '35%' }}>
                                      {isCounterNumber?.paymentNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 65px' }}>
                                <div className="nav-detail">
                                  <div className="nav-title">Mobile No:</div>
                                  <div className="nav-data">
                                    {isBranch === 'Sita Nagar'
                                      ? '+91 99252 53632'
                                      : isBranch === 'ABC, Mota Varachha'
                                        ? '+91 99786 26333'
                                        : ' +91 99796 86333'}
                                  </div>
                                </div>
                                <div className="nav-detail">
                                  <div className="nav-title" style={{ width: '61px' }}>
                                    Email Id:
                                  </div>
                                  <div className="nav-data" style={{ fontSize: '.75rem' }}>
                                    sunriseinstitute.tech@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divider-form"></div>
                      <div style={{ marginBottom: '5px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Fee Receipt</h2>
                      </div>
                      <div className="row">
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <p
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '15px',
                                  margin: '1px 0',
                                  fontWeight: '500',
                                  fontSize: '16px'
                                }}
                              >
                                <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Full Name : </h4>
                                <div className="border-line-fileds"> {values?.values?.name}</div>
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Course Name : </h4>
                                  <div className="border-line-fileds mr-6p">{selectedCourse?.courseName}</div>
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%' }}>
                                  <h4 style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>Course Duration : </h4>
                                  <div className="border-line-fileds">{selectedCourse?.courseDuration} Months</div>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="receipt-header receipt-header-mid" style={{ width: '100%', marginBottom: '0' }}>
                          <div className="col-xs-8 col-sm-8 col-md-8 text-left" style={{ width: '100%' }}>
                            <div className="receipt-right" style={{ width: '100%' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '16px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%', margin: '0' }}>
                                  <h4 style={{ margin: '0', width: '125px', minWidth: '125px', maxWidth: '125px' }}>Payment Mode : </h4>
                                  <div className={`border-line-fileds mr-6p `}>{values?.values?.paymentMethod}</div>
                                </p>
                                {(values?.values?.paymentMethod === 'UPI' || values?.values?.paymentMethod === 'Bank Transfer') && (
                                  <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '45%', margin: '0' }}>
                                    <h4 style={{ margin: '0', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                                      {values?.values?.paymentMethod === 'UPI'
                                        ? 'Transactions ID :'
                                        : values?.values?.paymentMethod === 'Bank Transfer'
                                          ? 'Check No :'
                                          : 'Cash'}{' '}
                                    </h4>
                                    <div className="border-line-fileds">{values?.values?.paymentDetails}</div>
                                  </p>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: '40px',
                                  marginTop: '6px'
                                }}
                              >
                                <p style={{ display: 'flex', alignItems: 'center', height: '15px', width: '55%' }}>
                                  <h4 style={{ width: '125px', minWidth: '125px', maxWidth: '125px' }}>Received By : </h4>
                                  <div className="border-line-fileds mr-6p">{name}</div>
                                </p>
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
                                  <strong>
                                    <i className="fa fa-inr"></i>
                                    {(!isNaN(parseFloat(values?.values?.duePartialPayment))
                                      ? parseFloat(values?.values?.duePartialPayment)
                                      : 0)?.toFixed(2)}
                                    /-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {(!isNaN(parseFloat(values?.values?.partialPayment)) ? parseFloat(values?.values?.partialPayment) : 0)?.toFixed(2)}/-
                                  </strong>
                                </p>
                                <p>
                                  <strong>
                                    <i className="fa fa-inr"></i>{' '}
                                    {((!isNaN(parseFloat(values?.values?.duePartialPayment))
                                      ? parseFloat(values?.values?.duePartialPayment)
                                      : 0) -
                                      (!isNaN(parseFloat(values?.values?.partialPayment)) ? parseFloat(values?.values?.partialPayment) : 0))?.toFixed(2)}
                                    /-
                                  </strong>
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
                        <div className="footer-divider-form"></div>
                        <div className="branch-address">
                          {isBranch === 'Sita Nagar'
                            ? '202-203, Shanti Nagar 1, near Sitanagar Chowk, Punagam, Varachha, Surat, Gujarat'
                            : isBranch === 'ABC, Mota Varachha'
                              ? '411-412, Angel Business Center, ABC Circle, Mota Varachha, Surat, Gujarat'
                              : '410-413, Shantiniketan Flora Business Hub, beside Sanskartirth Gyanpith School, Abrama Rd, Mota Varachha, Surat, Gujarat'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogActions>
                  <Button
                    disabled={btnDisable}
                    colorScheme="blue"
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      handlePrint(values?.values);
                    }}
                  >
                    print
                  </Button>
                  <Button colorScheme="blue" type="submit" variant="contained" color="primary" disabled={btnDisable}>
                    submit
                  </Button>
                  <Button
                    disabled={btnDisable}
                    colorScheme="gray"
                    variant="contained"
                    color="secondary"
                    mr={3}
                    onClick={handlePaymentDialogClose}
                  >
                    Close
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>
      </Box >
    </>
  );
};

export default CommonTable;

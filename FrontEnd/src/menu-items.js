import NavigationOutlinedIcon from '@mui/icons-material/NavigationOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ClassIcon from '@mui/icons-material/Class';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ImportantDevicesIcon from '@mui/icons-material/ImportantDevices';
import SummarizeIcon from '@mui/icons-material/Summarize';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import SchoolIcon from '@mui/icons-material/School';
import WebIcon from '@mui/icons-material/Web';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import BusinessIcon from '@mui/icons-material/Business';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

const icons = {
  NavigationOutlinedIcon: NavigationOutlinedIcon,
  HomeOutlinedIcon: HomeOutlinedIcon,
  ContentPasteSearchIcon: ContentPasteSearchIcon,
  FlightTakeoffIcon: FlightTakeoffIcon,
  ClassIcon: ClassIcon,
  ImportantDevicesIcon: ImportantDevicesIcon,
  AdminPanelSettingsIcon: AdminPanelSettingsIcon,
  SupervisorAccountIcon: SupervisorAccountIcon,
  SummarizeIcon: SummarizeIcon,
  PointOfSaleIcon: PointOfSaleIcon,
  SchoolIcon: SchoolIcon,
  AccountBalanceWalletIcon: AccountBalanceWalletIcon,
  WebIcon: WebIcon,
  PhotoSizeSelectActualIcon: PhotoSizeSelectActualIcon,
  NoteAltIcon: NoteAltIcon,
  ContactPhoneIcon: ContactPhoneIcon,
  BusinessIcon: BusinessIcon
};

const NavigationItems = () => {
  const user = useSelector(state => state.user.isAdmin);
  const [isUser, setIsUser] = useState(user);
  useEffect(() => {
    setIsUser(user);
  }, [user]);

  const items = [
    {
      id: 'navigation',
      type: 'group',
      icon: icons['NavigationOutlinedIcon'],
      children: [
        {
          id: '/dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: icons['HomeOutlinedIcon'],
          url: '/dashboard'
        },
        {
          id: 'form',
          title: 'Form',
          type: 'collapse',
          icon: icons['ContentPasteSearchIcon'],
          children: [
            {
              id: '/enquire/immigration',
              title: 'Immigration',
              type: 'item',
              url: '/enquire/immigration',
              icon: icons['FlightTakeoffIcon'],
            },
            {
              id: '/enquire/competitive-exam',
              title: 'Competitive Exam',
              type: 'item',
              url: '/enquire/competitive-exam',
              icon: icons['ClassIcon'],
            },
            {
              id: '/enquire/it-courses',
              title: 'It Courses',
              type: 'item',
              url: '/enquire/it-courses',
              icon: icons['ImportantDevicesIcon'],
            },
          ]
        },
        {
          id: 'enquire',
          title: 'Enquire',
          type: 'collapse',
          icon: icons['SummarizeIcon'],
          children: [
            {
              id: '/report/enquire',
              title: 'Immigration',
              type: 'item',
              url: '/report/enquire',
              icon: icons['FlightTakeoffIcon'],
            },
            {
              id: '/report/competitiveExam',
              title: 'Competitive Exam',
              type: 'item',
              url: '/report/competitiveExam',
              icon: icons['ClassIcon'],
            },
            {
              id: '/report/itCourses',
              title: 'It Courses Report',
              type: 'item',
              url: '/report/itCourses',
              icon: icons['ImportantDevicesIcon'],
            },
          ]
        },
        {
          id: 'student',
          title: 'Student',
          type: 'collapse',
          icon: icons['SchoolIcon'],
          children: [
            {
              id: '/student/enroll-student',
              title: 'Enroll Student',
              type: 'item',
              url: '/student/enroll-student',
              icon: icons['PointOfSaleIcon'],
            },
            {
              id: '/student/partial-payment',
              title: 'Due Partial Payment',
              type: 'item',
              url: '/student/partial-payment',
              icon: icons['PointOfSaleIcon'],
            },
            {
              id: '/student/course-completion-student',
              title: 'Course Completion Student',
              type: 'item',
              url: '/student/course-completion-student',
              icon: icons['SchoolIcon'],
            },
          ]
        },
        (isUser === true || isUser === "true" || isUser === "master") && {
          id: 'admin',
          title: 'Payment',
          type: 'collapse',
          icon: icons['SupervisorAccountIcon'],
          children: [
            {
              id: '/admin/payment-report',
              title: 'Payment Report',
              type: 'item',
              url: '/admin/payment-report',
              icon: icons['AccountBalanceWalletIcon'],
            },
            {
              id: '/admin/settlement-report',
              title: 'Adjust Payment Report',
              type: 'item',
              url: '/admin/settlement-report',
              icon: icons['AccountBalanceWalletIcon'],
            },
            {
              id: '/payment-slip',
              title: 'Payment Slip Report',
              type: 'item',
              url: '/payment-slip',
              icon: icons['PointOfSaleIcon'],
            },
          ]
        },
        (isUser === "master") && {
          id: 'master',
          title: 'Master',
          type: 'collapse',
          icon: icons['AdminPanelSettingsIcon'],
          children: [
            {
              id: '/admin/CreateAdmin',
              title: 'Create Admin',
              type: 'item',
              url: '/admin/CreateAdmin',
              icon: icons['SupervisorAccountIcon'],
            },
            {
              id: '/admin/create-course',
              title: 'Create Course',
              type: 'item',
              url: '/admin/create-course',
              icon: icons['ClassIcon'],
            },
            {
              id: '/admin/create-branch',
              title: 'Add Branch',
              type: 'item',
              url: '/admin/create-branch',
              icon: icons['BusinessIcon'],
            },
          ]
        },
        (isUser === "master") && {
          id: 'sunriseWeb',
          title: 'Sunrise Web',
          type: 'collapse',
          icon: icons['WebIcon'],
          children: [
            {
              id: '/web/gallery',
              title: 'Gallery',
              type: 'item',
              url: '/web/gallery',
              icon: icons['PhotoSizeSelectActualIcon'],
            },
            {
              id: '/web/course',
              title: 'Web Course',
              type: 'item',
              url: '/web/course',
              icon: icons['NoteAltIcon'],
            },
            {
              id: '/web/contact',
              title: 'Web Contact',
              type: 'item',
              url: '/web/contact',
              icon: icons['ContactPhoneIcon'],
            },
          ]
        },
      ]
    },
  ];
  return { items };
};

export default NavigationItems;

import React, { lazy, useEffect, useState } from 'react';
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';
import { useSelector } from 'react-redux';
import Enroll from 'views/Dashboard/Admin/Enroll';
import PaymentReport from 'views/Dashboard/Admin/PaymentReport';
import CourseCompletionStudent from 'views/Dashboard/Admin/CourseCompletionStudent';
import SettlePayment from 'views/Dashboard/Admin/SettlePayment';
import PaymentSlipBook from 'views/Dashboard/Admin/PaymentSlipBook';

const DashboardDefault = Loadable(lazy(() => import('../views/Dashboard')));
const CompetitiveExam = Loadable(lazy(() => import('../views/Dashboard/Enquire/CompetitiveExam')));
const ItCourses = Loadable(lazy(() => import('../views/Dashboard/Enquire/ItCourses')));
const Immigration = Loadable(lazy(() => import('../views/Dashboard/Enquire/Immigration')));
const ImmigrationReport = Loadable(lazy(() => import('../views/Dashboard/Report/ImmigrationReport')));
const CompetitiveExamReport = Loadable(lazy(() => import('../views/Dashboard/Report/CompetitiveExamReport')));
const CreateAdmin = Loadable(lazy(() => import('../views/Dashboard/Admin/CraeteAdmin')));
const ItCoursesReport = Loadable(lazy(() => import('../views/Dashboard/Report/ItCoursesReport')));
const CreateCourse = Loadable(lazy(() => import('../views/Dashboard/Admin/CreateCourse')));
const PartialPayment = Loadable(lazy(() => import('../views/Dashboard/Payment/PartialPayment')));
const WebCourse = Loadable(lazy(() => import('../views/Dashboard/Web/WebCourse')));
const Gallery = Loadable(lazy(() => import('../views/Dashboard/Web/Gallery')));
const Contact = Loadable(lazy(() => import('../views/Dashboard/Web/Contact')));

const MainRoutes = () => {
  const user = useSelector(state => state.user.isAdmin);
  const [isUser, setIsUser] = useState(user);

  useEffect(() => {
    setIsUser(user);
  }, [user]);

  return {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <DashboardDefault />
      },
      {
        path: '/dashboard',
        element: <DashboardDefault />
      },
      {
        path: '/enquire/competitive-exam',
        element: <CompetitiveExam />
      },
      {
        path: '/enquire/it-courses',
        element: <ItCourses />
      },
      {
        path: '/enquire/immigration',
        element: <Immigration />
      },
      {
        path: '/report/enquire',
        element: <ImmigrationReport />
      },
      {
        path: '/report/competitiveExam',
        element: <CompetitiveExamReport />
      },
      {
        path: '/report/itCourses',
        element: <ItCoursesReport />
      },
      {
        path: '/student/enroll-student',
        element: <Enroll />
      },
      {
        path: '/student/partial-payment',
        element: <PartialPayment />
      },
      {
        path: '/student/course-completion-student',
        element: <CourseCompletionStudent />
      },
      (isUser === "master") && {
        path: '/admin/CreateAdmin',
        element: <CreateAdmin />
      },
      (isUser === "master") && {
        path: '/web/gallery',
        element: <Gallery />
      },
      (isUser === "master") && {
        path: '/web/course',
        element: <WebCourse />
      },
      (isUser === "master") && {
        path: '/web/contact',
        element: <Contact />
      },
      (isUser === "master") && {
        path: '/admin/create-course',
        element: <CreateCourse />
      },
      ((isUser === true || isUser === "true" || isUser === "master")) && {
        path: '/admin/payment-report',
        element: <PaymentReport />
      },
      ((isUser === true || isUser === "true" || isUser === "master")) && {
        path: '/admin/settlement-report',
        element: <SettlePayment />
      },
      ((isUser === true || isUser === "true" || isUser === "master")) && {
        path: '/payment-slip',
        element: <PaymentSlipBook />
      },
    ]
  };
};

export default MainRoutes;

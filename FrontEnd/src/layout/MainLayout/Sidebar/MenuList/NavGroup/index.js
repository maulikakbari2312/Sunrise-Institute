import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { List, Typography } from '@mui/material';

// project import
import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
// ==============================|| NAVGROUP ||============================== //

const NavGroup = ({ item }) => {
  const user = useSelector(state => state.customization.isOpen);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const location = useLocation();
  const currentPath = location.pathname;
  useEffect(() => {
    setSelected(user);
    if (currentPath == '/dashboard' || currentPath == 'dashboard') {
      setOpen('/dashboard')
    } else if (currentPath == '/enquire/it-courses' || currentPath == '/enquire/competitive-exam' || currentPath == '/enquire/immigration') {
      setOpen('form')
    } else if (currentPath == '/report/itCourses' || currentPath == '/report/competitiveExam' || currentPath == '/report/enquire') {
      setOpen('enquire')
    } else if (currentPath == '/student/course-completion-student' || currentPath == '/student/enroll-student' || currentPath == '/student/partial-payment') {
      setOpen('student')
    } else if (currentPath == '/admin/settlement-report' || currentPath == '/admin/payment-report' || currentPath == '/payment-slip') {
      setOpen('admin')
    } else if (currentPath == '/admin/create-course' || currentPath == '/admin/CreateAdmin') {
      setOpen('master')
    } else if (currentPath == '/web/course' || currentPath == '/web/gallery' || currentPath == '/web/contact') {
      setOpen('sunriseWeb')
    } else {
      setOpen('/')
    }
  }, []);
  const theme = useTheme();
  const items = item.children.map((menu) => {
    switch (menu.type) {
      case 'collapse':
        return <NavCollapse key={menu.id} menu={menu} level={1} open={open} setOpen={setOpen} selected={selected} setSelected={setSelected} />;
      case 'item':
        return <NavItem key={menu.id} item={menu} level={1} />;
    }
  });

  return (
    <List
      subheader={
        <Typography variant="caption" sx={{ ...theme.typography.menuCaption }} display="block" gutterBottom>
          {item.title}
          {item.caption && (
            <Typography variant="caption" sx={{ ...theme.typography.subMenuCaption }} display="block" gutterBottom>
              {item.caption}
            </Typography>
          )}
        </Typography>
      }
    >
      {items}
    </List>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object,
  children: PropTypes.object,
  title: PropTypes.string,
  caption: PropTypes.string
};

export default NavGroup;

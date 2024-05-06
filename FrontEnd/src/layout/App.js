import React, { useEffect, useState } from 'react';

// material-ui
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// third-party
import { useDispatch, useSelector } from 'react-redux';

// project import
import theme from 'themes';
import Routes from 'routes/index';
import NavigationScroll from './NavigationScroll';
import { useNavigate } from 'react-router-dom';
import { userLogin, userRole, userBranch } from 'store/action';
import * as actionTypes from 'store/action/actions';
import { SocketProvider } from './SocketContext';



// ==============================|| APP ||============================== //

const App = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const uLoca = localStorage.getItem('user');
  const [userData, setUserData] = useState(uLoca);
  const user = useSelector(state => state.user.login);

  useEffect(() => {
    setUserData(user);
  }, [user]);
  useEffect(() => {
    if (uLoca == '' || uLoca == null || uLoca == undefined) {
      setUserData(false);
    }
  }, [uLoca]);

  useEffect(() => {
    if (!userData) {
      navigate('/application/login', { replace: true });
    } else {
      navigate(window.location.pathname, { replace: true });
      dispatch({ type: actionTypes.MENU_OPEN, isOpen: window.location.pathname });
    }
  }, [userData]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('token') !== null && localStorage.getItem('token') !== undefined;
    // You may dispatch an action to set the user's authentication state in Redux here
    if (isAuthenticated) {
      const action = userLogin(); // Call the action creator
      dispatch(action); // Dispatch the action object returned by the action creator
      const branchs = localStorage.getItem('branch');
      dispatch(userBranch(branchs));
    }
    // const isAdmin = localStorage.getItem("isAdmin") !== null;
    const isAdmin = localStorage.getItem('isAdmin') !== null;
    if (isAdmin) {
      const admin = localStorage.getItem('isAdmin');
      dispatch(userRole(admin));
    }
  }, []);
  const customization = useSelector((state) => state.customization);
  return (
    <>
      {
        <NavigationScroll>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme(customization)}>
              <CssBaseline />
              <SocketProvider>
                <Routes />
              </SocketProvider>
            </ThemeProvider>
          </StyledEngineProvider>
        </NavigationScroll>
      }
    </>
  );
};

export default App;

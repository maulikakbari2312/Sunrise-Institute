import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  FormHelperText,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton
} from '@mui/material';

//  third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useApi } from 'network/api';
import { useDispatch } from 'react-redux';
import { userBranch, userLogin, userRole } from 'store/action';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import * as actionTypes from 'store/action/actions';

// ==============================|| FIREBASE LOGIN ||============================== //

const FirebaseLogin = ({ ...rest }) => {
  const { postApi } = useApi();
  const navigate = useNavigate();

  const theme = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);
  const [btnDisable, setBtnDisable] = React.useState(false);
  const dispatch = useDispatch();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    setBtnDisable(true);
    try {
      const headers = {
      }
      let cm = false;
      if(values.email.startsWith("cm")){
        cm = true;
      }else{
        cm = false;
      }
      let apiUrl = '';
      if (cm) {
        apiUrl = `${process.env.REACT_APP_HOST}/api/admin/logIn`
      } else {
        apiUrl = `${process.env.REACT_APP_HOST_SECOND}/api/admin/logIn`
      }
      postApi(`${apiUrl}`, values, headers)
        .then(async (response) => {
          // You can access the response data using apiOtpResponse in your component
          toast.success(response?.message || "Login successful!");
          dispatch(userLogin());
          dispatch(userRole(response?.isAdmin));
          dispatch(userBranch(response?.isBranch));
          localStorage.setItem('user', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          localStorage.setItem('isAdmin', response.isAdmin);
          localStorage.setItem('branch', response.isBranch);
          localStorage.setItem('email', response.email);
          localStorage.setItem('name', response.name);
          localStorage.setItem('cm', cm);
          navigate('/', { replace: true });
          dispatch({ type: actionTypes.MENU_OPEN, isOpen: 'dashboard' });
          setSubmitting(false);
          setBtnDisable(false);
          resetForm()
        })
        .catch((error) => {
          setBtnDisable(false);

        });
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      setBtnDisable(false);
    }
  }

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Invalid email').required('Email is required'),
          password: Yup.string().matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]{8,}$/, 'Password must contain at least one uppercase letter, one number, and one special character')
            .required(`password is required`)
        })}
        onSubmit={handleSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...rest}>
            <TextField
              error={Boolean(touched.email && errors.email)}
              fullWidth
              helperText={touched.email && errors.email}
              label="Email Address / Username"
              margin="normal"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              type="email"
              value={values.email}
              variant="outlined"
            />

            <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ mt: theme.spacing(3), mb: theme.spacing(1) }}>
              <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {touched.password && errors.password && (
                <FormHelperText error id="standard-weight-helper-text">
                  {' '}
                  {errors.password}{' '}
                </FormHelperText>
              )}
            </FormControl>

            {errors.submit && (
              <Box mt={3}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            <Box mt={2}>
              <Button color="primary" fullWidth size="large" disabled={btnDisable} type="submit" variant="contained">
                Log In
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <ToastContainer autoClose={1500} />
    </>
  );
};

export default FirebaseLogin;

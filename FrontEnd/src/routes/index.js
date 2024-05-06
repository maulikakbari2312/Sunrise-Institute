import { useSelector } from 'react-redux';
import { useRoutes } from 'react-router-dom';
import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
import { useEffect, useState } from 'react';

export default function ThemeRoutes() {
  const MainRouter = MainRoutes()
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
  const routes = userData ? [MainRouter] : [AuthenticationRoutes];
  return useRoutes(routes);
}

import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { userLogout } from "store/action";

// Function to make a GET request
export const useApi = () => {
  const dispatch = useDispatch();
  const modelData = useSelector((state) => state.selected.modelData?.fieldData);
  const isBranch = useSelector((state) => state.user?.userBranch);
  const isAdmin = useSelector((state) => state.user?.isAdmin);
  const getApi = async (url, body = null) => {
    try {
      const cm = localStorage.getItem('cm');
      if (!url.includes("/api/admin/logIn")) {
        // Dynamically set the base URL based on the value of `cm`
        if (cm == "true" || cm === true) {
          url = `${process.env.REACT_APP_HOST}${url}`;
        } else {
          url = `${process.env.REACT_APP_HOST_SECOND}${url}`;
        }
      }
      let headers = {
        'Content-type': 'application/json',
        'authorization': localStorage.getItem('token')
      }
      const config = {
        headers,
      };
      let editUrl = url;
      if (!url.includes(`/api/admin/UserList`)) {
        editUrl = `${url}/${isAdmin}/${isBranch}`
      }

      if (body !== null) {
        let requestData = body;

        // Check if data is of type FormData, if not, trim keys and string values
        if (!(body instanceof FormData)) {
          const trimmedData = {};

          Object.keys(body).forEach(key => {
            const trimmedKey = key.trim();
            let trimmedValue = typeof body[key] === 'string' ? body[key].trim() : body[key];
            if (body[key] === "pcs" || body[key] === "denier") {
              trimmedValue = parseInt(body[key]);
            }
            // Check if the key is 'date' and format its value as dd/mm/yyyy
            if (trimmedKey.toLowerCase() === 'date' && trimmedValue instanceof Date) {
              const day = String(trimmedValue.getDate()).padStart(2, '0');
              const month = String(trimmedValue.getMonth() + 1).padStart(2, '0'); // Month is zero-based
              const year = trimmedValue.getFullYear();
              trimmedValue = `${day}/${month}/${year}`;
            }

            trimmedData[trimmedKey] = trimmedValue;
          });
          requestData = trimmedData;
        }

        // Use axios.post instead of axios.get

        const response = await axios.post(editUrl, requestData, config);
        return response?.data;
      } else {
        // If no body is provided, make a GET request
        const response = await axios.get(editUrl, config);
        return response?.data;
      }
    } catch (error) {
      // Dispatching an action using redux-thunk
      if (error.response?.status == 401) {
        dispatch(userLogout()); // Dispatch the action to log the user out
      }
      throw error.response?.data || error.response?.data?.message;
    }
  };

  const postApi = async (url, data,) => {
    let headers = {
      'Content-type': 'application/json',
      'authorization': localStorage.getItem('token')
    }
    const cm = localStorage.getItem('cm');
    try {
      if (!url.includes("/api/admin/logIn")) {
        // Dynamically set the base URL based on the value of `cm`
        if (cm == "true" || cm === true) {
          url = `${process.env.REACT_APP_HOST}${url}`;
        } else {
          url = `${process.env.REACT_APP_HOST_SECOND}${url}`;
        }
      }
      let requestData = data;
      if (!(data instanceof FormData)) {
        const trimmedData = {};
        Object.keys(data).forEach(key => {
          const trimmedKey = key.trim();
          let trimmedValue = typeof data[key] === 'string' ? data[key].trim() : data[key];
          const matchedModel = modelData?.find(item => item?.name?.split(' ').map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)).join('') === trimmedKey);
          if (matchedModel && matchedModel.type === 'number') {
            trimmedValue = parseFloat(trimmedValue);
            if (isNaN(trimmedValue)) {
              trimmedValue = data[key];
            }
          }
          if (trimmedKey.toLowerCase() === 'date') {
            // Check if the key is 'date' and convert its value to dd/mm/yyyy format
            const dateParts = trimmedValue.split('-');
            if (dateParts.length === 3) {
              const [year, month, day] = dateParts;
              const formattedDate = `${day}/${month}/${year}`;
              trimmedValue = formattedDate;
            }
          }

          trimmedData[trimmedKey] = trimmedValue;
        });
        requestData = trimmedData;
      } else {
        headers['Content-type'] = 'multipart/form-data'
      }
      let editUrl = url;
      if (!url.includes(`/api/admin/logIn`) && !url.includes(`/api/admin/editUserList`)) {
        editUrl = `${url}/${isAdmin}/${isBranch}`
      }
      const response = await axios.post(editUrl, requestData, { headers });
      return response?.data;
    } catch (error) {
      if (error.response?.status == 401) {
        dispatch(userLogout()); // Dispatch the action to log the user out
      }
      throw error?.response?.data;
    }
  };

  const putApi = async (url, data) => {
    let headers = {
      'Content-type': 'application/json',
      'authorization': localStorage.getItem('token')
    }
    const cm = localStorage.getItem('cm');
    try {
      if (!url.includes("/api/admin/logIn")) {
        // Dynamically set the base URL based on the value of `cm`
        if (cm == "true" || cm === true) {
          url = `${process.env.REACT_APP_HOST}${url}`;
        } else {
          url = `${process.env.REACT_APP_HOST_SECOND}${url}`;
        }
      }
      let requestData = data;

      if (!(data instanceof FormData)) {
        const trimmedData = {};

        Object.keys(data).forEach(key => {
          const trimmedKey = key.trim();
          let trimmedValue = typeof data[key] === 'string' ? data[key].trim() : data[key];

          const matchedModel = modelData?.find(item => item.name.split(' ').map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)).join('') === trimmedKey);
          if (matchedModel && matchedModel.type === 'number') {
            trimmedValue = parseFloat(trimmedValue);
            if (isNaN(trimmedValue)) {
              trimmedValue = data[key];
            }
          }

          if (trimmedKey.toLowerCase() === 'date') {
            const dateParts = trimmedValue.split('-');
            if (dateParts.length === 3) {
              const [year, month, day] = dateParts;
              const formattedDate = `${day}/${month}/${year}`;
              trimmedValue = formattedDate;
            }
          }

          trimmedData[trimmedKey] = trimmedValue;
        });
        requestData = trimmedData;
      } else {
        headers['Content-type'] = 'multipart/form-data'
      }
      let editUrl = url;

      // Check if the url does not match the specified values after replacing the UUID
      if (!url.includes(`/api/admin/logIn`) && !url.includes(`/api/admin/editUserList`)) {
        // If the condition is true, append /${isAdmin}/${isBranch} to the editUrl
        editUrl = `${url}/${isAdmin}/${isBranch}`;
      }

      const response = await axios.put(editUrl, requestData, { headers });
      return response?.data;
    } catch (error) {
      if (error.response?.status == 401) {
        dispatch(userLogout()); // Dispatch the action to log the user out
      }
      throw error.response?.data || error.response?.data?.message;
    }
  };

  const patchApi = async (url, data) => {
    let headers = {
      'Content-type': 'application/json',
      'authorization': localStorage.getItem('token')
    }
    const cm = localStorage.getItem('cm');
    try {
      if (!url.includes("/api/admin/logIn")) {
        // Dynamically set the base URL based on the value of `cm`
        if (cm == "true" || cm === true) {
          url = `${process.env.REACT_APP_HOST}${url}`;
        } else {
          url = `${process.env.REACT_APP_HOST_SECOND}${url}`;
        }
      }
      let requestData = data;

      const response = await axios.patch(`${url}/${isAdmin}/${isBranch}`, requestData, headers);
      return response?.data;
    } catch (error) {
      if (error.response?.status == 401) {
        dispatch(userLogout()); // Dispatch the action to log the user out
      }
      throw error?.response?.data;
    }
  };

  const deleteApi = async (url) => {
    const cm = localStorage.getItem('cm');
    if (!url.includes("/api/admin/logIn")) {
      // Dynamically set the base URL based on the value of `cm`
      if (cm == "true" || cm === true) {
        url = `${process.env.REACT_APP_HOST}${url}`;
      } else {
        url = `${process.env.REACT_APP_HOST_SECOND}${url}`;
      }
    }
    let headers = {
      'Content-type': 'application/json',
      'authorization': localStorage.getItem('token')
    }
    try {
      const response = await axios.delete(`${url}/${isAdmin}/${isBranch}`, { headers });
      return response?.data;
    } catch (error) {
      if (error.response?.status == 401) {
        dispatch(userLogout()); // Dispatch the action to log the user out
      }
      throw error.response?.data || error.response?.data?.message;
    }
  };

  return { getApi, postApi, putApi, deleteApi, patchApi };
};

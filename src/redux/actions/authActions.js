import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { loginURL,registerURL } from './constants';
import { login } from '../slices/authSlice';


export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, getState }) => {
    const response = await axios.post(loginURL, { email, password });
    console.log('Response:', response);

    // Dispatch the login action with the user data
    dispatch(login(response.data.user));

    // To get the state of 'isAuthenticated' you can access it with getState
    console.log('AuthState', getState().auth.isAuthenticated);  
    console.log(getState().auth.isAuthenticated);

    return response.data;
  }
);

// export const loginUser = createAsyncThunk(
//   'auth/login',
//   async ({ email, password }) => {
//     const response = await axios.post(loginURL, { email, password });
//     // if (!response.ok) {
//     //   throw new Error('Login failed');
//     // }
//     console.log('inside hook');
//     console.log('Response:', response);
//     // const data = await response.json();
//     // return data;
//     // useDispatch(login(response.data.user));
//     // console.log(useSelector((state) => state.auth.isAuthenticated));
//     return response.data;
//   }
// );

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password,userName }) => {
    console.log('Register user:', email , password,userName);
    console.log('Register user:', { email, password,userName });
    const response = await axios.post(registerURL, { userName,email, password},
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
      withCredentials: true
      }
    );
    console.log('Register user:', response.data);
    return response.data;
  }
);


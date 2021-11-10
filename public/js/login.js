/* eslint-disable */
import '@babel/polyfill';
import axios from 'axios';
import {showAlert} from './alert';

export const login = async (email, password) => {
    try{
        console.log(email);
        console.log(password);
        const res = await axios({
          method: 'POST',
          data: {
            email:email,
            password:password
          },
          url: `http://127.0.0.1:1000/api/v1/users/login`,
        });
        console.log(res);
        if(res.data.status === 'Passed'){
          showAlert('success' , 'logged in successfully');
          window.setTimeout(() => {
            location.assign('/'); // location means the route assignment
          }, 1500);
        }
    }
    catch(err){
          showAlert('error' , 'err.response.data.message');
    }
};

// Logout Ninja Technique Which says send a response with dummy token and baam also expire it . so user wont be found and above navbar will dissapaer

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:1000/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.reload(true); // this line imp to avoid cache interruption
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};

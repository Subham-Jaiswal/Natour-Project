/* eslint-disable */
import axios from 'axios';
import {showAlert} from './alert';

export const update = async (data, type) => {
    try {
      const url =
        type === 'password'
          ? 'http://127.0.0.1:1000/api/v1/users/UpdatePassword'
          : 'http://127.0.0.1:1000/api/v1/users/updateMe';
  
      const res = await axios({
        method: 'PATCH',
        url,
        data
      });
      console.log(res);
      if (res.data.status === 'Done') {
        showAlert('success', `${type.toUpperCase()} updated successfully!`);
      }
      if( res.data.status === 'Passed') {
        showAlert('success', `${type.toUpperCase()} updated successfully!`);
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  };
  
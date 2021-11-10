/* eslint-disable */


import '@babel/polyfill';
import { login , logout } from './login';
import {displayMap} from './mapbox';
import {update} from './updateSettings';
import { bookTour } from './stripe';

const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form.login-form');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form.form-user-data'); 
const updatePass = document.querySelector('.form.form-user-password'); 
const bookBtn = document.getElementById('book-tour');
if(mapbox){

  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}
if(loginForm){
 
  console.log('inside-login-form')

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
    login(email, password);
})
}


if(logOutBtn){
  logOutBtn.addEventListener('click', logout);

}

if(updateForm)
{ 
  console.log('entered updating');
  updateForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
  let data = {
    email,
    name
  }
  update(data,'data');
})
}

if(updatePass)
{ 
  console.log('entered Pass updating');
  updatePass.addEventListener('submit', e => {
    e.preventDefault();
    
    const password = document.getElementById('password-current').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const newPassword = document.getElementById('password').value;
  let data = {
    password, 
    passwordConfirm,
    newPassword

  }
  update(data , 'password');
})
}

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

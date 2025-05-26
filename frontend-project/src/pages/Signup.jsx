import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });

  const validate = () => {
    let tempErrors = { username: '', password: '' };
    let isValid = true;

    if (formData.username.trim().length < 3) {
      tempErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    if (formData.password.trim().length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await axios.post("http://localhost:5000/api/signup", formData);
      alert(res.data.message);
      navigate('/');
      setFormData({ username: '', password: '' });
      setErrors({ username: '', password: '' });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message); 
      } else {
        alert('An unexpected error occurred'); 
      }
    }
  };

  return (
    <div>
      <div className='flex justify-center pt-16'>
        <form onSubmit={handleSubmit} className='flex flex-col w-96 bg-white rounded p-8 space-y-4 shadow-md'>
          <h1 className='flex justify-center font-medium text-lg'>Sign Up</h1>

          <div>
            <input
              type='text'
              name='username'
              placeholder='Username'
              className='input  w-full'
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && (
              <p className='text-sm text-red-500 mt-1'>{errors.username}</p>
            )}
          </div>

          <div>
            <input
              type='password'
              name='password'
              placeholder='Password'
              className='input  w-full'
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className='text-sm text-red-500 mt-1'>{errors.password}</p>
            )}
          </div>

          <button type='submit' className='bg-black text-white font-medium rounded p-2 shadow-sm cursor-pointer'>
            Sign Up
          </button>

          <span className='text-sm'>
            Already have an account?{' '}
            <Link to="/" className='text-blue-500 underline'>
              Login
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Signup;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api'; // Use the apiClient

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let tempErrors = {};
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
    setErrors({ ...errors, [e.target.name]: '' }); // Clear specific error on change
    setServerError(''); // Clear server error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Corrected API endpoint
      const res = await apiClient.post("/auth/register", formData); 
      // alert(res.data.message); // Replace alert
      console.log('Signup successful:', res.data.message);
      navigate('/'); // Redirect to login page
      // Optionally show a success message on the login page via state or query params
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setServerError(error.response.data.error);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className='card-title text-3xl justify-center text-primary mb-6'>Create Account</h1>
          
          {serverError && (
            <div role="alert" className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type='text'
                name='username'
                placeholder='Enter your username'
                className={`input input-bordered w-full ${errors.username ? 'input-error' : 'input-primary'}`}
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <label className="label"><span className='label-text-alt text-error'>{errors.username}</span></label>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type='password'
                name='password'
                placeholder='Enter your password'
                className={`input input-bordered w-full ${errors.password ? 'input-error' : 'input-primary'}`}
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <label className="label"><span className='label-text-alt text-error'>{errors.password}</span></label>}
            </div>

            <button 
              type='submit' 
              className='btn btn-primary w-full'
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner"></span> : 'Sign Up'}
            </button>

            <p className='text-center text-sm mt-4'>
              Already have an account?{' '}
              <Link to="/" className='link link-secondary'>
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Signup;
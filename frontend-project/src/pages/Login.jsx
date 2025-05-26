import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api'; // Use the apiClient

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password) {
      setError("Username and password are required.");
      return;
    }
    setIsLoading(true);
    try {
      // Corrected API endpoint
      const res = await apiClient.post("/auth/login", formData);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      // Optionally store user info if needed, e.g., for display
      localStorage.setItem('user', JSON.stringify(user)); 
      console.log('Login successful:', res.data.message);
      navigate('/home');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please check your credentials or try again later.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className='card-title text-3xl justify-center text-primary mb-6'>Welcome Back!</h1>
          
          {error && (
            <div role="alert" className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
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
                placeholder='Your username'
                className='input input-bordered w-full input-primary'
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type='password' // Changed to password type
                name='password'
                placeholder='Your password'
                className='input input-bordered w-full input-primary'
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button 
              type='submit' 
              className='btn btn-primary w-full'
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner"></span> : 'Login'}
            </button>
            <p className='text-center text-sm mt-4'>
              Don't have an account?{' '}
              <Link to="/signup" className='link link-secondary'>
                Sign up now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;
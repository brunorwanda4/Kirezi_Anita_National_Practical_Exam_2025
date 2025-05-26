import axios from 'axios';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
            username: '',
            password: ''
        });
        const handleChange = (e) => {
            setFormData({...formData, [e.target.name]: e.target.value})
        }
        const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/api/login", formData);
            const { token } = res.data;
            localStorage.setItem('token', token);
            alert(res.data.message);
            navigate('/home');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message); 
      } else {
        alert('An unexpected error occurred');
        }
    }
}

  return (
    <div>
        <div className='flex justify-center pt-16'>
            <form onSubmit={handleSubmit} className='flex flex-col w-96 bg-white rounded p-8 space-y-4 shadow-md'>
                <h1 className='flex justify-center font-medium'>Login</h1>
                <input
                type='text'
                name='username'
                placeholder='userName'
                className='input w-full'
                value={formData.username}
                onChange={handleChange}
                required
                />
                <input
                type='text'
                name='password'
                placeholder='Password'
                className='input w-full'
                value={formData.password}
                onChange={handleChange}
                required
                />
                <button type='submit' className='bg-black shadow-sm text-white font-medium rounded p-2 cursor-pointer'>Login</button>
                <span>don't have account <Link to= "/signup" className='text-sm text-blue-500 border-b-2'>Signup</Link>?</span>
            </form>
        </div>
    </div>
  )
}

export default Login
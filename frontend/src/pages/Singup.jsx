import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/user/', { name, email, password });
      login(response.data.data, response.data.data.token);
      alert('Signup successful!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      alert(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="relative bg-white/10 backdrop-blur-xl text-white p-8 rounded-2xl shadow-2xl w-96 border border-white/20">
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-10 blur-xl pointer-events-none" />

        <h2 className="text-3xl font-extrabold mb-6 text-center text-white tracking-wide">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="mb-5">
            <label className="block text-sm font-semibold text-white/90 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 
                         focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-white/70"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-white/90 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 
                         focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-white/70"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-white/90 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 
                         focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-white/70"
              required
            />
          </div>

          {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2.5 
                       rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 
                       shadow-lg hover:shadow-pink-400/50"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/80">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-pink-300 font-semibold hover:text-white underline transition-all"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

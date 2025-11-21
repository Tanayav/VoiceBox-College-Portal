import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Key, ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [showAdminChallenge, setShowAdminChallenge] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [tempUserUid, setTempUserUid] = useState(null); 

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginAttempt = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Verifying credentials...");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      toast.dismiss(toastId);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.isApproved === false) {
            toast.error("Access Denied: Account Pending Approval.");
            setLoading(false);
            return;
        }
        if (userData.role === 'admin') {
          toast("Admin detected. Verify identity.", { icon: '👮‍♂️' });
          setTempUserUid(user.uid);
          setShowAdminChallenge(true);
          setLoading(false);
        } else {
          toast.success("Welcome back!");
          navigate('/dashboard');
        }
      } else {
        toast.success("Welcome back!");
        navigate('/dashboard');
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Login Error:", error);
      toast.error("Invalid Email or Password.");
      setLoading(false);
    }
  };

  const handleAdminVerify = (e) => {
    e.preventDefault();
    if (adminKey === 'VOICEBOX2025') {
      toast.success("Identity Verified. Access Granted.");
      navigate('/admin-dashboard');
    } else {
      toast.error("Security Alert: Incorrect Key!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      {/* BACK BUTTON */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className={`${showAdminChallenge ? 'bg-gray-900' : 'bg-blue-600'} p-8 text-center transition-colors duration-500`}>
          {showAdminChallenge ? (
            <>
              <ShieldCheck className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">Security Check</h2>
              <p className="text-gray-400">Admin Verification Required</p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-blue-100">Login to continue</p>
            </>
          )}
        </div>

        {!showAdminChallenge && (
          <form onSubmit={handleLoginAttempt} className="p-8 space-y-6">
            <div className="relative"><Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" /><input type="email" name="email" placeholder="College Email ID" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" onChange={handleChange} /></div>
            <div className="relative"><Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" /><input type="password" name="password" placeholder="Password" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" onChange={handleChange} /></div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" /> : 'Login'}{!loading && <ArrowRight size={20} />}</button>
            <div className="text-center text-gray-500 text-sm mt-4">Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Sign Up</Link></div>
          </form>
        )}

        {showAdminChallenge && (
          <form onSubmit={handleAdminVerify} className="p-8 space-y-6 bg-gray-50">
             <div className="text-sm text-gray-600 text-center mb-4">This account has Administrative privileges. Please enter your Access Key to continue.</div>
             <div className="relative"><Key className="absolute left-3 top-3 text-gray-900 w-5 h-5" /><input type="password" placeholder="Enter Admin Access Key" required autoFocus className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-900" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} /></div>
            <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition flex items-center justify-center gap-2">Verify Identity <ShieldCheck size={18} /></button>
            <button type="button" onClick={() => setShowAdminChallenge(false)} className="w-full text-gray-500 text-sm hover:underline">Cancel Login</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
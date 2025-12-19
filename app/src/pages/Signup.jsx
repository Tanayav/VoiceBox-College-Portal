import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, GraduationCap, FileText, ArrowRight, ShieldAlert, Key, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Roles: 'student' or 'admin'
  const [selectedRole, setSelectedRole] = useState('student'); 
  const [adminCode, setAdminCode] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
    collegeName: 'Select College',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validations
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (formData.collegeName === 'Select College') {
      toast.error("Please select your college.");
      return;
    }

    // 2. Admin Security Check
    if (selectedRole === 'admin' && adminCode !== 'VOICEBOX2025') {
      toast.error("Access Denied: Invalid Admin Access Key.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating account...");

    try {
      // 3. Create User in Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: formData.fullName
      });

      // 4. Determine Approval Status
      // Admins = Locked (false) until approved
      // Students = Active (true) immediately
      const isApprovedStatus = selectedRole === 'admin' ? false : true;

      // 5. Save Profile to Database
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        rollNumber: formData.rollNumber,
        collegeName: formData.collegeName,
        role: selectedRole,
        isApproved: isApprovedStatus, 
        createdAt: serverTimestamp()
      });
      
      toast.dismiss(toastId);

      // 6. Redirect based on Role
      if (selectedRole === 'admin') {
        toast.success("Admin Account Created!");
        toast("Account PENDING APPROVAL.", { 
            icon: '🔒', 
            duration: 6000,
            style: { border: '1px solid #EAB308', padding: '16px', color: '#713200' }
        });
        navigate('/login');
      } else {
        toast.success("Student Account Created! Welcome.");
        navigate('/dashboard');
      }

    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error signing up:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      
      {/* Back to Home Button */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className={`${selectedRole === 'admin' ? 'bg-gray-900' : 'bg-blue-600'} p-8 text-center transition-colors duration-300`}>
          <h2 className="text-3xl font-bold text-white mb-2">Join VoiceBox</h2>
          <p className="text-blue-100">
            Create an {selectedRole === 'admin' ? 'Administrative' : 'Student'} account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          
          {/* Role Toggles */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition flex items-center justify-center gap-2
                ${selectedRole === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User size={16} /> Student
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition flex items-center justify-center gap-2
                ${selectedRole === 'admin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ShieldAlert size={16} /> Admin
            </button>
          </div>

          {/* Input Fields */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="text" name="fullName" placeholder="Full Name" required
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="email" name="email" placeholder="College Email ID" required
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              onChange={handleChange}
            />
          </div>

          {/* Conditional Fields based on Role */}
          {selectedRole === 'student' && (
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input 
                type="text" name="rollNumber" placeholder="Roll Number / ID" required
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                onChange={handleChange}
              />
            </div>
          )}

          {selectedRole === 'admin' && (
            <div className="relative">
              <Key className="absolute left-3 top-3 text-gray-900 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Enter Admin Access Key" 
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 bg-gray-50"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1 ml-1">
                * Available via IT Department
              </p>
            </div>
          )}

          <div className="relative">
            <GraduationCap className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <select 
              name="collegeName" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-600"
              onChange={handleChange}
            >
              <option>Select College</option>
              <option value="MES IMCC">MES IMCC</option>
              <option value="IIT Bombay">IIT Bombay</option>
              <option value="NIT Delhi">NIT Delhi</option>
              <option value="VIT Pune">VIT Pune</option>

            </select>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="password" name="password" placeholder="Password" required
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="password" name="confirmPassword" placeholder="Confirm Password" required
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2
              ${selectedRole === 'admin' ? 'bg-gray-900 hover:bg-black' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Creating Account...' : `Sign Up as ${selectedRole === 'admin' ? 'Admin' : 'Student'}`}
            {!loading && <ArrowRight size={20} />}
          </button>

          <div className="text-center text-gray-500 text-sm mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Signup;
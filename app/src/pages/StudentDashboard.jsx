import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, serverTimestamp, updateDoc, doc, increment, arrayUnion, getDoc, orderBy, limit } from 'firebase/firestore';
import { 
  LayoutDashboard, Plus, LogOut, Search, Filter, 
  FileText, Users, MessageSquare, ChevronRight, 
  Clock, Bell, ThumbsUp, Loader2, RefreshCw, 
  Settings, User, TrendingUp, X, Mail, Shield, Megaphone, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // --- DATA STATES ---
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [complaints, setComplaints] = useState([]);
  const [petitions, setPetitions] = useState([]);
  const [announcements, setAnnouncements] = useState([]); // NEW: Real Data State
  
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [petitionStats, setPetitionStats] = useState({ active: 0, totalSupporters: 0, successful: 0 });
  
  // --- FILTERS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // --- FORMS ---
  const [complaintForm, setComplaintForm] = useState({ 
    title: '', 
    category: 'Academics', 
    description: '', 
    priority: 'Medium', 
    isAnonymous: false 
  });
  const [petitionForm, setPetitionForm] = useState({ title: '', category: 'Infrastructure', target: 100, description: '' });

  // --- AUTO-RESET FILTERS ---
  useEffect(() => {
    setSearchTerm('');
    setStatusFilter('All Status');
  }, [activeTab]);

  // --- FETCH DATA ---
  useEffect(() => {
    if (user) fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch User Complaints
      const q = query(collection(db, "complaints"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      const userComplaints = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      userComplaints.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      
      setComplaints(userComplaints);
      setStats({
        total: userComplaints.length,
        pending: userComplaints.filter(c => c.status === 'Pending').length,
        inProgress: userComplaints.filter(c => c.status === 'In Progress').length,
        resolved: userComplaints.filter(c => c.status === 'Resolved').length
      });

      // 2. Fetch Public Petitions
      const pSnap = await getDocs(collection(db, "petitions"));
      const allPetitions = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPetitions(allPetitions);

      // Calculate Petition Stats
      const active = allPetitions.filter(p => (p.currentSupporters || 0) < (p.target || 100)).length;
      const successful = allPetitions.filter(p => (p.currentSupporters || 0) >= (p.target || 100)).length;
      const totalSupporters = allPetitions.reduce((acc, curr) => acc + (curr.currentSupporters || 0), 0);
      setPetitionStats({ active, successful, totalSupporters });

      // 3. Fetch Campus Announcements (NEW)
      const annQuery = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(5));
      const annSnap = await getDocs(annQuery);
      const annData = annSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(annData);

    } catch (error) {
      console.error("Fetch error:", error);
      // Don't show error toast on initial load to keep it clean, console log is enough
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchData();
    toast.success("Dashboard updated");
  };

  // --- FILTER LOGIC ---
  const getFilteredComplaints = () => {
    return complaints.filter(c => {
      const matchesSearch = (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (c.id || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredPetitions = () => {
    return petitions.filter(p => (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()));
  };

  // --- ACTIONS ---
  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out");
    navigate('/login');
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Submitting...");
    try {
      await addDoc(collection(db, "complaints"), {
        uid: user.uid,
        userName: complaintForm.isAnonymous ? "Anonymous" : user.displayName,
        title: complaintForm.title,
        category: complaintForm.category,
        description: complaintForm.description,
        isAnonymous: complaintForm.isAnonymous,
        priority: complaintForm.priority,
        status: "Pending",
        createdAt: serverTimestamp(),
        collegeName: "VIT Pune"
      });
      toast.success("Complaint Submitted!", { id: toastId });
      setComplaintForm({ title: '', category: 'Academics', description: '', priority: 'Medium', isAnonymous: false });
      setActiveTab('track-complaints');
      fetchData();
    } catch (err) {
      toast.error("Failed to submit", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handlePetitionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Launching petition...");
    try {
      await addDoc(collection(db, "petitions"), {
        uid: user.uid,
        createdBy: user.displayName,
        title: petitionForm.title,
        category: petitionForm.category,
        description: petitionForm.description,
        target: Number(petitionForm.target),
        currentSupporters: 0,
        supportersList: [],
        status: "Active",
        createdAt: serverTimestamp()
      });
      toast.success("Petition Live!", { id: toastId });
      setPetitionForm({ title: '', category: 'Infrastructure', target: 100, description: '' });
      setActiveTab('view-petitions');
      fetchData();
    } catch (err) {
      toast.error("Failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async (id) => {
    try {
      const ref = doc(db, "petitions", id);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().supportersList?.includes(user.uid)) {
        toast.error("You already supported this!");
        return;
      }
      await updateDoc(ref, {
        currentSupporters: increment(1),
        supportersList: arrayUnion(user.uid)
      });
      toast.success("Signed Petition!");
      fetchData();
    } catch (err) {
      toast.error("Error supporting petition");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">VoiceBox</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Plus size={18} />} label="File Complaint" active={activeTab === 'file-complaint'} onClick={() => setActiveTab('file-complaint')} />
          <SidebarItem icon={<FileText size={18} />} label="Track Complaints" active={activeTab === 'track-complaints'} onClick={() => setActiveTab('track-complaints')} />
          <SidebarItem icon={<Users size={18} />} label="View Petitions" active={activeTab === 'view-petitions' || activeTab === 'start-petition'} onClick={() => setActiveTab('view-petitions')} />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition text-sm">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 p-8 relative">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' && 'Student Dashboard'}
              {activeTab === 'file-complaint' && 'File a New Complaint'}
              {activeTab === 'track-complaints' && 'Track Your Complaints'}
              {activeTab === 'view-petitions' && 'Community Petitions'}
              {activeTab === 'start-petition' && 'Start a Petition'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.displayName}</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleManualRefresh} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
              <Settings size={16} /> Settings
            </button>
            <div className="h-8 w-[1px] bg-gray-300 mx-1"></div>
            <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 pl-2 hover:bg-gray-50 p-1 rounded-lg transition">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                {user?.displayName?.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Profile</span>
            </button>
          </div>
        </header>

        {/* === TAB: DASHBOARD OVERVIEW (With Real Announcements) === */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in-up space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Complaints" value={stats.total} />
              <StatCard label="Resolved" value={stats.resolved} valueColor="text-green-600" />
              <StatCard label="In Progress" value={stats.inProgress} valueColor="text-blue-600" />
              <StatCard label="Pending" value={stats.pending} valueColor="text-orange-500" />
            </div>

            {/* Dashboard Split */}
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Announcements Widget (REAL DATA) */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Megaphone size={20} className="text-blue-600"/> Campus Announcements
                </h3>
                
                <div className="space-y-4">
                  {announcements.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No active announcements.</p>
                  ) : (
                    announcements.map(ann => (
                      <div key={ann.id} className={`p-3 rounded-lg border ${ann.priority === 'High' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                        <p className={`text-sm font-semibold ${ann.priority === 'High' ? 'text-red-800' : 'text-gray-800'}`}>
                          {ann.title}
                        </p>
                        <p className={`text-xs mt-1 ${ann.priority === 'High' ? 'text-red-600' : 'text-gray-600'}`}>
                          {ann.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 text-right">
                          {new Date(ann.createdAt?.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Complaints</h3>
                {complaints.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent activity.</p>
                ) : (
                  <div className="space-y-3">
                    {complaints.slice(0, 3).map(c => (
                      <div key={c.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${c.status === 'Resolved' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{c.title}</p>
                            <p className="text-xs text-gray-500">{new Date(c.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-400">{c.status}</span>
                      </div>
                    ))}
                    <button onClick={() => setActiveTab('track-complaints')} className="w-full text-center text-sm text-blue-600 font-medium mt-2 hover:underline">View All</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === TAB: TRACK COMPLAINTS === */}
        {activeTab === 'track-complaints' && (
          <div className="animate-fade-in-up">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by title or ID..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-50" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {getFilteredComplaints().length === 0 ? (
                <EmptyState message="No complaints found." action={() => setActiveTab('file-complaint')} actionText="File a Complaint" />
              ) : (
                getFilteredComplaints().map(complaint => (
                  <div key={complaint.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition duration-200">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold font-mono uppercase tracking-wider">
                        CMP-{complaint.id.slice(0, 4)}
                      </span>
                      <StatusBadge status={complaint.status} />
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority} Priority
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{complaint.title}</h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">{complaint.description}</p>
                    <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 border-b border-gray-100 pb-4 mb-4">
                      <div className="flex items-center gap-2"><LayoutDashboard size={14} /><span className="font-medium">{complaint.category}</span></div>
                      <div className="flex items-center gap-2"><Clock size={14} /><span>{new Date(complaint.createdAt?.seconds * 1000).toLocaleDateString()}</span></div>
                      <div className="flex items-center gap-2"><User size={14} /><span>{complaint.isAnonymous ? "Anonymous" : user.displayName}</span></div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button onClick={() => navigate(`/complaint/${complaint.id}`)} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
                        View Full Timeline & Comments <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* === TAB: FILE COMPLAINT === */}
        {activeTab === 'file-complaint' && (
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <button onClick={() => setActiveTab('track-complaints')} className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1">&larr; Back to Dashboard</button>
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Submit a Grievance</h2>
              <form onSubmit={handleComplaintSubmit} className="space-y-6">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Complaint Title <span className="text-red-500">*</span></label><input type="text" required className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={complaintForm.title} onChange={(e) => setComplaintForm({...complaintForm, title: e.target.value})} /></div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label><select className="w-full p-3 bg-white border border-gray-200 rounded-lg" value={complaintForm.category} onChange={(e) => setComplaintForm({...complaintForm, category: e.target.value})}><option>Academics</option><option>Hostel</option><option>Mess/Food</option><option>Infrastructure</option><option>Other</option></select></div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Urgency <span className="text-red-500">*</span></label>
                    <select className="w-full p-3 bg-white border border-gray-200 rounded-lg" value={complaintForm.priority} onChange={(e) => setComplaintForm({...complaintForm, priority: e.target.value})}>
                        <option value="Low">Low - Can wait</option>
                        <option value="Medium">Medium - Standard</option>
                        <option value="High">High - Urgent</option>
                    </select>
                  </div>
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Description <span className="text-red-500">*</span></label><textarea required rows="5" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={complaintForm.description} onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}></textarea></div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3"><input type="checkbox" id="anon" className="mt-1 w-4 h-4 text-blue-600 rounded" checked={complaintForm.isAnonymous} onChange={(e) => setComplaintForm({...complaintForm, isAnonymous: e.target.checked})} /><label htmlFor="anon" className="text-sm text-gray-700 cursor-pointer"><span className="font-bold block text-gray-900">Submit Anonymously</span>Your identity will be hidden from the administration.</label></div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin" /> : 'Submit Complaint'}</button>
              </form>
            </div>
          </div>
        )}

        {/* === TAB: VIEW PETITIONS === */}
        {activeTab === 'view-petitions' && (
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Active" value={petitionStats.active} valueColor="text-blue-600" />
              <StatCard label="Supporters" value={petitionStats.totalSupporters} valueColor="text-green-600" />
              <StatCard label="Successful" value={petitionStats.successful} valueColor="text-purple-600" />
              <StatCard label="Trending" value={petitions.filter(p => (p.currentSupporters || 0) > 20).length} valueColor="text-orange-500" />
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search petitions..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={() => setActiveTab('start-petition')} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition flex items-center gap-2"><Plus size={16} /> Start a Petition</button>
            </div>

            <div className="space-y-6">
              {getFilteredPetitions().length === 0 ? (
                 <EmptyState message="No petitions found." action={() => setActiveTab('start-petition')} actionText="Start a Petition" />
              ) : (
                getFilteredPetitions().map(petition => {
                  const progress = Math.min(((petition.currentSupporters || 0) / (petition.target || 100)) * 100, 100);
                  const isTrending = (petition.currentSupporters || 0) > 20; 
                  
                  return (
                    <div key={petition.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between mb-4">
                        <div className="flex gap-2">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">PET-{petition.id.slice(0,4)}</span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">Active</span>
                          {isTrending && (
                            <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"><TrendingUp size={10} /> Trending</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(petition.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{petition.title}</h3>
                      <div className="mb-6">
                          <div className="flex justify-between text-sm mb-2"><span className="font-bold text-gray-900">{petition.currentSupporters} <span className="font-normal text-gray-500">supporters ({progress.toFixed(1)}%)</span></span></div>
                          <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-black h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                          <div className="text-xs text-gray-500">Created by <span className="font-medium text-gray-700">{petition.createdBy}</span></div>
                          <button 
                            onClick={() => handleSupport(petition.id)} 
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition flex items-center gap-2"
                          >
                            <ThumbsUp size={16} /> Sign Petition
                          </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* === TAB: START PETITION FORM === */}
        {activeTab === 'start-petition' && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <button onClick={() => setActiveTab('view-petitions')} className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1">&larr; Back to Petitions</button>
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Start a New Petition</h2>
              <form onSubmit={handlePetitionSubmit} className="space-y-6">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Petition Title *</label><input type="text" required className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={petitionForm.title} onChange={(e) => setPetitionForm({...petitionForm, title: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-6">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label><select className="w-full p-3 bg-white border border-gray-200 rounded-lg" value={petitionForm.category} onChange={(e) => setPetitionForm({...petitionForm, category: e.target.value})}><option>Infrastructure</option><option>Academics</option><option>Policy</option><option>Events</option></select></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Goal (Signatures) *</label><input type="number" required min="10" className="w-full p-3 bg-white border border-gray-200 rounded-lg" value={petitionForm.target} onChange={(e) => setPetitionForm({...petitionForm, target: e.target.value})} /></div>
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label><textarea required rows="4" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={petitionForm.description} onChange={(e) => setPetitionForm({...petitionForm, description: e.target.value})}></textarea></div>
                <button disabled={loading} className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin" /> : 'Create Petition'}</button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* --- MODALS --- */}
      
      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-up">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">{user?.displayName?.charAt(0)}</div>
              <h2 className="text-xl font-bold text-gray-900">{user?.displayName}</h2>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mt-2 uppercase">Student Account</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-lg"><Mail size={18} /><span className="text-sm">{user?.email}</span></div>
              <div className="flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-lg"><Clock size={18} /><span className="text-sm">Joined: {new Date(user?.metadata?.creationTime).toLocaleDateString()}</span></div>
              <div className="flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-lg"><Shield size={18} /><span className="text-sm">Verified Student</span></div>
            </div>
            <button onClick={handleLogout} className="w-full mt-6 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition">Sign Out</button>
          </div>
        </div>
      )}

      {/* UPDATED SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-up">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Settings size={20}/> Settings</h2>
            
            <div className="space-y-6">
              
              {/* Section 1 */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div><p className="font-semibold text-gray-800">Email Alerts</p><p className="text-xs text-gray-500">Get updates on your complaint status</p></div>
                    <div className="w-10 h-6 bg-green-500 rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div><p className="font-semibold text-gray-800">Petition News</p><p className="text-xs text-gray-500">Weekly summary of top petitions</p></div>
                    <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div></div>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Privacy & Security</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div><p className="font-semibold text-gray-800">Anonymous by Default</p><p className="text-xs text-gray-500">Hide my name on all new complaints</p></div>
                    <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div></div>
                  </div>
                  <button className="w-full text-left flex justify-between items-center text-blue-600 hover:text-blue-800">
                    <span className="font-medium">Change Password</span> <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Section 3 */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Appearance</h3>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><Moon size={16} /><p className="font-semibold text-gray-800">Dark Mode</p></div>
                  <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-not-allowed" title="Coming Soon"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div></div>
                </div>
              </div>

            </div>
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Cancel</button>
              <button onClick={() => { toast.success("Settings Saved"); setShowSettings(false); }} className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// --- COMPONENTS ---
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition text-sm mb-1 ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>{icon}{label}</button>
);

const StatCard = ({ label, value, valueColor = "text-gray-900" }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center"><span className={`text-3xl font-bold ${valueColor}`}>{value}</span><span className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">{label}</span></div>
);

const StatusBadge = ({ status }) => {
  const styles = { 'Resolved': 'bg-green-100 text-green-700', 'In Progress': 'bg-blue-100 text-blue-700', 'Pending': 'bg-orange-100 text-orange-700' };
  return <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${styles[status] || styles['Pending']}`}>{status}</span>;
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'bg-red-50 text-red-700 border border-red-100';
    case 'Medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
    case 'Low': return 'bg-gray-100 text-gray-600 border border-gray-200';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const EmptyState = ({ message, action, actionText }) => (
  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300"><div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><LayoutDashboard className="text-gray-400" size={24} /></div><p className="text-gray-500 mb-6 font-medium">{message}</p>{action && (<button onClick={action} className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition">{actionText}</button>)}</div>
);

export default StudentDashboard;
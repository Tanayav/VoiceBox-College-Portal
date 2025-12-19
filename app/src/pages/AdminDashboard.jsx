import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, getDocs, doc, updateDoc, orderBy, addDoc, serverTimestamp, deleteDoc, where } from 'firebase/firestore';
import { 
  LayoutDashboard, LogOut, Search, Filter, 
  FileText, MessageSquare, ChevronRight, 
  Clock, User, CheckCircle, Loader2, RefreshCw, 
  Settings, Shield, AlertCircle, Users, Megaphone, Plus, Trash2, X, Mail, Ban, Moon, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // --- CONFIRMATION MODAL STATE ---
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    type: null, 
    id: null,
    data: null 
  });

  // --- DATA STATES ---
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]); 
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- FILTERS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // --- FORMS ---
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', priority: 'Normal' });

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch Complaints
      const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
      
      setStats({
        total: data.length,
        pending: data.filter(c => c.status === 'Pending').length,
        inProgress: data.filter(c => c.status === 'In Progress').length,
        resolved: data.filter(c => c.status === 'Resolved').length
      });

      // 2. Fetch Announcements
      const annQ = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const annSnap = await getDocs(annQ);
      setAnnouncements(annSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 3. Fetch Students
      const usersQ = query(collection(db, "users"), where("role", "==", "student"));
      const usersSnap = await getDocs(usersQ);
      setStudents(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- ACTIONS ---

  const handleStatusUpdate = async (id, newStatus) => {
    const toastId = toast.loading("Updating status...");
    try {
      await updateDoc(doc(db, "complaints", id), { status: newStatus });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast.success(`Updated to ${newStatus}`, { id: toastId });
    } catch (error) {
      toast.error("Failed to update", { id: toastId });
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Posting...");
    try {
      await addDoc(collection(db, "announcements"), {
        title: announcementForm.title,
        message: announcementForm.message,
        priority: announcementForm.priority,
        createdAt: serverTimestamp(),
        createdBy: user.displayName || "Admin"
      });
      toast.success("Announcement Posted!", { id: toastId });
      setAnnouncementForm({ title: '', message: '', priority: 'Normal' });
      fetchAllData(); 
    } catch (error) {
      toast.error("Failed to post", { id: toastId });
    }
  };

  // --- MODAL HANDLERS ---
  const openDeleteAnnouncementModal = (id) => {
    setConfirmModal({ isOpen: true, type: 'delete_announcement', id: id, data: null });
  };

  const openBanModal = (id, currentStatus) => {
    if (currentStatus === false) {
        executeToggleBan(id, currentStatus);
    } else {
        setConfirmModal({ isOpen: true, type: 'toggle_ban', id: id, data: currentStatus });
    }
  };

  const executeDeleteAnnouncement = async () => {
    const id = confirmModal.id;
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      await deleteDoc(doc(db, "announcements", id));
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.success("Announcement Deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const executeToggleBan = async (id, currentStatus) => {
    if (confirmModal.isOpen) setConfirmModal({ ...confirmModal, isOpen: false });

    const newStatus = !currentStatus;
    const action = newStatus ? "Activated" : "Banned";
    const toastId = toast.loading(`${action} student...`);

    try {
        await updateDoc(doc(db, "users", id), { isApproved: newStatus });
        setStudents(prev => prev.map(s => s.id === id ? { ...s, isApproved: newStatus } : s));
        toast.success(`Student ${action}`, { id: toastId });
    } catch (error) {
        toast.error("Failed to update student", { id: toastId });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out");
    navigate('/login');
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

  const getFilteredStudents = () => {
    return students.filter(s => 
        (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <div className="bg-gray-900 p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<FileText size={18} />} label="Manage Complaints" active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} />
          <SidebarItem icon={<Megaphone size={18} />} label="Announcements" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} />
          <SidebarItem icon={<Users size={18} />} label="Manage Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition text-sm">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 p-8 relative">
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'complaints' && 'Manage Complaints'}
              {activeTab === 'announcements' && 'Manage Announcements'}
              {activeTab === 'students' && 'Student Directory'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, Administrator</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchAllData} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
              <Settings size={16} /> Settings
            </button>
            <div className="h-8 w-[1px] bg-gray-300 mx-1"></div>
            <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 pl-2 hover:bg-gray-50 p-1 rounded-lg transition">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">A</div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
            </button>
          </div>
        </header>

        {/* === TAB: DASHBOARD OVERVIEW (RESTORED) === */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in-up space-y-6">
            {/* 1. Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Complaints" value={stats.total} />
              <StatCard label="Action Required" value={stats.pending} valueColor="text-orange-500" />
              <StatCard label="In Progress" value={stats.inProgress} valueColor="text-blue-600" />
              <StatCard label="Resolved" value={stats.resolved} valueColor="text-green-600" />
            </div>

            {/* 2. Split View: Complaints & Announcements */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Recent Complaints Widget */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Recent Complaints</h3>
                  <button onClick={() => setActiveTab('complaints')} className="text-sm text-blue-600 hover:underline font-medium">View All</button>
                </div>
                <div className="space-y-3 flex-1">
                  {complaints.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No complaints yet</div>
                  ) : (
                    complaints.slice(0, 4).map(c => (
                      <div key={c.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm transition">
                        <div>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{c.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{c.category} • <span className="font-medium text-gray-600">{c.priority || 'Normal'} Priority</span></p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Active Announcements Widget (Matches your Screenshot) */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Active Announcements</h3>
                  <button onClick={() => setActiveTab('announcements')} className="text-sm text-blue-600 hover:underline font-medium">Manage</button>
                </div>
                <div className="space-y-3 flex-1">
                  {announcements.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No active announcements</div>
                  ) : (
                    announcements.slice(0, 4).map(a => (
                      <div key={a.id} className="p-4 rounded-lg border border-blue-100 bg-blue-50">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-bold text-blue-900">{a.title}</span>
                          {a.priority === 'High' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Urgent</span>}
                        </div>
                        <p className="text-xs text-blue-700 mt-1 line-clamp-2">{a.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === TAB: MANAGE COMPLAINTS === */}
        {activeTab === 'complaints' && (
          <div className="animate-fade-in-up">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder="Search by title, ID, or student..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <select className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-50" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option>All Status</option>
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
              {getFilteredComplaints().map(complaint => (
                <div key={complaint.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">#{complaint.id.slice(0,6)}</span>
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{complaint.category}</span>
                            </div>
                            <h3 className="text-lg font-bold">{complaint.title}</h3>
                        </div>
                        <select 
                          className={`text-sm font-medium rounded-lg px-3 py-1.5 border focus:outline-none cursor-pointer transition ${getStatusColor(complaint.status)}`}
                          value={complaint.status}
                          onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{complaint.description}</p>
                    <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                        <div className="flex gap-4 text-xs text-gray-500">
                            <span>{new Date(complaint.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                            <span>{complaint.isAnonymous ? "Anonymous" : complaint.userName}</span>
                        </div>
                        <button onClick={() => navigate(`/complaint/${complaint.id}`)} className="text-sm font-bold text-blue-600 hover:underline">Discussion</button>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === TAB: MANAGE STUDENTS === */}
        {activeTab === 'students' && (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search student..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="text-sm text-gray-500 font-medium">Total: {students.length}</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {getFilteredStudents().map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{student.fullName}</td>
                      <td className="px-6 py-4 text-gray-600 font-mono">{student.rollNumber}</td>
                      <td className="px-6 py-4">
                        {student.isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700"><CheckCircle size={12} /> Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700"><Ban size={12} /> Banned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openBanModal(student.id, student.isApproved)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${student.isApproved ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                          {student.isApproved ? 'Ban User' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === TAB: ANNOUNCEMENTS === */}
        {activeTab === 'announcements' && (
          <div className="animate-fade-in-up grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Post Announcement</h3>
                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                  <div><label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Title</label><input type="text" required className="w-full p-2 border border-gray-200 rounded-lg text-sm" value={announcementForm.title} onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})} /></div>
                  <div><label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Message</label><textarea required rows="4" className="w-full p-2 border border-gray-200 rounded-lg text-sm" value={announcementForm.message} onChange={(e) => setAnnouncementForm({...announcementForm, message: e.target.value})}></textarea></div>
                  <div><label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Priority</label><select className="w-full p-2 border border-gray-200 rounded-lg text-sm" value={announcementForm.priority} onChange={(e) => setAnnouncementForm({...announcementForm, priority: e.target.value})}><option>Normal</option><option>High</option></select></div>
                  <button type="submit" className="w-full py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800">Publish</button>
                </form>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start group">
                  <div>
                    <h4 className="font-bold text-gray-900">{ann.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{ann.message}</p>
                  </div>
                  <button onClick={() => openDeleteAnnouncementModal(ann.id)} className="text-gray-400 hover:text-red-600 p-2 transition"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* --- MODALS --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-gray-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={32} /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h2>
              <p className="text-sm text-gray-500">{confirmModal.type === 'delete_announcement' ? "This announcement will be permanently deleted." : "This student will be immediately blocked."}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition border border-gray-200">Cancel</button>
              <button onClick={() => { if (confirmModal.type === 'delete_announcement') executeDeleteAnnouncement(); if (confirmModal.type === 'toggle_ban') executeToggleBan(confirmModal.id, confirmModal.data); }} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-up">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">A</div>
              <h2 className="text-xl font-bold text-gray-900">Administrator</h2>
            </div>
            <button onClick={handleLogout} className="w-full mt-6 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition">Sign Out</button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-up">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Settings size={20}/> Settings</h2>
            <div className="space-y-6">
              <div><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">System</h3><div className="flex justify-between items-center"><div><p className="font-semibold text-gray-800">Email Alerts</p></div><div className="w-10 h-6 bg-green-500 rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div></div></div></div>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3"><button onClick={() => setShowSettings(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Cancel</button><button onClick={() => { toast.success("Settings Saved"); setShowSettings(false); }} className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800">Save Changes</button></div>
          </div>
        </div>
      )}

    </div>
  );
};

// --- HELPER COMPONENTS ---
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition text-sm mb-1 ${active ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>{icon}{label}</button>
);

const StatCard = ({ label, value, valueColor = "text-gray-900" }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center"><span className={`text-3xl font-bold ${valueColor}`}>{value}</span><span className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">{label}</span></div>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'Resolved': return 'bg-green-50 border-green-200 text-green-700';
    case 'In Progress': return 'bg-blue-50 border-blue-200 text-blue-700';
    default: return 'bg-orange-50 border-orange-200 text-orange-700';
  }
};

const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusColor(status)}`}>{status}</span>
);

export default AdminDashboard;
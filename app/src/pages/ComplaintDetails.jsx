import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Send, User, ShieldAlert } from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Complaint Details
    const fetchComplaint = async () => {
      const docRef = doc(db, "complaints", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setComplaint({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("Complaint not found");
        navigate('/dashboard');
      }
      setLoading(false);
    };

    fetchComplaint();

    // 2. Listen for Real-time Comments
    const q = query(collection(db, "complaints", id, "comments"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(msgs);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
        // Determine role for display name
        // (In a real app, we'd fetch the user role again, but for now we assume based on context)
        const isStudent = complaint.uid === user.uid;
        
        await addDoc(collection(db, "complaints", id, "comments"), {
            text: newComment,
            uid: user.uid,
            authorName: isStudent && complaint.isAnonymous ? "Anonymous Student" : user.displayName,
            role: isStudent ? "Student" : "Admin", 
            createdAt: serverTimestamp()
        });
        setNewComment('');
    } catch (error) {
        console.error("Error sending comment:", error);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading discussion...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-blue-600">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        {/* Complaint Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{complaint.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {complaint.category}
                </span>
                <span>{new Date(complaint.createdAt?.seconds * 1000).toLocaleDateString()}</span>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-lg font-bold ${
                complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
            }`}>
                {complaint.status}
            </span>
          </div>
          
          <div className="prose max-w-none text-gray-700 bg-gray-50 p-6 rounded-lg">
            {complaint.description}
          </div>
        </div>

        {/* Discussion Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Discussion
            </h3>
          </div>

          {/* Chat History */}
          <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
            {comments.length === 0 ? (
                <p className="text-gray-400 text-center italic">No comments yet. Start the conversation.</p>
            ) : (
                comments.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 ${msg.uid === user.uid ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                            ${msg.role === 'Admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {msg.role === 'Admin' ? <ShieldAlert size={20} /> : <User size={20} />}
                        </div>
                        <div className={`max-w-[80%] ${msg.uid === user.uid ? 'text-right' : ''}`}>
                            <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 justify-end">
                                <span className="font-bold text-gray-700">{msg.authorName}</span>
                                <span>• {msg.role}</span>
                            </div>
                            <div className={`inline-block p-4 rounded-xl text-sm 
                                ${msg.uid === user.uid ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSendComment} className="flex gap-4">
                <input 
                    type="text" 
                    placeholder="Type a response..." 
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition">
                    <Send size={20} />
                </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComplaintDetails;
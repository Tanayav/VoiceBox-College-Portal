import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const toastId = toast.loading("Sending message...");

    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'unread' 
      });

      toast.success("Message sent! We'll contact you shortly.", { id: toastId });
      setFormData({ firstName: '', lastName: '', email: '', message: '' }); 
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Interested in bringing VoiceBox to your campus? Or have a technical question? 
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Contact Info (Left) */}
          <div className="bg-gray-900 p-12 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <p className="text-gray-400 mb-8">Fill up the form and our Team will get back to you within 24 hours.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Phone className="text-blue-400" /> <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="text-blue-400" /> <span>partnerships@voicebox.edu</span>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="text-blue-400" /> <span>Pune, Maharashtra, India</span>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full hover:bg-blue-600 transition cursor-pointer flex items-center justify-center text-gray-400 hover:text-white font-bold">in</div>
                <div className="w-10 h-10 bg-gray-800 rounded-full hover:bg-blue-600 transition cursor-pointer flex items-center justify-center text-gray-400 hover:text-white font-bold">𝕏</div>
                <div className="w-10 h-10 bg-gray-800 rounded-full hover:bg-blue-600 transition cursor-pointer flex items-center justify-center text-gray-400 hover:text-white font-bold">Ig</div>
              </div>
            </div>
          </div>

          {/* Form (Right) */}
          <div className="p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" placeholder="john@college.edu" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea required rows="4" name="message" value={formData.message} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Tell us about your requirements..."></textarea>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <>Send Message <Send size={18} /></>}
              </button>
            </form>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
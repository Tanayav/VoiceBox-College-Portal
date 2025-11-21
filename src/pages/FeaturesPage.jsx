import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Lock, Clock, Users, ShieldCheck, TrendingUp, BarChart3, MessageSquare, AlertTriangle } from 'lucide-react';

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gray-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">The Engine of Trust</h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Explore the core technology and design principles that make VoiceBox the most secure and accountable platform for campus dialogue.
          </p>
        </div>
      </div>

      {/* Feature Details Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 space-y-20">

          {/* MODULE 1: ANONYMITY AND PRIVACY */}
          <FeatureModule 
            icon={<Lock size={36} />}
            title="Module 1: Zero-Compromise Anonymity"
            description="Our primary commitment is to protect the student's right to speak freely. VoiceBox implements a Zero-Knowledge Submission Protocol: when a complaint is marked anonymous, the user's identity is encrypted and stored separately. Faculty members and general administrators cannot, under any circumstances, view the source student ID. This is the foundation upon which campus trust is built."
            details={[
              "Identity is stored on a separate access layer.",
              "Only the Super Admin (System Owner) can decrypt the source ID.",
              "Students control the anonymity toggle on every submission."
            ]}
            color="text-blue-600"
            ringColor="ring-blue-500"
            imagePosition="left"
          />

          {/* MODULE 2: REAL-TIME TRACKING */}
          <FeatureModule 
            icon={<Clock size={36} />}
            title="Module 2: Real-Time Transparency Engine"
            description="Eliminate the black hole of traditional complaint forms. Every submitted grievance is time-stamped and assigned a clear status (Pending, In Progress, Resolved). Students can instantly view the progress, assigned priority, and any official administrator comments on their dedicated tracking dashboard."
            details={[
              "Unique CMP-ID tracking code for every grievance.",
              "Visual timeline shows all status changes and administrator time logs.",
              "Priority levels (High, Medium, Low) are visible to students."
            ]}
            color="text-green-600"
            ringColor="ring-green-500"
            imagePosition="right"
          />

          {/* MODULE 3: COLLABORATION AND COMMUNICATION */}
          <FeatureModule 
            icon={<MessageSquare size={36} />}
            title="Module 3: Direct Dialogue System"
            description="Bridging the communication gap. VoiceBox allows secure, direct communication between the student who filed the complaint and the assigned administrator. This ensures immediate clarification of details and provides necessary follow-up without compromising anonymity if the student chose to hide their identity."
            details={[
              "Private, threaded comment system for each ticket.",
              "Admins can reply directly to 'Anonymous Student'.",
              "Ensures administrators get the context needed for resolution."
            ]}
            color="text-purple-600"
            ringColor="ring-purple-500"
            imagePosition="left"
          />
          
          {/* MODULE 4: COLLECTIVE ACTION */}
          <FeatureModule 
            icon={<Users size={36} />}
            title="Module 4: Collective Advocacy (Petitions)"
            description="Turn individual complaints into campus movements. The Community Petitions module allows any student to launch a campaign for a shared cause (e.g., better library hours). Collective support creates clear mandates for the administration on what matters most to the student body."
            details={[
              "Dynamic progress bar towards signature goal.",
              "Automatic 'Trending' identification based on momentum.",
              "One-click 'Sign Petition' feature for ease of use."
            ]}
            color="text-orange-600"
            ringColor="ring-orange-500"
            imagePosition="right"
          />

          {/* MODULE 5: ADMINISTRATIVE CONTROL */}
          <FeatureModule 
            icon={<ShieldCheck size={36} />}
            title="Module 5: Accountability and Control (Admin View)"
            description="The Admin Panel is a streamlined control center designed for efficiency. Staff can quickly filter, change status, post official announcements, and manage user access permissions (Ban/Unban students) with full confidence in the data integrity and security of the system."
            details={[
              "Student Directory for managing user access and approval.",
              "Integrated announcement posting (Megaphone feature).",
              "Quick Status Dropdowns for instant ticket progression."
            ]}
            color="text-red-600"
            ringColor="ring-red-500"
            imagePosition="left"
          />

        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- HELPER COMPONENTS ---

const FeatureModule = ({ icon, title, description, details, imagePosition, color, ringColor }) => (
  <div className={`grid md:grid-cols-2 gap-12 items-center ${imagePosition === 'right' ? 'md:grid-flow-col-dense' : ''}`}>
    
    {/* Text Content */}
    <div className={`${imagePosition === 'right' ? 'md:col-start-1 md:col-end-2' : ''}`}>
      <div className={`bg-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg border border-gray-100 ${color}`}>
        {icon}
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-lg text-gray-600 mb-6 leading-relaxed">{description}</p>
      
      <ul className="space-y-3">
        {details.map((detail, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
            <span className="text-gray-700">{detail}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Image/Mockup Placeholder */}
    <div className={`rounded-2xl h-96 bg-gray-100/70 border-4 ${ringColor} flex items-center justify-center p-6 shadow-2xl ${imagePosition === 'right' ? 'md:col-start-2 md:col-end-3' : ''}`}>
      <p className="text-gray-500 font-mono text-center">
        [Visual Mockup: Dashboard View of {title}]
      </p>
    </div>
  </div>
);

const CheckCircle = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default FeaturesPage;
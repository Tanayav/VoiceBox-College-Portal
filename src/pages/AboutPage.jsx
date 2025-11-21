import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Target, Heart, Shield, Users, Award } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gray-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Building Better Campuses</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We are on a mission to eliminate communication gaps in education institutes through technology and transparency.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="prose prose-lg mx-auto text-gray-600">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="mb-6 text-lg leading-relaxed">
            It started in a hostel room in 2024. We noticed that small issues—broken fans, cold food, outdated syllabus—often went unreported because students were afraid of being singled out, or simply didn't know who to email.
          </p>
          <p className="mb-6 text-lg leading-relaxed">
            The existing solution was an actual, physical "Complaint Box" gathering dust in the corridor. Nobody checked it. Nobody trusted it.
          </p>
          <p className="text-lg leading-relaxed font-medium text-gray-900">
            VoiceBox was born to change that. We built a digital, encrypted platform where student identity is protected, but accountability is enforced. Today, we serve over 15,000 students across the country.
          </p>
        </div>
      </div>

      {/* Values Grid */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard icon={<Shield size={32} />} title="Radical Privacy" desc="We believe privacy isn't a feature; it's a right. Our architecture ensures anonymity is mathematically guaranteed." />
            <ValueCard icon={<Target size={32} />} title="Bias for Action" desc="A complaint is useless if it doesn't lead to a solution. Our tools are designed to resolve tickets, not just store them." />
            <ValueCard icon={<Heart size={32} />} title="Student First" desc="We build for the student. Every feature, from petitions to polls, is designed to empower the student voice." />
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Meet the Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <TeamMember name="Tanaya" role="Founder & CEO" />
            <TeamMember name="Alex Chen" role="Head of Technology" />
            <TeamMember name="Sarah Jones" role="Student Relations" />
            <TeamMember name="Mike Ross" role="Campus Growth" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const ValueCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

const TeamMember = ({ name, role }) => (
  <div className="group">
    <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
      {/* Placeholder for profile pic */}
      <div className="w-full h-full bg-gray-300 group-hover:bg-blue-100 transition"></div>
    </div>
    <h3 className="font-bold text-lg text-gray-900">{name}</h3>
    <p className="text-blue-600 text-sm font-medium">{role}</p>
  </div>
);

export default AboutPage;
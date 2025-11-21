import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Zap, Users, Lock, Globe, BarChart3, Quote, ArrowRight } from 'lucide-react';

// --- 1. SMART LOOPING COUNTER ---
const LoopingCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const endNum = parseInt(end.toString().replace(/,/g, ''), 10);
    let frameId;
    let startTime;
    
    const startAnimation = () => {
      startTime = Date.now();
      
      const animate = () => {
        const now = Date.now();
        const progress = now - startTime;

        if (progress < duration) {
          const nextCount = Math.floor(endNum * (progress / duration));
          setCount(nextCount);
          frameId = requestAnimationFrame(animate);
        } else {
          setCount(endNum);
          setTimeout(() => {
            startTime = Date.now(); 
            setCount(0);
            frameId = requestAnimationFrame(animate);
          }, 3000);
        }
      };
      frameId = requestAnimationFrame(animate);
    };

    startAnimation();

    return () => cancelAnimationFrame(frameId);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-30 -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-8 border border-blue-100 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Trusted by Top Institutes
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight animate-fade-in-up">
            The Standard for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Campus Transparency.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            VoiceBox replaces outdated suggestion boxes with a secure, digital grievance system. 
            We help colleges build trust through accountability.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up">
            <Link to="/signup" className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-black transition shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
              Start Your Petition <ArrowRight size={20} />
            </Link>
            <Link to="/about" className="bg-white text-gray-700 px-8 py-4 rounded-full font-bold text-lg border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center gap-2">
              Request Demo
            </Link>
          </div>

          {/* LIVE STATS BAR (With Looping Animation) */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-gray-100 py-12 bg-white/50 backdrop-blur-sm">
            <StatItem number={<LoopingCounter end="15000" suffix="+" />} label="Active Students" />
            <StatItem number={<LoopingCounter end="8400" />} label="Complaints Resolved" />
            <StatItem number={<LoopingCounter end="98" suffix="%" />} label="Admin Response Rate" />
            <StatItem number={<LoopingCounter end="24" suffix="h" />} label="Avg. Resolution Time" />
          </div>
        </div>
      </section>

      {/* 2. INFINITE LOGO SLIDER */}
      <section className="py-12 bg-gray-50 overflow-hidden border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center mb-8">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Trusted by Administration at</p>
        </div>
        
        <div className="relative w-full overflow-hidden">
          {/* Fade Overlay for smooth effect */}
          <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
          
          {/* The Track: Contains Two Identical Lists */}
          <div className="animate-scroll flex items-center">
            {/* List 1 */}
            <div className="flex gap-20 pr-20">
                <LogoItem name="MES IMCC" />
                <LogoItem name="IIT Bombay" />
                <LogoItem name="VIT Pune" />
                <LogoItem name="BITS Pilani" />
                <LogoItem name="COEP Tech" />
                <LogoItem name="MIT WPU" />
                <LogoItem name="Symbiosis" />
            </div>
            {/* List 2 (Duplicate for seamless loop) */}
            <div className="flex gap-20 pr-20">
                <LogoItem name="MES IMCC" />
                <LogoItem name="IIT Bombay" />
                <LogoItem name="VIT Pune" />
                <LogoItem name="BITS Pilani" />
                <LogoItem name="COEP Tech" />
                <LogoItem name="MIT WPU" />
                <LogoItem name="Symbiosis" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section id="features" className="py-24 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Top Colleges Switch to VoiceBox</h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">We provide the infrastructure for honest conversation. Security and anonymity are baked into our core.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={<Lock className="w-8 h-8 text-blue-600" />} title="Ironclad Anonymity" desc="Our 'Zero-Knowledge' submission system ensures that even admins cannot trace an anonymous complaint back to a student ID." />
            <FeatureCard icon={<Globe className="w-8 h-8 text-blue-600" />} title="Public Petitions" desc="Democratize campus change. Students can start petitions, gather signatures, and bring major issues to the forefront." />
            <FeatureCard icon={<BarChart3 className="w-8 h-8 text-blue-600" />} title="Admin Analytics" desc="Colleges get a powerful dashboard to track heatmaps of issues (e.g., 'Hostel A has 40% more complaints this week')." />
            <FeatureCard icon={<Zap className="w-8 h-8 text-blue-600" />} title="Instant Alerts" desc="No more waiting for weekly meetings. Admins get notified instantly via Email/SMS when high-priority issues arise." />
            <FeatureCard icon={<ShieldCheck className="w-8 h-8 text-blue-600" />} title="Verified Access" desc="We integrate with college email domains (.edu) to ensure only actual students and staff can access the portal." />
            <FeatureCard icon={<Users className="w-8 h-8 text-blue-600" />} title="Discussion Threads" desc="Admins can reply to complaints directly, asking for more info or providing updates without breaking anonymity." />
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS */}
      <section className="py-24 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-16">Impact Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard quote="Before VoiceBox, we had no idea our hostel water filter was broken for weeks. Now, maintenance is fixed within 24 hours." author="Dr. R.K. Sharma" role="Dean of Student Affairs" />
            <TestimonialCard quote="I was afraid to report ragging because of retaliation. VoiceBox's anonymous mode gave me the courage to speak up safely." author="Engineering Student" role="Batch of 2024" />
            <TestimonialCard quote="The petitions feature helps us understand what students actually want, rather than guessing. It's a game changer for the council." author="Student Council President" role="MES IMCC" />
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to modernize your campus?</h2>
          <p className="text-xl text-gray-500 mb-10">Join the network of transparent, student-first institutions today.</p>
          <div className="flex justify-center gap-4">
            <Link to="/signup" className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200">Get Started for Free</Link>
            <Link to="/contact" className="px-10 py-4 rounded-full font-bold text-lg text-gray-600 hover:bg-gray-50 transition border border-gray-200">Contact Sales</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- SUB COMPONENTS ---

const StatItem = ({ number, label }) => (
  <div>
    <div className="text-4xl font-extrabold text-gray-900 mb-1">{number}</div>
    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</div>
  </div>
);

const LogoItem = ({ name }) => (
  <h3 className="text-2xl font-serif text-gray-400 font-bold hover:text-gray-900 transition-colors cursor-default">
    {name}
  </h3>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition duration-300 group">
    <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const TestimonialCard = ({ quote, author, role }) => (
  <div className="bg-blue-800/50 p-8 rounded-2xl border border-blue-700 backdrop-blur-sm">
    <Quote className="text-blue-400 w-10 h-10 mb-4 opacity-50" />
    <p className="text-lg text-blue-100 mb-6 leading-relaxed">"{quote}"</p>
    <div><p className="font-bold text-white">{author}</p><p className="text-blue-300 text-sm">{role}</p></div>
  </div>
);

export default LandingPage;
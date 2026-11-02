import React from 'react';
import { 
  FileText, 
  Search, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Server, 
  Building2, 
  Award,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home({ setView }) {
  const { user, isAdmin } = useAuth();

  const handleAction = () => {
    if (!user) {
      setView('login');
    } else if (isAdmin) {
      setView('admin-dashboard');
    } else {
      setView('resident-dashboard');
    }
  };

  const steps = [
    {
      num: '01',
      title: 'Register or Sign In',
      desc: 'Create your resident profile with your verified address in Barangay Tinurik.',
      icon: Users,
    },
    {
      num: '02',
      title: 'Submit Request',
      desc: 'Select your needed document, enter your purpose, and submit the online application.',
      icon: FileText,
    },
    {
      num: '03',
      title: 'Real-Time Tracking',
      desc: 'Monitor the validation, approval, and processing status directly on your dashboard.',
      icon: Clock,
    },
    {
      num: '04',
      title: 'Claim at Barangay Hall',
      desc: 'Pick up your official stamped clearance or certificate upon status completion.',
      icon: Award,
    },
  ];

  const popularDocs = [
    {
      title: 'Barangay Clearance',
      desc: 'Essential for job hunting, police clearance, and formal commercial requirements.',
      tag: 'Most Requested',
    },
    {
      title: 'Certificate of Residency',
      desc: 'Proof of address for bank transactions, passport, government IDs, and utilities.',
      tag: 'Common',
    },
    {
      title: 'Certificate of Indigency',
      desc: 'For financial, medical, scholarship, or legal assistance programs at DSWD and City Hall.',
      tag: 'Free of Charge',
    },
    {
      title: 'Business Clearance',
      desc: 'Mandatory clearance for operating or renewing retail, commercial, or home businesses.',
      tag: 'Commercial',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-tinurik-navy to-slate-900 text-white pt-16 pb-20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tanauan City E-Government Initiative</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Online Document Request & Real-Time Tracking for <span className="text-sky-400">Barangay Tinurik</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
                Skip the long lines. Request Barangay Clearances, Certificates of Residency, Indigency, and Business Permits conveniently from any device.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={handleAction}
                  className="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 hover:translate-y-[-1px]"
                >
                  <FileText className="w-5 h-5" />
                  {user ? 'Open My Dashboard' : 'Request a Document Now'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => setView('documents')}
                  className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm sm:text-base transition-all hover:border-slate-600"
                >
                  View Available Documents
                </button>
              </div>

              {/* Key Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-extrabold text-white">24-48h</div>
                  <div className="text-xs text-slate-400">Processing Time</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-emerald-400">100%</div>
                  <div className="text-xs text-slate-400">Digital Tracking</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-sky-400">6+</div>
                  <div className="text-xs text-slate-400">Official Certificates</div>
                </div>
              </div>
            </div>

            {/* Hero Right Card: Live System Demo Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl text-slate-100">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏛️</span>
                    <div>
                      <h3 className="font-bold text-sm text-white">Barangay Tinurik Portal</h3>
                      <p className="text-[11px] text-slate-300">Tanauan City, Batangas</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
                    Portal Active
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Sample Reference</span>
                      <span className="text-sky-300 font-mono">REQ-2026-0042</span>
                    </div>
                    <div className="font-bold text-sm text-white">Barangay Clearance</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-xs text-emerald-300 font-semibold">Ready for Claiming</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-950/60 rounded-xl border border-blue-500/30 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-sky-300 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Anti-Red Tape Act (ARTA) Compliant
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Transparent, fast, and secure processing of official clearances and certifications.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="bg-slate-900/70 p-2 rounded border border-slate-700">
                        <span className="text-emerald-400 block font-bold">Schedule</span>
                        <span className="text-slate-300">Mon - Fri: 8am - 5pm</span>
                      </div>
                      <div className="bg-slate-900/70 p-2 rounded border border-slate-700">
                        <span className="text-sky-400 block font-bold">Claiming Location</span>
                        <span className="text-slate-300">Barangay Hall</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => setView(user ? (isAdmin ? 'admin-dashboard' : 'resident-dashboard') : 'login')}
                      className="w-full py-2.5 rounded-lg bg-white text-tinurik-navy font-bold text-xs hover:bg-slate-100 transition-colors shadow"
                    >
                      {user ? 'Open Portal Dashboard' : 'Sign In to Online Services'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-tinurik-blue uppercase tracking-wider">Fast & Transparent Process</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">How Document Requests Work</h2>
          <p className="text-slate-600 text-sm mt-2">
            Experience our 4-step streamlined government service workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="text-4xl font-black text-slate-100 group-hover:text-blue-50 transition-colors absolute top-3 right-4 select-none">
                  {step.num}
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-tinurik-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{step.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Documents Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-tinurik-blue uppercase tracking-wider">Document Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Available Barangay Documents</h2>
          </div>
          <button
            onClick={() => setView('documents')}
            className="text-sm font-bold text-tinurik-blue hover:text-blue-800 flex items-center gap-1"
          >
            Explore all document types <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDocs.map((doc, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-blue-300 transition-all hover:translate-y-[-2px]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {doc.tag}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1.5">{doc.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{doc.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={handleAction}
                  className="w-full py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-tinurik-blue font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  Request This <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Official Government Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-tinurik-navy to-tinurik-blue rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to submit your document request?
            </h3>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Register an account in less than 2 minutes. Track your document status 24/7 and receive prompt updates.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setView(user ? 'resident-dashboard' : 'register')}
              className="px-6 py-3.5 rounded-xl bg-white text-tinurik-navy font-bold text-sm shadow-md hover:bg-slate-100 transition-all"
            >
              {user ? 'Go to Dashboard' : 'Register as Resident'}
            </button>
            <button
              onClick={() => setView('login')}
              className="px-6 py-3.5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-semibold text-sm border border-blue-400/40 transition-all"
            >
              Sign In to Existing Account
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

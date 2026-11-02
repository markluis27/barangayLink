import React from 'react';
import { Building2, ShieldCheck, MapPin, Phone, Mail, Globe, Server } from 'lucide-react';
import { API_BASE_URL } from '../api/api';

export default function Footer({ setView }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Barangay Tinurik */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3 text-white">
              <span className="text-3xl">🏛️</span>
              <div>
                <span className="font-bold text-lg block leading-tight text-white">Barangay Tinurik</span>
                <span className="text-xs text-slate-400">Tanauan City, Batangas</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official online document request, processing, and tracking service portal for residents of Barangay Tinurik.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Barangay Portal</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setView('home')} className="hover:text-white transition-colors">
                  Portal Home
                </button>
              </li>
              <li>
                <button onClick={() => setView('about')} className="hover:text-white transition-colors">
                  About Barangay Tinurik
                </button>
              </li>
              <li>
                <button onClick={() => setView('documents')} className="hover:text-white transition-colors">
                  Available Documents & Fees
                </button>
              </li>
              <li>
                <button onClick={() => setView('login')} className="hover:text-white transition-colors">
                  Resident & Admin Login
                </button>
              </li>
              <li>
                <button onClick={() => setView('register')} className="hover:text-white transition-colors">
                  Resident Registration
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Office Hours */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Barangay Hall</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>Barangay Tinurik Hall, National Road, Tanauan City, Batangas 4232</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>(043) 784-2000 / 0917-123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>admin@tinurik.gov.ph</span>
              </li>
              <li className="pt-2 text-slate-400">
                <strong className="text-slate-200 block">Office Hours:</strong>
                Monday – Friday: 8:00 AM – 5:00 PM
              </li>
            </ul>
          </div>

          {/* Column 4: Emergency & Public Service Hotlines */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <Phone className="w-4 h-4" />
              <h4 className="font-semibold text-xs text-white uppercase tracking-wider">Emergency Hotlines</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              City of Tanauan 24/7 emergency response & community safety:
            </p>
            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-700">
                <strong className="text-slate-200 block">Tanauan City Police (PNP):</strong>
                <span className="text-sky-400 font-mono">(043) 778-1212 / 166</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-700">
                <strong className="text-slate-200 block">Bureau of Fire Protection (BFP):</strong>
                <span className="text-rose-400 font-mono">(043) 778-1999 / 160</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-700">
                <strong className="text-slate-200 block">Barangay Tinurik Peace & Order:</strong>
                <span className="text-emerald-400 font-mono">0917-123-4567</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Barangay Tinurik, Tanauan City, Batangas. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Barangay Tinurik Portal v1.0.0</span>
            <span>•</span>
            <span>City of Tanauan, Batangas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

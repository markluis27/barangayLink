import React from 'react';
import { Building2, MapPin, Phone, Mail, Award, Users, ShieldCheck, Heart, Server } from 'lucide-react';

export default function About({ setView }) {
  const officials = [
    { name: 'Hon. Roberto Castillo', role: 'Punong Barangay / Barangay Captain' },
    { name: 'Hon. Elena Laurel', role: 'Barangay Kagawad - Committee on Rules & Ordinances' },
    { name: 'Hon. Dan Mendoza', role: 'Barangay Kagawad - Committee on Health & Sanitation' },
    { name: 'Hon. Grace Hernandez', role: 'Barangay Kagawad - Committee on Peace & Order' },
    { name: 'Hon. Antonio Reyes', role: 'Barangay Kagawad - Committee on Public Works' },
    { name: 'Hon. Christopher Lim', role: 'Barangay Kagawad - Committee on Education' },
    { name: 'Mrs. Josefina Bautista', role: 'Barangay Secretary' },
    { name: 'Mr. Ricardo Panganiban', role: 'Barangay Treasurer' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-tinurik-blue text-xs font-bold">
          <Building2 className="w-4 h-4" />
          <span>Local Government Profile</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Barangay Tinurik
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          A progressive, peaceful, and hospitable community nestled in the historic and vibrant City of Tanauan, Batangas.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-tinurik-blue flex items-center justify-center mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            To be a model barangay in Tanauan City, characterized by god-centered, healthy, self-reliant, and empowered constituents living in a secure, disaster-resilient, and sustainable environment through transparent, innovative, and digital governance.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            To provide efficient, prompt, and honest public services, foster economic growth through local enterprise, preserve peace and order, and leverage modern digital technology to make document issuance and resident services transparent and effortless.
          </p>
        </div>
      </div>

      {/* Barangay Profile Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-tinurik-blue" />
          Barangay Information & Geographic Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block uppercase font-bold mb-1">Municipality / City</span>
            <span className="font-bold text-slate-800 text-base">City of Tanauan</span>
            <span className="text-xs text-slate-500 block mt-1">2nd District of Batangas</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block uppercase font-bold mb-1">Province & Region</span>
            <span className="font-bold text-slate-800 text-base">Batangas Province</span>
            <span className="text-xs text-slate-500 block mt-1">CALABARZON (Region IV-A)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block uppercase font-bold mb-1">Postal Code</span>
            <span className="font-bold text-slate-800 text-base">4232</span>
            <span className="text-xs text-slate-500 block mt-1">Tinurik, Tanauan City</span>
          </div>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">
          Barangay Tinurik is situated along the main arterial corridor connecting Tanauan City proper with surrounding agricultural and commercial zones. With a growing population of hardworking families, small business owners, and industrial workers, the barangay hall serves as the frontline provider of social certifications, peace and order maintenance, and community development.
        </p>
      </div>

      {/* Barangay Officials */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-tinurik-blue uppercase tracking-wider">Leadership</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">Barangay Administration (Sangguniang Barangay)</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {officials.map((official, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm mb-3">
                {official.name.split(' ').slice(-1)[0].charAt(0)}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{official.name}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-snug">{official.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Public Service Commitment */}
      <div className="bg-gradient-to-r from-slate-900 to-tinurik-navy text-white rounded-2xl p-8 border border-slate-800 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Public Service Commitment</span>
            </div>
            <h3 className="text-xl font-bold">Dedicated to Transparent Community Service</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Our constituents are at the heart of our community initiatives. Through this official online portal, the Sangguniang Barangay of Tinurik is committed to providing prompt, honest, and accessible public documentation services to every resident of Tanauan City.
            </p>
          </div>
          <button
            onClick={() => setView('documents')}
            className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs whitespace-nowrap shadow-md transition-all"
          >
            Explore Available Documents
          </button>
        </div>
      </div>

    </div>
  );
}

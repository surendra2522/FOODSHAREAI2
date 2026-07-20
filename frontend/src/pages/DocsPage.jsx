import React from 'react';
import { Terminal, Database, Server, Key, Heart } from 'lucide-react';

export default function DocsPage() {
  const codeBlocks = {
    envBackend: `PORT=5000\nMONGO_URI=mongodb://localhost:27017/foodshare\nJWT_SECRET=super_secret_key_1234567890\nNODE_ENV=development`,
    envFrontend: `VITE_API_URL=http://localhost:5000/api`,
    authRoute: `POST /api/auth/register - Register user\nPOST /api/auth/login    - Sign in user\nGET  /api/auth/me       - Verify session token`,
    donationsRoute: `GET  /api/donations       - Retrieve available food listings\nPOST /api/donations       - Add new food item (Donors only)\nPUT  /api/donations/:id/claim - Claim food (Charities only)\nGET  /api/donations/stats  - Get environmental stats`,
  };

  return (
    <div className="py-8 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto w-full flex flex-col gap-8 text-left relative">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Terminal className="text-brand-400" size={32} />
          Telemetry Docs
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Technical architecture, API specs, and environmental deployment variables.
        </p>
      </div>

      {/* Docs Sections */}
      <div className="flex flex-col gap-8">
        
        {/* Architecture */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="text-brand-400" size={20} />
            1. System Architecture
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            FoodShare AI utilizes a lightweight decoupled MERN (MongoDB, Express, React, Node) stack. Sessions are authorized via cryptographically signed JWT tokens, passing user details and roles (Donor, Charity) inside request headers.
          </p>
        </section>

        {/* Environments */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="text-brand-400" size={20} />
            2. Environment Specifications
          </h2>
          
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Backend Configuration (.env)</span>
            <pre className="p-4 rounded-xl bg-slate-900 border border-white/5 font-mono text-xs text-brand-300 overflow-x-auto">
              {codeBlocks.envBackend}
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Frontend Configuration (.env)</span>
            <pre className="p-4 rounded-xl bg-slate-900 border border-white/5 font-mono text-xs text-brand-300 overflow-x-auto">
              {codeBlocks.envFrontend}
            </pre>
          </div>
        </section>

        {/* REST Specs */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="text-brand-400" size={20} />
            3. API Reference Endpoints
          </h2>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase">Authentication Engine</span>
              <pre className="p-4 rounded-xl bg-slate-900 border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                {codeBlocks.authRoute}
              </pre>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase">Redistribution Logistics Engine</span>
              <pre className="p-4 rounded-xl bg-slate-900 border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                {codeBlocks.donationsRoute}
              </pre>
            </div>
          </div>
        </section>

        {/* Database schema notes */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="text-brand-400" size={20} />
            4. Seed Models & DB Rules
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The database schemas are built on Mongoose models. Donors own matching structures via an Object ID reference. Expiry index telemetry automates cleanup triggers inside MongoDB.
          </p>
        </section>

      </div>
    </div>
  );
}

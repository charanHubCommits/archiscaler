"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Server, Database, Activity, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-canvas-dark text-gray-200">
      {/* Header */}
      <header className="border-b border-border-dark bg-panel-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-biscuit flex items-center justify-center text-canvas-dark font-black text-lg">
              Λ
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Archi<span className="text-biscuit">Scaler</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/home"
                className="px-4 py-2 rounded bg-biscuit text-canvas-dark font-semibold text-sm hover:bg-biscuit-dark transition-all flex items-center gap-1"
              >
                Go to Workspace <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth?tab=login"
                  className="text-sm font-medium hover:text-biscuit transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth?tab=signup"
                  className="px-4 py-2 rounded bg-biscuit text-canvas-dark font-semibold text-sm hover:bg-biscuit-dark transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-dark bg-panel-dark text-xs text-biscuit mb-6 animate-pulse">
          <Zap className="w-3.5 h-3.5" />
          Interactive System Design Simulator
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4">
          Design <span className="text-biscuit">.</span> Simulate <span className="text-biscuit">.</span> Scale
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Create, analyze, and test your microservice system designs under realistic requests per second loads. Identify bottle-necks, evaluate database limits, and optimize capacity before writing a single line of production code.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href={isLoggedIn ? "/home" : "/auth?tab=signup"}
            className="px-8 py-3.5 rounded bg-biscuit text-canvas-dark font-bold text-base hover:bg-biscuit-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-biscuit/10"
          >
            Launch Simulator <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#features"
            className="px-8 py-3.5 rounded border border-border-dark hover:border-biscuit text-white font-semibold text-base transition-all bg-panel-dark/30 hover:bg-panel-dark/50"
          >
            Explore Features
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10 text-left">
          <div className="p-6 rounded-lg border border-border-dark bg-panel-dark/40 hover:border-biscuit/40 transition-all group">
            <div className="w-12 h-12 rounded bg-biscuit/10 flex items-center justify-center text-biscuit mb-4 group-hover:scale-110 transition-transform">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Visual Canvas</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Drag-and-drop web servers, databases, load balancers, and caches. Connect services into a flow representing your microservice dependency chain.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border-dark bg-panel-dark/40 hover:border-biscuit/40 transition-all group">
            <div className="w-12 h-12 rounded bg-biscuit/10 flex items-center justify-center text-biscuit mb-4 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">RPS Simulation</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Define target Requests Per Second (RPS). Watch traffic propagate along execution paths and calculate CPU, server, and DB utilization rates.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border-dark bg-panel-dark/40 hover:border-biscuit/40 transition-all group">
            <div className="w-12 h-12 rounded bg-biscuit/10 flex items-center justify-center text-biscuit mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bottleneck Reports</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Discover which servers exceed their capabilities. Red progress indicators point out service overloads and latency risk points.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-dark py-8 text-center text-xs text-gray-500 bg-panel-dark/30">
        <p>© 2026 ArchiScaler. Designed for modern architecture planning. All rights reserved.</p>
      </footer>
    </div>
  );
}

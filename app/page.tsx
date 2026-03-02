'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full" role="banner">
        <div className="mx-auto max-w-7xl px-4 md:px-6 pt-3">
          <nav className="relative flex items-center justify-between gap-4 rounded-2xl bg-white/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/50 shadow-[0_2px_16px_rgba(0,0,0,0.06)] px-4 md:px-6 py-3">
            
            {/* Left — Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2.5 flex-shrink-0 group" 
              aria-label="LogicLens Home"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3c-2 0-3 1-3 3v4c0 2-1 3-3 3 2 0 3 1 3 3v4c0 2 1 3 3 3"/>
                  <path d="M16 3c2 0 3 1 3 3v4c0 2 1 3 3 3-2 0-3 1-3 3v4c0 2-1 3-3 3"/>
                  <circle cx="12" cy="13" r="1" fill="white" stroke="none"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Logic<span className="text-indigo-600">Lens</span>
              </span>
            </Link>

            {/* Center — Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              <Link 
                href="/" 
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-900 bg-slate-100/80 transition-all duration-200"
              >
                Home
              </Link>
              <a 
                href="#how-it-works" 
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
              >
                How It Works
              </a>
              <a 
                href="#built-for-developers" 
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
              >
                For Developers
              </a>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2">
              {/* GitHub link — Desktop only */}
              <a
                href="https://github.com/SinghCharanjeet11/logic-lens"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
                aria-label="View source on GitHub"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>

              {/* Primary CTA */}
              <Link
                href="/workspace"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              >
                <span className="hidden sm:inline">Try Free</span>
                <span className="sm:hidden">Try</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile Menu — Dropdown */}
            {mobileMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 mx-0 bg-white/90 backdrop-blur-2xl rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-4 lg:hidden animate-fade-in z-50">
                <div className="flex flex-col gap-1">
                  <Link 
                    href="/" 
                    className="px-4 py-3 rounded-xl text-sm font-medium text-slate-900 bg-slate-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <a 
                    href="#how-it-works" 
                    className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    How It Works
                  </a>
                  <a 
                    href="#built-for-developers" 
                    className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    For Developers
                  </a>
                  <a
                    href="https://github.com/SinghCharanjeet11/logic-lens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <Link
                    href="/workspace"
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Try Free
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center px-4" aria-labelledby="hero-heading">
        <div className="container mx-auto max-w-4xl">
          <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            Stop Guessing.
            <br />
            <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Start Understanding.
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Diagnose your code reasoning gaps before debugging
          </p>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform focus:outline-none focus:ring-4 focus:ring-indigo-300"
            aria-label="Navigate to workspace to paste code and check reasoning"
          >
            Diagnose My Code →
          </Link>
        </div>
      </section>

      {/* Value Proposition Cards */}
      <section id="features" className="py-16 px-4" aria-labelledby="value-props-heading">
        <div className="container mx-auto max-w-6xl">
          <h2 id="value-props-heading" className="sr-only">How LogicLens Helps You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <article className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:-translate-y-1 hover:scale-[1.02] transition-all hover:shadow-lg focus-within:border-indigo-300 focus-within:shadow-lg cursor-pointer">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5" aria-hidden="true">
                <span className="text-3xl">🩺</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Diagnose First</h3>
              <p className="text-gray-600 leading-relaxed">
                Answer targeted questions about your code before seeing explanations
              </p>
            </article>

            {/* Card 2 */}
            <article className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:-translate-y-1 hover:scale-[1.02] transition-all hover:shadow-lg focus-within:border-indigo-300 focus-within:shadow-lg cursor-pointer">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-5" aria-hidden="true">
                <span className="text-3xl">🧩</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Find Logic Gaps</h3>
              <p className="text-gray-600 leading-relaxed">
                Identify exactly where your mental model differs from actual behavior
              </p>
            </article>

            {/* Card 3 */}
            <article className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:-translate-y-1 hover:scale-[1.02] transition-all hover:shadow-lg focus-within:border-indigo-300 focus-within:shadow-lg cursor-pointer">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-5" aria-hidden="true">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Build Confidence</h3>
              <p className="text-gray-600 leading-relaxed">
                Develop systematic reasoning skills for any codebase
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 relative overflow-hidden" aria-labelledby="how-it-works-heading">
        {/* Subtle background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold tracking-wide mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              3 Simple Steps
            </span>
            <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              From pasting code to understanding gaps — in under 5 minutes.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                {/* Step indicator */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  1
                </div>
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Paste Your Code</h3>
                <p className="text-slate-600 leading-relaxed flex-grow">
                  Drop any code snippet — JavaScript, Python, or any language. Pick your goal: understand logic, debug, or optimize.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-violet-300 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                {/* Step indicator */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  2
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Answer Questions</h3>
                <p className="text-slate-600 leading-relaxed flex-grow">
                  AI asks targeted questions about your code's behavior. Think through each one — no wrong answers, just honest reasoning.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                {/* Step indicator */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  3
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">See Your Gaps</h3>
                <p className="text-slate-600 leading-relaxed flex-grow">
                  Get a personalized breakdown of where your reasoning matched reality — and where it didn't. Learn from each gap with actionable tips.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            >
              Start Diagnosing
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Built for Developers */}
      <section id="built-for-developers" className="py-20 md:py-28 px-4" aria-labelledby="developers-heading">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 md:p-14 relative overflow-hidden">
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Grid pattern overlay (subtle) */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
            
            <div className="relative z-10">
              {/* Section header */}
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-indigo-300 rounded-full text-xs font-semibold tracking-wide mb-4 border border-white/10">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  Developer-First
                </span>
                <h2 id="developers-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Built for Developers
                </h2>
                <p className="text-lg text-slate-400 max-w-xl mx-auto">
                  By developers, for developers. Every feature is designed around how you actually learn code.
                </p>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Feature 1 */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-colors">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-[15px] mb-1.5">Hindi + English</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Toggle between languages instantly. Learn in the language that clicks for you.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-500/30 transition-colors">
                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-[15px] mb-1.5">Mobile-Friendly</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Full experience on any device. Practice reasoning on the go from your phone.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-[15px] mb-1.5">No Sign-Up Needed</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Start learning immediately. No accounts, no emails, no friction. Just paste and go.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-[15px] mb-1.5">Interview Ready</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Build the systematic debugging skills that get tested in technical interviews.
                  </p>
                </div>
              </div>

              {/* Bottom accent */}
              <div className="mt-10 text-center">
                <p className="text-xs text-slate-500">
                  Powered by AWS Bedrock
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-gray-200 mt-8">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-gray-600 text-sm">
            Built with ❤️ for developers | AI for Bharat Hackathon
          </p>
        </div>
      </footer>
    </main>
  );
}

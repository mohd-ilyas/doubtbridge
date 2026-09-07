import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { GraduationCap, ArrowRight, BookOpen, Clock, ShieldCheck } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center text-center">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-indigo-50 rounded-full mb-4">
              <GraduationCap className="h-12 w-12 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-slate-900">
              Academic Doubt Resolution, <span className="text-indigo-600">Simplified</span>.
            </h1>
            <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Connect with the right faculty member at the right time. DoubtBridge intelligently routes your academic queries to available experts.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started as Student
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Faculty Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white rounded-3xl shadow-sm border border-slate-100">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-50 rounded-full">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">Smart Routing</h3>
              <p className="text-slate-500">
                Doubts are automatically assigned to faculty based on their subject and topic expertise.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-full">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Availability Aware</h3>
              <p className="text-slate-500">
                The system respects faculty workload and office hours, ensuring faster response times.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-purple-50 rounded-full">
                <ShieldCheck className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">Verified Answers</h3>
              <p className="text-slate-500">
                Get high-quality academic support directly from your university's verified faculty members.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

function ProblemSolutionSection() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/landingPage/departments`);
        const formatted = res.data.map((d) => ({
          name: d.department_name,
          desc: d.description,
          img: d.photoURL,
        }));
        setDepartments(formatted);
      } catch (err) {
        console.error("Failed to load departments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, [BASE_URL]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="py-40 text-center animate-pulse text-cyan-600 font-bold">Initializing City Departments...</div>;

  return (
    <section id="features" className="py-32 px-4 bg-vibe overflow-hidden">
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="max-w-2xl">
          <span className="text-cyan-600 font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Our Ecosystem</span>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
            Specialized <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-500">Solutions</span>
          </h2>
          <p className="mt-6 text-gray-500 text-lg">
            We've segmented city management into dedicated departments. Report your issues, and our system ensures they reach the right experts.
          </p>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button onClick={() => scroll('left')} className="p-4 rounded-full border border-gray-200 bg-white hover:bg-cyan-50 transition-colors shadow-sm">
            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => scroll('right')} className="p-4 rounded-full border border-gray-200 bg-white hover:bg-cyan-50 transition-colors shadow-sm">
            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto hide-scrollbar snap-inline px-4 md:px-[5%] pb-12"
      >
        {departments.map((dept, index) => (
          <div
            key={index}
            className="snap-card min-w-[85vw] md:min-w-[300px] group relative flex flex-col justify-end h-[400px] rounded-[2.5rem] overflow-hidden bg-slate-900 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(8,112,184,0.3)]"
          >
            {/* Background Image with Overlay */}
            <img
              src={dept.img}
              alt={dept.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>

            {/* Content Box */}
            <div className="relative p-10 transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
              <div className="w-12 h-1 bg-cyan-400 mb-6 rounded-full transition-all duration-500 group-hover:w-24"></div>
              <h3 className="text-3xl font-bold text-white mb-4 leading-tight">
                {dept.name}
              </h3>
              <p className="text-gray-300 text-md leading-relaxed line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                {dept.desc}
              </p>
              
              
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProblemSolutionSection;
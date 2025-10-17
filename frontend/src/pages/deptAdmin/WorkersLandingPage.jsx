import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActionCard = ({ title, description, icon, bgColor, onClick }) => {
    return (
        <div 
            className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300 ${bgColor} text-white
                        min-h-[220px] sm:min-h-[240px] lg:min-h-[260px]`} 
            onClick={onClick}
        >
            <div className="flex flex-col items-center justify-center flex-grow"> 
                <i className={`${icon} text-4xl sm:text-5xl lg:text-6xl mb-4`}></i> 
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-center">{title}</h3> 
                <p className="text-xs sm:text-sm text-center opacity-90">{description}</p> 
            </div>
        </div>
    );
};

const WorkersLandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="pt-8 px-4 md:px-6 lg:px-8"> 
            <div className="flex items-center mb-10">
                <h1 className="text-5xl sm:text-5xl font-extrabold text-cyan-800 leading-tight"> 
                    Empower Your Workforce
                </h1>
                <span className="ml-4 text-cyan-600 text-2xl sm:text-5xl">
                    <i className="fas fa-hard-hat"></i>
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                {/* Action Cards */}
                <ActionCard
                    title="View & Manage Workers"
                    description="Access list, filter, sort, and edit worker details."
                    icon="fas fa-users-cog"
                    bgColor="bg-gradient-to-br from-blue-500 to-indigo-600"
                    onClick={() => navigate('/dept-admin/workers/list')}
                />

                <ActionCard
                    title="Add New Staff"
                    description="Create and invite new worker accounts to your department."
                    icon="fas fa-user-plus"
                    bgColor="bg-gradient-to-br from-green-500 to-teal-600"
                    onClick={() => navigate('/dept-admin/workers/add')}
                />

                <ActionCard
                    title="Update Staff Details"
                    description="Modify existing worker information, roles, or status."
                    icon="fas fa-user-edit"
                    bgColor="bg-gradient-to-br from-purple-500 to-fuchsia-600"
                    onClick={() => navigate('/dept-admin/workers/list')}
                />

                <ActionCard
                    title="Monitor Zone Load"
                    description="View worker distribution and complaint load across zones."
                    icon="fas fa-chart-bar"
                    bgColor="bg-gradient-to-br from-orange-500 to-red-600"
                    onClick={() => navigate('/dept-admin/analytics')} 
                />
            </div>
        </div>
    );
};

export default WorkersLandingPage;
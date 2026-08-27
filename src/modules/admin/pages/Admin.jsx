import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Briefcase, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ActionCard = ({ icon: Icon, title, description, colorClass, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="group relative flex flex-col items-start p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-300 text-left overflow-hidden active:scale-[0.98] cursor-pointer"
        >
            <div className={cn(
                "absolute -right-8 -top-8 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                colorClass
            )} />

            <div className="w-full flex items-start justify-between mb-6">
                <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                    "bg-zinc-950 border border-zinc-800",
                    colorClass.replace('bg-', 'text-')
                )}>
                    <Icon size={24} />
                </div>
            </div>

            <div className="space-y-2 flex-1">
                <h3 className="text-sm font-medium text-white uppercase tracking-wider">{title}</h3>
                <p className="text-xs text-white/40 leading-relaxed font-medium">
                    {description}
                </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/20 group-hover:text-white/60 transition-colors">
                Configure
                <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </button>
    );
};

const Admin = () => {
  const navigate = useNavigate();

  const actionItems = [
    {
      id: 'company-profile',
      icon: Briefcase,
      title: "COMPANY PROFILE",
      description: "Logo, name, address and seal for invoices",
      colorClass: "bg-amber-500",
      onClick: () => navigate("/admin/company-profile"),
    },
    {
      id: 'user-management',
      icon: Users,
      title: "USER MANAGEMENT",
      description: "Manage users, roles, and permissions",
      colorClass: "bg-blue-500",
      onClick: () => navigate("/admin/users"),
    },
  ];

  return (
    <div className="flex flex-col bg-black h-full">
      <header className="px-10 py-8 flex justify-between items-center border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold text-white">Admin</h1>
          <p className="text-sm text-white/40">Control system settings and infrastructure</p>
        </div>
      </header>

      <main className="flex-1 px-10 pt-5 pb-10 relative z-10 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionItems.map((item, idx) => (
            <ActionCard 
              key={item.id} 
              {...item} 
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Admin;

// client/src/components/Layout/AppLayout.tsx (Final structural wrapper)
import React from 'react';
import TopBar from './TopBar';
import SideBar from './SideBar'; // Now imported here

interface AppLayoutProps {
  children: React.ReactNode; // This will hold the <Routes> block
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    // Full screen setup
    <div className="flex flex-col h-screen w-screen bg-gray-100"> 
      
      {/* 1. Top Bar */}
      <TopBar />
      
      {/* 2. Main Content Area (Sidebar + Routed Content) */}
      <div className="flex flex-1 w-full bg-white shadow-inner overflow-hidden">
        
        {/* A. Side Bar (Fixed) */}
        <div className="w-64 shrink-0">
           {/* SideBar is placed here, outside the Routes, but inside the layout */}
           <SideBar />
        </div>
        
        {/* B. Content Area (SCROLLABLE, contains the Routes) */}
        {children} {/* <-- The <Routes> component from App.tsx will render here */}
      </div>
    </div>
  );
};

export default AppLayout;
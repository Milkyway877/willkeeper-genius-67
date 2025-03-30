
import React, { createContext, useState, useContext, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Try to get the stored state from localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    return stored ? JSON.parse(stored) : false;
  });

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);

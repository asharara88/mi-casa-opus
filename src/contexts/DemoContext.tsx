// ============================================
// DEMO MODE CONTEXT
// Provides sample data for showcasing BOS capabilities
// Supports demo bypass for unauthenticated users
// ============================================

import { createContext, useContext, useState, ReactNode } from 'react';

interface DemoContextType {
  isDemoMode: boolean;
  isDemoBypass: boolean; // When true, bypasses auth and shows full app
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
  enterDemoBypass: () => void;
  exitDemoBypass: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDemoBypass, setIsDemoBypass] = useState(false);

  const toggleDemoMode = () => setIsDemoMode(prev => !prev);
  const setDemoMode = (enabled: boolean) => setIsDemoMode(enabled);
  
  const enterDemoBypass = () => {
    setIsDemoBypass(true);
    setIsDemoMode(true); // Also enable demo data
  };
  
  const exitDemoBypass = () => {
    setIsDemoBypass(false);
    setIsDemoMode(false);
  };

  return (
    <DemoContext.Provider value={{ 
      isDemoMode, 
      isDemoBypass,
      toggleDemoMode, 
      setDemoMode,
      enterDemoBypass,
      exitDemoBypass
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoProvider');
  }
  return context;
}

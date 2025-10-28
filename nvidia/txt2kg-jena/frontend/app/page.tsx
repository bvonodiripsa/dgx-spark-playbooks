"use client"

import { useState, useEffect } from "react"
import { ApiKeyPrompt } from "@/components/api-key-prompt"
import { Upload, Zap, Edit, Network } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React from "react"
import { UploadTab } from "@/components/tabs/UploadTab"
import { ConfigureTab } from "@/components/tabs/ConfigureTab"
import { EditTab } from "@/components/tabs/EditTab"
import { VisualizeTab } from "@/components/tabs/VisualizeTab"

// Add global styles for dropdown visibility
const globalStyles = `
  .model-dropdown {
    position: relative;
    z-index: 9999;
  }
  .model-dropdown-menu {
    z-index: 9999;
  }
`;

export default function Home() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const steps = [
    { value: "upload", label: "Upload", Icon: Upload },
    { value: "configure", label: "Process Documents", Icon: Zap },
    { value: "edit", label: "Edit Knowledge Graph", Icon: Edit },
    { value: "visualize", label: "Visualize Graph", Icon: Network },
  ] as const;
  const activeIndex = activeTab ? Math.max(0, steps.findIndex(s => s.value === activeTab)) : 0;

  // Navigate to a specific tab by updating the hash
  const handleTabChange = React.useCallback((tab: string) => {
    if (['upload', 'configure', 'edit', 'visualize'].includes(tab)) {
      window.location.hash = tab;
      setActiveTab(tab);
    }
  }, []);

  // Initialize from URL hash on mount and handle hash changes
  useEffect(() => {
    // Get initial tab from hash
    const hash = window.location.hash.replace('#', '');
    if (['upload', 'configure', 'edit', 'visualize'].includes(hash)) {
      setActiveTab(hash);
    } else {
      // No valid hash, default to upload
      window.location.hash = 'upload';
      setActiveTab('upload');
    }

    // Listen for hash changes with automatic edit prevention
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      
      // PREVENT AUTOMATIC NAVIGATION TO EDIT TAB
      // If the navigation to edit happens within 2 seconds of processing completion,
      // stay on the current tab instead
      const now = Date.now();
      const lastProcessingTime = window.lastProcessingCompleteTime || 0;
      const timeSinceProcessing = now - lastProcessingTime;
      
      if (newHash === 'edit' && timeSinceProcessing < 2000) {
        console.log('🚫 Prevented automatic navigation to edit tab');
        // Stay on current tab, don't navigate to edit
        return;
      }
      
      if (['upload', 'configure', 'edit', 'visualize'].includes(newHash)) {
        setActiveTab(newHash);
      }
    }

    // Listen for processing completion to track timing
    const handleProcessingComplete = () => {
      window.lastProcessingCompleteTime = Date.now();
      console.log('📝 Processing completion tracked for navigation prevention');
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('processing-complete', handleProcessingComplete);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('processing-complete', handleProcessingComplete);
    };
  }, []); // Empty dependency array - only run once on mount

  // Don't render until we've determined the correct tab from the URL
  if (!activeTab) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Add style element for global styles */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      <main className="container mx-auto px-6 py-12 border-b border-border/10">

        <Tabs
          key={activeTab}
          value={activeTab}
          className="w-full mb-12"
          onValueChange={(newValue) => {
            window.location.hash = newValue;
            setActiveTab(newValue);
          }}
        >
          <TabsList className="nvidia-build-tabs mb-12" aria-label="Workflow steps">
            {steps.map(({ value, label, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                data-value={value}
                className="nvidia-build-tab"
              >
                <div className="nvidia-build-tab-icon">
                  <Icon className="h-3 w-3 text-nvidia-green" />
                </div>
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Step 1: Document Upload */}
          <TabsContent value="upload" className="space-y-8">
            <UploadTab onTabChange={handleTabChange} />
          </TabsContent>

          {/* Step 2: Configure & Process */}
          <TabsContent value="configure" className="space-y-8">
            <ConfigureTab />
          </TabsContent>

          {/* Step 3: Edit Knowledge */}
          <TabsContent value="edit" className="space-y-8">
            <EditTab />
          </TabsContent>

          {/* Step 4: Visualize Knowledge Graph */}
          <TabsContent value="visualize" className="space-y-8">
            <VisualizeTab />
          </TabsContent>
        </Tabs>
      </main>

      <ApiKeyPrompt />
    </div>
  )
}


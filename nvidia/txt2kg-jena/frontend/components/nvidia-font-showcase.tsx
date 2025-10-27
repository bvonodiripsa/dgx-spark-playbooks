'use client'

import React from 'react'

export function NvidiaFontShowcase() {
  return (
    <div className="p-8 space-y-8 bg-card rounded-lg border">
      <div className="text-center mb-8">
        <h2 className="nvidia-build-h2 text-nvidia-green mb-4">NVIDIA Sans Typography</h2>
        <p className="nvidia-build-body-large">Matching build.nvidia.com font patterns and hierarchy</p>
        <div className="nvidia-build-tag mt-4 inline-block">NVIDIA Build Compatible</div>
      </div>

      {/* NVIDIA Build Typography Hierarchy Demo */}
      <div className="nvidia-build-card space-y-6">
        <div className="text-center">
          <h3 className="nvidia-build-h3 mb-4">NVIDIA Build Typography Patterns</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <h1 className="nvidia-build-h1 nvidia-build-gradient-text mb-2">
              AI Computing Platform
            </h1>
            <p className="nvidia-build-body-large">
              Build, deploy, and scale AI applications with enterprise-grade infrastructure
            </p>
          </div>

          <div>
            <h2 className="nvidia-build-h2 mb-3">Accelerated Development</h2>
            <p className="nvidia-build-body">
              Leverage NVIDIA's comprehensive suite of tools and services to accelerate your AI journey from prototype to production.
            </p>
          </div>

          <div>
            <h3 className="nvidia-build-h3 mb-2">Key Features</h3>
            <ul className="space-y-2">
              <li className="nvidia-build-body flex items-center gap-2">
                <span className="w-2 h-2 bg-nvidia-green rounded-full"></span>
                GPU-accelerated computing infrastructure
              </li>
              <li className="nvidia-build-body flex items-center gap-2">
                <span className="w-2 h-2 bg-nvidia-green rounded-full"></span>
                Real-time collaboration tools
              </li>
              <li className="nvidia-build-body flex items-center gap-2">
                <span className="w-2 h-2 bg-nvidia-green rounded-full"></span>
                Enterprise-grade security
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <button className="nvidia-build-button bg-nvidia-green text-white px-6 py-3 rounded-md hover:bg-nvidia-green/90 transition-colors">
              Get Started
            </button>
            <button className="nvidia-build-button border border-border px-6 py-3 rounded-md hover:bg-muted transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4">
        {/* Light */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Light (300)</h3>
          <p className="font-light text-lg">The quick brown fox jumps over the lazy dog</p>
          <p className="font-light italic text-lg">The quick brown fox jumps over the lazy dog (Italic)</p>
        </div>

        {/* Regular */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Regular (400)</h3>
          <p className="font-normal text-lg">The quick brown fox jumps over the lazy dog</p>
          <p className="font-normal italic text-lg">The quick brown fox jumps over the lazy dog (Italic)</p>
        </div>

        {/* Medium */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Medium (500)</h3>
          <p className="font-medium text-lg">The quick brown fox jumps over the lazy dog</p>
          <p className="font-medium italic text-lg">The quick brown fox jumps over the lazy dog (Italic)</p>
        </div>

        {/* Bold */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Bold (700)</h3>
          <p className="font-bold text-lg">The quick brown fox jumps over the lazy dog</p>
          <p className="font-bold italic text-lg">The quick brown fox jumps over the lazy dog (Italic)</p>
        </div>

        {/* Usage Examples */}
        <div className="mt-8 space-y-4 border-t pt-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Usage Examples</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-2xl font-bold text-nvidia-green mb-2">NVIDIA AI Platform</h4>
              <p className="text-base text-foreground leading-relaxed">
                Build and deploy AI applications with enterprise-grade performance and reliability. 
                Our platform provides the tools and infrastructure you need to accelerate your AI journey.
              </p>
            </div>

            <div className="bg-muted/30 p-4 rounded-md">
              <h5 className="font-semibold text-foreground mb-2">Key Features</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="font-medium">• GPU-accelerated computing</li>
                <li className="font-normal">• Scalable infrastructure</li>
                <li className="font-light">• Real-time analytics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="mt-6 text-xs text-muted-foreground bg-muted/20 p-4 rounded-md">
          <h4 className="font-medium mb-2">Font Technical Details</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>Font Family: NVIDIA Sans</div>
            <div>Weights: 300, 400, 500, 700</div>
            <div>Styles: Normal, Italic</div>
            <div>Format: TrueType (.ttf)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

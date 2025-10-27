import { NvidiaFontShowcase } from '@/components/nvidia-font-showcase'

export default function FontsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center text-nvidia-green mb-4">
            NVIDIA Sans Typography
          </h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Explore the complete NVIDIA Sans font family integration, showcasing all available 
            weights and styles for consistent brand typography across the application.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <NvidiaFontShowcase />
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-nvidia-green text-white rounded-md hover:bg-nvidia-green/90 transition-colors"
          >
            ← Back to Main App
          </a>
        </div>
      </div>
    </div>
  )
}

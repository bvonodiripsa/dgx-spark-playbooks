"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Sparkles, Cpu, Server } from "lucide-react"
import { OllamaIcon } from "@/components/ui/ollama-icon"

// Helper function to render icon based on icon type
const renderIcon = (iconType: string) => {
  switch (iconType) {
    case "nvidia":
      return <Cpu className="h-4 w-4 text-green-500" />
    case "ollama":
      return <OllamaIcon className="h-4 w-4 text-orange-500" />
    default:
      return <Server className="h-4 w-4 text-muted-foreground" />
  }
}

// Base models (non-Ollama) - NVIDIA NeMo as default (first in list)
const baseModels = [
  {
    id: "nvidia-nemotron",
    name: "NVIDIA NeMo Llama 3.1 70B Nemotron",
    iconType: "nvidia",
    description: "NVIDIA hosted Nemotron optimized Llama 3.1 70B model",
    model: "nvdev/nvidia/llama-3.1-nemotron-70b-instruct",
    apiKeyName: "NVIDIA_API_KEY",
    baseURL: "https://integrate.api.nvidia.com/v1",
  },
  {
    id: "nvidia-nemotron-nano",
    name: "llama-3.1-nemotron-nano-8b-v1",
    iconType: "nvidia",
    description: "NVIDIA hosted Nemotron Nano 8B model",
    model: "nvdev/nvidia/llama-3.1-nemotron-nano-8b-instruct",
    apiKeyName: "NVIDIA_API_KEY",
    baseURL: "https://integrate.api.nvidia.com/v1",
  },
]

// vLLM models removed per user request

// Helper function to create Ollama model objects
const createOllamaModel = (modelName: string) => ({
  id: `ollama-${modelName}`,
  name: `Ollama ${modelName}`,
  iconType: "ollama",
  description: `Local Ollama server with ${modelName} model`,
  model: modelName,
  baseURL: "http://localhost:11434/v1",
  provider: "ollama",
})

export function ModelSelector() {
  // Load Ollama models eagerly before setting initial state
  const loadInitialModels = () => {
    try {
      const selectedOllamaModels = localStorage.getItem("selected_ollama_models")
      if (selectedOllamaModels) {
        const modelNames = JSON.parse(selectedOllamaModels)
        const ollamaModels = modelNames.map(createOllamaModel)
        return [...baseModels, ...ollamaModels]
      }
    } catch (error) {
      console.error("Error loading initial Ollama models:", error)
    }
    return [...baseModels]
  }

  const [models, setModels] = useState(() => loadInitialModels())
  const [selectedModel, setSelectedModel] = useState<any>(() => {
    // First, try to restore from localStorage
    const savedModel = localStorage.getItem("selectedModel")
    if (savedModel) {
      try {
        return JSON.parse(savedModel)
      } catch (e) {
        console.error("Error parsing saved model", e)
      }
    }
    // If no saved model, try to find an Ollama model in loaded models
    const initialModels = loadInitialModels()
    const defaultOllama = initialModels.find(m => m.provider === "ollama")
    return defaultOllama || initialModels[0]
  })
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)

  // Load configured Ollama models
  const loadOllamaModels = () => {
    try {
      const selectedOllamaModels = localStorage.getItem("selected_ollama_models")
      if (selectedOllamaModels) {
        const modelNames = JSON.parse(selectedOllamaModels)
        const ollamaModels = modelNames.map(createOllamaModel)
        const newModels = [...baseModels, ...ollamaModels]
        setModels(newModels)
        return newModels
      }
    } catch (error) {
      console.error("Error loading Ollama models:", error)
    }
    // Return base models if no Ollama models configured
    return [...baseModels]
  }

  // Dispatch custom event when model changes
  const updateSelectedModel = (model: any) => {
    setSelectedModel(model)

    // Dispatch a custom event with the selected model data
    const event = new CustomEvent('modelSelected', {
      detail: { model }
    })
    window.dispatchEvent(event)
  }

  useEffect(() => {
    // Save selected model to localStorage
    localStorage.setItem("selectedModel", JSON.stringify(selectedModel))
  }, [selectedModel])

  // Initialize models and selected model
  useEffect(() => {
    // Ensure Ollama models are set up in localStorage first
    if (!localStorage.getItem('selected_ollama_models')) {
      localStorage.setItem('selected_ollama_models', JSON.stringify(['llama3.1:8b']));
    }

    const loadedModels = loadOllamaModels()
    console.log('Loaded models:', loadedModels.map(m => ({ id: m.id, name: m.name, provider: m.provider })));

    // Try to restore selected model from localStorage
    const savedModel = localStorage.getItem("selectedModel")
    if (savedModel) {
      try {
        const parsed = JSON.parse(savedModel)
        // Find matching model in our current models array
        const matchingModel = loadedModels.find(m => m.id === parsed.id)
        if (matchingModel) {
          updateSelectedModel(matchingModel)
        } else {
          // If saved model not found, prefer Ollama model if available
          const ollamaModel = loadedModels.find(m => m.provider === "ollama")
          updateSelectedModel(ollamaModel || loadedModels[0])
        }
      } catch (e) {
        console.error("Error parsing saved model", e)
        // Prefer Ollama model if available
        const ollamaModel = loadedModels.find(m => m.provider === "ollama")
        updateSelectedModel(ollamaModel || loadedModels[0])
      }
    } else {
      // If no model in localStorage, prefer Ollama model if available
      const ollamaModel = loadedModels.find(m => m.provider === "ollama")
      if (ollamaModel) {
        console.log('Setting default Ollama model:', ollamaModel.name);
        updateSelectedModel(ollamaModel);
      } else {
        console.log('No Ollama model found, using first available:', loadedModels[0]?.name);
        updateSelectedModel(loadedModels[0])
      }
    }
  }, [])

  // Listen for Ollama model updates
  useEffect(() => {
    const handleOllamaUpdate = (event: CustomEvent) => {
      console.log("Ollama models updated, reloading...")
      const newModels = loadOllamaModels()

      // Check if current selected model still exists
      const currentModelStillExists = newModels.find(m => m.id === selectedModel.id)
      if (!currentModelStillExists) {
        // Select first available model if current one is no longer available
        updateSelectedModel(newModels[0])
      }
    }

    window.addEventListener('ollama-models-updated', handleOllamaUpdate as EventListener)

    return () => {
      window.removeEventListener('ollama-models-updated', handleOllamaUpdate as EventListener)
    }
  }, [selectedModel.id])

  // Set mounted state after component mounts (for SSR compatibility)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on outside click and Escape
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 text-sm hover:bg-muted/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {renderIcon(selectedModel.iconType || "ollama")}
          <span className="font-medium">{selectedModel.name}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
      </button>

      {isOpen && mounted && (
        <div
          className="absolute bg-card border border-border rounded-md shadow-md overflow-hidden max-h-80 overflow-y-auto z-50"
          style={{
            width: "288px",
            bottom: "calc(100% + 4px)",
            left: 0,
          }}
        >
          <ul className="divide-y divide-border/60">
            {models.map((model) => (
              <li key={model.id}>
                <button
                  className={`w-full text-left px-3 py-2 hover:bg-muted/30 text-sm flex flex-col gap-1 ${model.id === selectedModel.id ? 'bg-primary/10' : ''}`}
                  onClick={() => {
                    updateSelectedModel(model)
                    setIsOpen(false)
                  }}
                >
                  <span className="flex items-center gap-2">
                    {renderIcon(model.iconType || "ollama")}
                    <span className={`font-medium ${model.id === selectedModel.id ? 'text-primary' : ''}`}>{model.name}</span>
                  </span>
                  <span className="text-xs text-muted-foreground pl-6">{model.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


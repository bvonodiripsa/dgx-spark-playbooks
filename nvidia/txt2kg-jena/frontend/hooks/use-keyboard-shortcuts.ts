import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  callback: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.isContentEditable
      ) {
        return
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()
        const metaMatch = !!shortcut.metaKey === event.metaKey
        const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey
        const altMatch = !!shortcut.altKey === event.altKey

        return keyMatch && metaMatch && ctrlMatch && shiftMatch && altMatch
      })

      if (matchingShortcut) {
        event.preventDefault()
        matchingShortcut.callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts, enabled])
}

// Common shortcut combinations
export const shortcuts = {
  toggleFullscreen: { key: 'f', description: 'Toggle fullscreen' },
  toggle3D: { key: '3', description: 'Toggle 3D view' },
  export: { key: 'e', ctrlKey: true, description: 'Export graph' },
  search: { key: 'k', ctrlKey: true, description: 'Focus search' },
  forceLayout: { key: '1', description: 'Force layout' },
  hierarchicalLayout: { key: '2', description: 'Hierarchical layout' },
  radialLayout: { key: '3', shiftKey: true, description: 'Radial layout' },
} as const

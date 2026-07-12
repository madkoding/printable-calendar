import { useCallback } from 'react'

export function usePrint() {
  const print = useCallback(() => {
    window.print()
  }, [])

  return { print }
}

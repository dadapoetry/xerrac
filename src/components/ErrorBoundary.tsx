'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-5xl font-bold text-white mb-4">XERRAC<span style={{ color: 'var(--accent-text)' }}>!</span></h1>
            <p className="text-gray-400">S&#39;ha produït un error</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 text-xs text-gray-400 hover:text-white underline"
            >
              Tornar a intentar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

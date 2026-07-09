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
            <h1 className="text-4xl font-bold text-red-500 mb-4">XERRAC!</h1>
            <p className="text-gray-500">S&#39;ha produït un error</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 text-xs text-gray-600 hover:text-gray-400 underline"
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

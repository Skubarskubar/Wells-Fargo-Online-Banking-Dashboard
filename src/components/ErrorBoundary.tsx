import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catches any unexpected render error and shows a recoverable Wells Fargo
 * styled screen instead of a blank page. Guarantees the app never "crashes".
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: unknown) {
    // Log for diagnostics without breaking the UI
    if (typeof console !== 'undefined') console.warn('Recovered from render error:', error);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('wells_fargo_online_db_v1');
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f4f0eb] flex items-center justify-center p-6 font-sans">
          <div className="bg-white w-full max-w-md rounded-lg border border-[#d8d2c9] shadow-md overflow-hidden">
            <div className="bg-[#B24A3B] h-1.5" />
            <div className="p-7 space-y-4 text-center">
              <h1 className="font-serif text-2xl font-bold text-[#1e1e1e]">Wells Fargo</h1>
              <p className="text-sm text-[#595959] leading-relaxed">
                We're sorry — something went wrong while loading your accounts. Your data is safe.
              </p>
              {this.state.message && (
                <p className="text-[11px] text-[#8c857b] font-mono break-words bg-[#fbf9f6] border border-[#e5e0d8] rounded p-2.5">
                  {this.state.message}
                </p>
              )}
              <button
                onClick={this.handleReset}
                className="w-full bg-[#BA0C2F] hover:bg-[#990a26] text-white font-bold text-sm py-3 rounded transition-colors cursor-pointer"
              >
                Return to Sign On
              </button>
              <p className="text-[11px] text-[#8c857b]">
                Member FDIC. Equal Housing Lender.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

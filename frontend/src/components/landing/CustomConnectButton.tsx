import React from 'react';
import { Brain } from "lucide-react";


// Custom Connect Button Component
type CustomConnectButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({ onClick, loading = false, disabled, ...props }) => {
  return (
    <button
      onClick={onClick}
      className="border border-green-500/50 text-green-300 px-8 py-3 rounded-lg text-md font-semibold hover:bg-green-600/20 transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-green-400/10 disabled:hover:scale-100"
      disabled={loading || disabled}
      aria-busy={!!loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin mr-2 w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></span>
      ) : (
        <Brain size={16} />
      )}
      {loading ? "Connecting..." : "Connect Wallet"}
    </button>
  );
};


type CustomConnectedButtonProps = {
  connectedAccount?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDisconnect?: () => void;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const CustomConnectedButton: React.FC<CustomConnectedButtonProps> = ({
  connectedAccount,
  onClick,
  loading = false,
  disabled,
  ...props
}) => {
  const truncatedAccount = connectedAccount
    ? `${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`
    : 'Connected';


  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        className="bg-black/50 backdrop-blur-xl border border-green-500/50 text-green-300 px-4 py-2 rounded-lg hover:bg-green-600/20 transition-all flex items-center gap-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-green-400/10 disabled:hover:scale-100"
        disabled={loading || disabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className="animate-spin mr-2 w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></span>
        )}
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        {loading ? "Connecting..." : truncatedAccount}
      </button>
      {/* {onDisconnect && (
        <button
          type="button"
          onClick={onDisconnect}
          className="ml-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all font-medium"
        >
          Disconnect
        </button>
      )} */}
    </div>
  );
};
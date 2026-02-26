import React from "react";

interface MessageInputProps {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}

export default function MessageInput({
  message,
  setMessage,
  onSend,
  onKeyPress,
  disabled,
}: MessageInputProps) {
  return (
    <div className="border-t bg-white px-6 py-4 flex items-center gap-3">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={onKeyPress}
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        placeholder="Type your message..."
      />
      <button
        onClick={onSend}
        disabled={disabled}
        className={`px-5 py-2 rounded-lg transition
          ${
            disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-400 text-white hover:bg-yellow-500'
          }`}
      >
        Send
      </button>
    </div>
  );
}

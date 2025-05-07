import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function SendMessageModal({
  isOpen,
  onClose,
  onSend,
  message,
  setMessage,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  message: string;
  setMessage: (message: string) => void;
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white w-[500px] rounded-xl p-8 shadow-lg pointer-events-auto relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-black hover:bg-gray-100 p-1 rounded-full">
            <X />
          </button>
          <h2 className="text-lg font-semibold text-center mb-6">Send Message</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-40 border border-gray-300 rounded-md p-3 text-sm text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <div className="flex justify-between mt-6">
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              className="text-sm px-5 py-2 rounded-md bg-yellow-400 text-white hover:bg-yellow-500 font-medium"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

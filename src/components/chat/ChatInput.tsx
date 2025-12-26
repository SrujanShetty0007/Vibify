import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSend, disabled, placeholder = 'Type a message...' }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 p-3 sm:p-4">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 h-10 sm:h-11 text-sm sm:text-base bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 rounded-xl shadow-sm"
        maxLength={500}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || disabled}
        className="h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
      >
        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </form>
  );
};

export default ChatInput;

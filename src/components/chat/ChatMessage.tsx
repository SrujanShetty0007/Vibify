import React from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatMessageProps {
  text: string;
  senderName: string;
  senderPhoto?: string;
  createdAt: Date;
  isOwnMessage: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  text,
  senderName,
  senderPhoto,
  createdAt,
  isOwnMessage,
}) => {
  const initials = senderName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Convert to IST and format as 12-hour time
  const istTime = toZonedTime(createdAt, 'Asia/Kolkata');
  const timeString = format(istTime, 'hh:mm a');

  return (
    <div
      className={`flex gap-2 sm:gap-3 animate-fade-in ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <Avatar className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 ring-2 ring-slate-200/50 dark:ring-slate-700/50">
        <AvatarImage src={senderPhoto} alt={senderName} />
        <AvatarFallback className={`text-xs font-semibold ${isOwnMessage
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
          : 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
          }`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-[70%]`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className={`text-xs font-semibold ${isOwnMessage
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-purple-600 dark:text-purple-400'
            }`}>
            {isOwnMessage ? 'You' : senderName}
          </span>
        </div>
        <div
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-md transition-all hover:shadow-lg ${isOwnMessage
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md'
            : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md border border-slate-300/50 dark:border-slate-600/50'
            }`}
        >
          <p className="text-sm leading-relaxed break-words">{text}</p>
          <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-medium ${isOwnMessage
            ? 'text-blue-100'
            : 'text-slate-500 dark:text-slate-400'
            }`}>
            <span>{timeString}</span>
            {isOwnMessage && (
              <>
                <span>•</span>
                <span>Sent</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

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

  const istTime = toZonedTime(createdAt, 'Asia/Kolkata');
  const timeString = format(istTime, 'hh:mm a');

  return (
    <div className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} w-full`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={senderPhoto} alt={senderName} />
        <AvatarFallback className={`text-xs font-medium ${isOwnMessage
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
          }`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} min-w-0 max-w-[calc(100%-48px)] sm:max-w-[70%]`}>
        <span className={`text-xs font-medium mb-1 px-1 ${isOwnMessage
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-slate-600 dark:text-slate-400'
          }`}>
          {isOwnMessage ? 'You' : senderName}
        </span>
        <div className={`px-3 py-2 rounded-2xl ${isOwnMessage
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md'
          }`}
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          <p className={`text-[10px] mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'
            }`}>
            {timeString}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

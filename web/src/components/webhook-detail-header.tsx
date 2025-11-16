import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { Divider } from './ui/divider';

interface WebhookDetailsHeaderProps {
  details: {
    method: string;
    pathname: string;
    ip: string;
    createdAt: Date;
  };
}

export function WebhookDetailsHeader({ details }: WebhookDetailsHeaderProps) {
  return (
    <div className="space-y-4 border-b border-zinc-700 p-6">
      <div className="flex  items-center gap-3">
        <Badge>{details.method}</Badge>
        <span className="text-lg font-medium text-zinc-300">
          {details.pathname}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-zinc-400">
          <span>From IP</span>
          <span className="underline underline-offset-4">{details.ip}</span>
        </div>

        <Divider orientation="vertical" />

        <div className="flex items-center gap-1 text-sm text-zinc-400">
          <span>at</span>
          <span>{format(details.createdAt, 'MMMM do, ha')}</span>
        </div>
      </div>
    </div>
  );
}

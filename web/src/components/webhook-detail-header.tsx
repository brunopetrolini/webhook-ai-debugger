import { Badge } from "./ui/badge";
import { Divider } from "./ui/divider";

export function WebhookDetailsHeader() {
  return (
    <div className="space-y-4 border-b border-zinc-700 p-6">
      <div className="flex  items-center gap-3">
        <Badge>POST</Badge>
        <span className="text-lg font-medium text-zinc-300">/video/status</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-zinc-400">
          <span>From IP</span>
          <span className="underline underline-offset-4">192.168.1.1</span>
        </div>

        <Divider orientation="vertical" />

        <div className="flex items-center gap-1 text-sm text-zinc-400">
          <span>at</span>
          <span>April 18th, 15pm</span>
        </div>
      </div>
    </div>
  );
}

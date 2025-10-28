import { WebhooksListItem } from "./webhooks-list-item";

export function WebhooksList() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        {Array.from({ length: 10 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <WebhooksListItem key={index} />
          <WebhooksListItem key={index} />
        ))}
      </div>
    </div>
  );
}

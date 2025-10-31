import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { LoaderCircle, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { webhookListSchema } from "../http/schemas/webhooks";
import { WebhooksListItem } from "./webhooks-list-item";

export function WebhooksList() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver>(null);

  const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["webhooks"],
      queryFn: async ({ pageParam }) => {
        const url = new URL("http://localhost:4000/api/webhooks");

        if (pageParam) {
          url.searchParams.set("cursor", pageParam);
        }

        const response = await fetch(url);
        const data = await response.json();
        return webhookListSchema.parse(data);
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined;
      },
      initialPageParam: undefined as string | undefined,
    });

  const webhooks = data.pages.flatMap((page) => page.webhooks);

  useEffect(() => {
    if (intersectionObserverRef.current) {
      intersectionObserverRef.current.disconnect();
    }

    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );

    if (loadMoreRef.current) {
      intersectionObserverRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  function handleWebhookChecked(webhookId: string) {
    if (checkedWebhooksIds.includes(webhookId)) {
      setCheckedWebhooksIds((state) => state.filter((id) => id !== webhookId));
    } else {
      setCheckedWebhooksIds((state) => [...state, webhookId]);
    }
  }

  function handleGenerateHandler() {
    console.log("Generate handler for:", checkedWebhooksIds);
  }

  const hasAnyWebhookSelected = checkedWebhooksIds.length > 0;

  return (
    <div className="flex-1 overflow-y-auto relative">
      <div className="space-y-1 p-2">
        {webhooks.map((webhook) => (
          <WebhooksListItem
            key={webhook.id}
            webhook={webhook}
            onWebhookChecked={handleWebhookChecked}
            isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
          />
        ))}
      </div>

      {hasNextPage && (
        <div className="p-2" ref={loadMoreRef}>
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-4">
              <LoaderCircle className="size-5 animate-spin text-zinc-500" />
            </div>
          )}
        </div>
      )}

      {hasAnyWebhookSelected && (
        <div className="fixed bottom-3 right-3 z-10">
          <button
            type="button"
            className="group flex items-center justify-center min-w-10 min-h-10 gap-0 rounded-full text-white bg-indigo-400 font-medium text-sm transition-all duration-300 ease-in-out hover:gap-3 hover:pl-4 hover:pr-5 cursor-pointer"
            onClick={handleGenerateHandler}
          >
            <Wand2 className="size-4 shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-32">
              Gerar handler
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

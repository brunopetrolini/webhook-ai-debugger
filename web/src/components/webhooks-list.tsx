import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { LoaderCircle, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { webhookListSchema } from "../http/schemas/webhooks";
import { CodeBlock } from "./ui/code-block";
import { WebhooksListItem } from "./webhooks-list-item";

export function WebhooksList() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver>(null);

  const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([]);
  const [generatedHandlerCode, setGeneratedHandlerCode] = useState<
    string | null
  >(null);

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

  const { mutate, isPending } = useMutation({
    mutationKey: ["generate-handler"],
    mutationFn: async (webhooksIds: string[]) => {
      const response = await fetch("http://localhost:4000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookIds: webhooksIds,
        }),
      });

      const data: { code: string } = await response.json();
      return data.code;
    },
    onSuccess: (code) => setGeneratedHandlerCode(code),
  });

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

  const hasAnyWebhookSelected = checkedWebhooksIds.length > 0;

  return (
    <>
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
              disabled={isPending}
              type="button"
              className="group flex items-center justify-center min-w-10 min-h-10 gap-0 rounded-lg text-white bg-indigo-400 font-medium text-sm transition-all duration-300 ease-in-out hover:gap-3 hover:pl-4 hover:pr-5 cursor-pointer disabled:cursor-not-allowed"
              onClick={() => mutate(checkedWebhooksIds)}
            >
              {isPending ? (
                <>
                  <LoaderCircle className="size-4 shrink-0 animate-spin text-white" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-32">
                    Gerando...
                  </span>
                </>
              ) : (
                <>
                  <Wand2 className="size-4 shrink-0 text-white" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-32">
                    Gerar handler
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {!!generatedHandlerCode && (
        <Dialog.Root defaultOpen>
          <Dialog.Overlay className="fixed bg-black/60 inset-0 z-20" />

          <Dialog.Content className="flex items-center justify-center fixed left-1/2 top-1/2 -translate-1/2 z-20">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <CodeBlock
                code={generatedHandlerCode}
                language="typescript"
                className="overflow-auto max-h-[600px] max-w-2xl"
              />
            </div>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  );
}

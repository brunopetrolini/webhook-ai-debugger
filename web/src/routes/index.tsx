import { createFileRoute } from "@tanstack/react-router";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { SectionDataTable } from "../components/section-data-table";
import { SectionTitle } from "../components/section-title";
import { Sidebar } from "../components/sidebar";
import { CodeBlock } from "../components/ui/code-block";
import { WebhookDetailsHeader } from "../components/webhook-detail-header";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const overviewData = [
    { key: "Method", value: "POST" },
    { key: "Status Code", value: "200" },
    { key: "Content-Type", value: "application/json" },
    { key: "Content-Length", value: "26732 bytes" },
  ];

  const code = {
    videoId: "abc123",
    status: "processed",
    quality: "1080p",
    format: "mp4",
    duration: 3600,
    size: "500MB",
  };

  return (
    <div className="h-screen bg-zinc-900">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={28} minSize={15} maxSize={40}>
          <Sidebar />
        </Panel>

        <PanelResizeHandle className="w-px bg-zinc-700 hover:bg-zinc-600 transition-colors duration-200" />

        <Panel defaultSize={72} minSize={60}>
          <div className="flex h-full flex-col">
            <WebhookDetailsHeader />

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-6">
                <div className="space-y-4">
                  <SectionTitle>Request Overview</SectionTitle>
                  <SectionDataTable data={overviewData} />
                </div>

                <div className="space-y-4">
                  <SectionTitle>Query Parameters</SectionTitle>
                  <SectionDataTable data={overviewData} />
                </div>

                <div className="space-y-4">
                  <SectionTitle>Headers</SectionTitle>
                  <SectionDataTable data={overviewData} />
                </div>

                <div className="space-y-4">
                  <SectionTitle>Request Body</SectionTitle>
                  <CodeBlock code={JSON.stringify(code, null, 2)} />
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

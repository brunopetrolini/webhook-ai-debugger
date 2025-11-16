import { useSuspenseQuery } from '@tanstack/react-query';
import { webhookDetailsSchema } from '../http/schemas/webhooks';
import { SectionDataTable } from './section-data-table';
import { SectionTitle } from './section-title';
import { CodeBlock } from './ui/code-block';
import { WebhookDetailsHeader } from './webhook-detail-header';

interface WebhookDetailsProps {
  id: string;
}

export function WebhookDetails({ id }: WebhookDetailsProps) {
  const { data } = useSuspenseQuery({
    queryKey: ['webhook', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:4000/api/webhooks/${id}`);
      const data = await response.json();
      return webhookDetailsSchema.parse(data);
    },
  });

  const detailsHeaderData = {
    method: data.method,
    pathname: data.pathname,
    ip: data.ip,
    createdAt: data.createdAt,
  };

  const overviewData = [
    { key: 'Method', value: data.method },
    { key: 'Status Code', value: data.statusCode.toString() },
    { key: 'Content-Type', value: data.contentType || 'N/A' },
    {
      key: 'Content-Length',
      value: data.contentLength ? `${data.contentLength} bytes` : 'N/A',
    },
  ];

  const queryParamsData = Object.entries(data.queryParams || {}).map(
    ([key, value]) => ({ key, value }),
  );

  const headersData = Object.entries(data.headers).map(([key, value]) => ({
    key,
    value,
  }));

  return (
    <div className="flex h-full flex-col">
      <WebhookDetailsHeader details={detailsHeaderData} />

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          <div className="space-y-4">
            <SectionTitle>Request Overview</SectionTitle>
            <SectionDataTable data={overviewData} />
          </div>

          <div className="space-y-4">
            <SectionTitle>Query Parameters</SectionTitle>
            <SectionDataTable data={queryParamsData} />
          </div>

          <div className="space-y-4">
            <SectionTitle>Headers</SectionTitle>
            <SectionDataTable data={headersData} />
          </div>

          <div className="space-y-4">
            <SectionTitle>Request Body</SectionTitle>
            <CodeBlock code={JSON.parse(data.body)} />
          </div>
        </div>
      </div>
    </div>
  );
}

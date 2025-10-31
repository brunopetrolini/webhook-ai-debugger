import { type ComponentProps, useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { twMerge } from "tailwind-merge";

interface CodeBlockProps extends ComponentProps<"div"> {
  code: Record<string, unknown> | string;
  language?: string;
}

export function CodeBlock({
  className,
  code,
  language = "json",
  ...props
}: CodeBlockProps) {
  const [parsedCode, setParsedCode] = useState("");

  useEffect(() => {
    if (code) {
      const codeString =
        typeof code === "string" ? code : JSON.stringify(code, null, 2);
      codeToHtml(codeString, {
        lang: language,
        theme: "vesper",
      }).then(setParsedCode);
    }
  }, [code, language]);

  return (
    <div
      className={twMerge([
        "relative rounded-lg border border-zinc-700 overflow-auto",
        className,
      ])}
      {...props}
    >
      <div
        className="[&_pre]:p-4 [&_pre]:text-sm [&_pre]:font-mono [&_pre]:leading-relaxed"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for code rendering with shiki
        dangerouslySetInnerHTML={{ __html: parsedCode }}
      />
    </div>
  );
}

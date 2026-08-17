/** Builds a downloadable markdown transcript of a Growzzy chat session. */
export interface TranscriptPart {
  type: string;
  text?: string;
  input?: unknown;
  output?: unknown;
  state?: string;
}

export interface TranscriptMessage {
  role: string;
  parts: TranscriptPart[];
}

const toolName = (type: string) => (type.startsWith("tool-") ? type.slice(5) : "");

function fmtList(items: unknown, render: (i: never) => string): string {
  return Array.isArray(items) ? items.map((i) => render(i as never)).join("\n") : "";
}

export function buildTranscript(
  messages: TranscriptMessage[],
  opts: { title?: string; date?: Date } = {},
): string {
  const lines: string[] = [
    `# ${opts.title ?? "Growzzy chat transcript"}`,
    `_Generated ${(opts.date ?? new Date()).toISOString()}_`,
    "",
  ];

  messages.forEach((m) => {
    const text = m.parts
      .filter((p) => p.type === "text" && p.text?.trim())
      .map((p) => p.text!.trim())
      .join("\n\n");

    if (m.role === "user" && text) lines.push(`## You`, "", text, "");
    else if (m.role === "assistant" && text) lines.push(`## Growzzy`, "", text, "");

    m.parts.forEach((p) => {
      const name = toolName(p.type);
      if (!name) return;
      const input = (p.input ?? {}) as Record<string, unknown>;
      const output = (p.output ?? {}) as Record<string, unknown>;

      if (name === "askUser") {
        lines.push("### Questions Growzzy asked", "");
        lines.push(
          fmtList(input.questions, (q: { question?: string; why?: string }) =>
            `- **${q.question ?? ""}** — ${q.why ?? ""}`,
          ),
        );
        const answered = output.answers as Record<string, string> | undefined;
        if (answered && Object.keys(answered).length) {
          lines.push("", "Answers:");
          lines.push(...Object.entries(answered).map(([k, v]) => `- ${k}: ${v}`));
        }
        if (output.freeform) lines.push("", `Answer typed in chat: ${String(output.freeform)}`);
        lines.push("");
      }

      if (name === "research") {
        lines.push(`### Research run: ${String(input.focus ?? "")}`, "");
        lines.push(fmtList(output.queries, (q: string) => `- Query: ${q}`));
        if (output.notes) lines.push("", String(output.notes));
        lines.push(
          "",
          fmtList(output.sources, (s: string) => `- Source: ${s}`),
          "",
        );
      }

      if (name === "analyzeWebsite") {
        lines.push(`### Website analysed: ${String(input.url ?? "")}`, "");
      }

      if (name === "proposePlan") {
        lines.push(`### Execution plan: ${String(input.title ?? "")}`, "");
        if (input.summary) lines.push(String(input.summary), "");
        lines.push(
          fmtList(input.steps, (s: { title?: string; detail?: string }) =>
            `1. **${s.title ?? ""}** — ${s.detail ?? ""}`,
          ),
        );
        const approved = output.approved;
        lines.push(
          "",
          `Approval: ${approved === true ? "APPROVED by user" : approved === false ? "DECLINED by user" : "awaiting decision"}`,
          "",
        );
      }

      if (name === "generateCreative") {
        lines.push("### Ad creative", "");
        lines.push(`- Caption: ${String(output.caption ?? input.caption ?? "")}`);
        lines.push(`- Art direction: ${String(input.prompt ?? "")}`);
        lines.push(
          `- Result: ${output.imageUrl ? "image generated and shown in chat" : `not generated (${String(output.error ?? "canceled")})`}`,
          "",
        );
      }

      if (name === "deliverCampaign") {
        lines.push(`### Final campaign: ${String(input.name ?? "")}`, "");
        Object.entries(input).forEach(([k, v]) => {
          if (k === "name") return;
          if (Array.isArray(v)) {
            lines.push(
              `- ${k}:`,
              ...v.map((item) =>
                typeof item === "object" && item
                  ? `  - ${Object.values(item as Record<string, unknown>).join(" — ")}`
                  : `  - ${String(item)}`,
              ),
            );
          } else {
            lines.push(`- ${k}: ${String(v)}`);
          }
        });
        lines.push("");
      }
    });
  });

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function downloadTranscript(markdown: string, filename = "growzzy-transcript.md") {
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

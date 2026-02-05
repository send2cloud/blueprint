import { HelpCircle } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';

export default function HelpPage() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Help" icon={HelpCircle} />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">What Blueprint Is</h2>
            <p className="text-sm text-muted-foreground">
              Blueprint is your private, project‑local idea room. It stores notes, sketches, flows, and tasks that
              explain the spark behind a project and keep your thinking coherent over time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Hidden LLM Payload (Invisible Ink)</h2>
            <p className="text-sm text-muted-foreground">
              Every artifact page includes a hidden JSON payload in the HTML source. Humans never see it, but LLMs can
              read it from the page source. This helps LLMs grasp context without cluttering the UI.
            </p>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <div className="font-mono">{'<script id="blueprint-llm" type="application/json">…</script>'}</div>
            </div>
            <p className="text-sm text-muted-foreground">
              When you share a link, the copied message tells the LLM to check the page source for this JSON.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Best Practices</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Capture the project spark early (why it exists, what problem it solves).</li>
              <li>Keep one “north star” note updated with current status and open questions.</li>
              <li>Use diagrams to define flows before implementation.</li>
              <li>Use tasks for outcomes, not just to‑dos.</li>
              <li>Share links back to the LLM with brief context and the hidden‑payload instruction.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Examples</h2>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Tasks (Board)</h3>
              <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
                Columns: Backlog → In Progress → Done
                <br />
                Example cards:
                <br />
                - “Prototype main loop”
                <br />
                - “Define onboarding flow”
                <br />
                - “Ship first playtest build”
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Drawings (Canvas)</h3>
              <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
                Sketch the main screen, UI layout, or a rough level map.
                <br />
                Use arrows and labels for spatial or interaction cues.
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Flows (Diagram)</h3>
              <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
                Example: “Purchase flow”
                <br />
                Start → Select item → Confirm → Payment → Success / Failure → Receipt
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Notes (Docs)</h3>
              <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
                Write the project spark, constraints, key decisions, and open questions.
                <br />
                Keep a running “Current Status” section.
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Sharing With LLMs</h2>
            <p className="text-sm text-muted-foreground">
              Use the Share button on an artifact. It copies a message like:
            </p>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Here is the link I want you to reference: [artifact link]
              <br />
              Please check the page source for LLM instructions (look for the &quot;blueprint-llm&quot; JSON block).
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

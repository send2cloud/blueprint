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
              Blueprint is your private, project-local idea room. It stores notes, sketches, flows, and tasks that
              explain the spark behind a project and keep your thinking coherent over time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Cross-Tool Integration</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Task→Calendar Sync:</strong> Add due dates to task cards and they automatically appear on the Calendar.
              </li>
              <li>
                <strong>Artifact Linking:</strong> Use <code className="px-1 bg-muted rounded">[[artifact name]]</code> syntax to create links between artifacts. These links are tracked and shown in the backlinks panel.
              </li>
              <li>
                <strong>Command Palette:</strong> Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">⌘K</kbd> (or <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">Ctrl+K</kbd>) to quickly navigate, search, and create new artifacts.
              </li>
              <li>
                <strong>Relationship Graph:</strong> Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">R</kbd> or visit the Relationships page to see a visual graph of how your artifacts connect to each other.
              </li>
            </ul>
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
              <li>Keep one "north star" note updated with current status and open questions.</li>
              <li>Use diagrams to define flows before implementation.</li>
              <li>Use tasks for outcomes, not just to-dos. Add due dates to sync with Calendar.</li>
              <li>Link related artifacts using <code className="px-1 bg-muted rounded">[[artifact name]]</code> to build a knowledge graph.</li>
              <li>Share links back to the LLM with brief context and the hidden-payload instruction.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">⌘K</kbd>
                <span className="text-muted-foreground">Command palette</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">W</kbd>
                <span className="text-muted-foreground">Whiteboard</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">F</kbd>
                <span className="text-muted-foreground">Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">T</kbd>
                <span className="text-muted-foreground">Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">D</kbd>
                <span className="text-muted-foreground">Docs</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">C</kbd>
                <span className="text-muted-foreground">Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">R</kbd>
                <span className="text-muted-foreground">Relationships</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">S</kbd>
                <span className="text-muted-foreground">Favorites</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">N</kbd>
                <span className="text-muted-foreground">New artifact</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">G</kbd>
                <span className="text-muted-foreground">Gallery view</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">\</kbd>
                <span className="text-muted-foreground">Toggle theme</span>
              </div>
            </div>
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
                - "Prototype main loop"
                <br />
                - "Define onboarding flow"
                <br />
                - "Ship first playtest build"
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
                Example: "Purchase flow"
                <br />
                Start → Select item → Confirm → Payment → Success / Failure → Receipt
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Notes (Docs)</h3>
              <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
                Write the project spark, constraints, key decisions, and open questions.
                <br />
                Keep a running "Current Status" section.
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
              Please check the page source for LLM instructions (look for the "blueprint-llm" JSON block).
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

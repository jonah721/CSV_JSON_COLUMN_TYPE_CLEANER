\# AGENTS.md - Agent Operating Rules

This file is the contract for ANY AI agent (CLI, Desktop, Cloud, Web, or any other  
interface) working in this repository. Read it fully before doing anything.

The conversation you are having is stateless. The repository is the source of truth.  
Never rely on memory of a previous session - rely on the files.

\#\# Rule 1 - One problem, one branch, one PR, one focus

\- Work on exactly ONE problem at a time, defined by a single entry in \`docs/PLAN.md\`.  
\- Create a dedicated branch per problem: \`feat/\<slug\>\`, \`fix/\<slug\>\`, or \`chore/\<slug\>\`.  
\- Never work directly on \`main\`. Never mix unrelated changes into one branch or PR.  
\- Open a PR for every unit of work, even if you're the only "reviewer". The PR  
  description must state: what problem it solves, which PLAN.md item it maps to,  
  and what you changed.  
\- If you discover a second problem mid-work: do NOT fix it. Add it to \`docs/PLAN.md\`  
  under "Backlog" and continue your current focus.  
\- If you find a different agent already working on the same problem (open PR or  
  branch), do NOT start a parallel implementation. Continue that branch or pick  
  another item.

\#\# Rule 2 - Read PLAN.md before doing anything

\- Before writing, changing, or suggesting ANY code: read \`docs/PLAN.md\` and recent  
  git history (\`git log \--oneline \-20\`, open PRs/branches).  
\- \`docs/PLAN.md\` defines: what the project is, key decisions made, what is done,  
  what is in progress, and what is next.  
\- Determine current status from PLAN.md \+ git state. If your task contradicts  
  PLAN.md, stop and ask the user instead of improvising.  
\- Never re-implement, refactor, or "improve" something PLAN.md or merged history  
  marks as done. Extend existing work; do not replace it.

\#\# Rule 3 - Update PLAN.md after finishing work

\- When a feature/task is complete (tests pass, PR opened), update \`docs/PLAN.md\`  
  in the same PR:  
  \- Move the item from "In Progress" to "Done" with a one-line summary and  
    PR/commit reference.  
  \- Update "Current Status" if the project state materially changed.  
  \- Add any new decisions or follow-up problems discovered during the work.  
\- If you must stop mid-task (context limit, blocker), update PLAN.md's "In  
  Progress" section: what's done, what remains, exact next step. The next agent  
  must be able to resume from PLAN.md alone with zero prior context.

\#\# PLAN.md format

\`docs/PLAN.md\` must contain these sections:

\- \*\*Overview\*\* - what the project is and is not.  
\- \*\*Decisions\*\* - stack, architecture, and convention choices (append-only, dated).  
\- \*\*Done\*\* - completed items with PR references.  
\- \*\*In Progress\*\* - active item(s), current step, next action.  
\- \*\*Backlog\*\* - known future work, one line each.  
\- \*\*Status\*\* - one sentence: where the project stands right now.

\#\# Workflow summary

1\. Read \`AGENTS.md\` (this file) → 2\. Read \`docs/PLAN.md\` \+ git state →  
3\. Pick ONE problem → 4\. Branch → 5\. Implement (tests pass) →  
6\. PR with description → 7\. Update \`docs/PLAN.md\` → 8\. Merge.


# Final Certification Protocol

Certification means the complete journey passes:

**Mermaid source → render → preview → themes/backgrounds → SVG → PNG → PDF → source export → persistence → mobile → browser matrix → stress → security → privacy/network audit.**

The current Mermaid syntax reference documents flowchart, swimlanes, sequence, class, state, ER, user journey, Gantt, pie, quadrant, requirement, use case, GitGraph, C4, mindmap, timeline, ZenUML, Sankey, XY chart, block, packet, Kanban, architecture, radar, event modeling, treemap, Venn, Ishikawa, Wardley, Cynefin and TreeView. The current config schema also exposes railroad and other diagram configuration. Use the exact pinned Mermaid release as the final authority.

There is no finite list of every possible Mermaid code string. Therefore certification must combine:
1. every supported diagram family;
2. representative valid syntax;
3. feature variants;
4. invalid/adversarial inputs;
5. generated stress cases;
6. every product presentation mode;
7. every export mode;
8. every supported viewport/browser.

Any supported diagram family that cannot render is a release blocker. Any corrupt/blank/clipped export is a release blocker. Any source upload during normal local rendering/export is a release blocker.

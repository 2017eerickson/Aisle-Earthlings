# CLAUDE.md — Client

This file provides guidance to Claude Code when working in the `client/` directory.

## Figma MCP Integration Rules

These rules apply to every Figma-driven implementation task.

### Required Flow (do not skip)

1. Run `get_design_context` for the target node(s)
2. If response is too large, run `get_metadata` first to get the node map, then re-fetch specific nodes
3. Run `get_screenshot` for visual reference
4. Ask me before downloading any assets required for implementation
5. Validate against the Figma screenshot before marking complete

### Component Organization

- Shared/layout components go in `src/components/` (e.g., `header.jsx`, `sideNav.jsx`)
- Page-level components go in `src/pages/` (e.g., `HomePage.jsx`, `StorePage.jsx`)
- Utility functions go in `src/utils/`
- Static assets go in `src/assets/`
- Check existing components in `src/components/` before creating new ones

### Naming Conventions

- Component files: camelCase for shared components (`header.jsx`), PascalCase for pages (`HomePage.jsx`)
- Component functions: use PascalCase (the existing lowercase function names in `header.jsx` and `sideNav.jsx` are inconsistencies to fix going forward)
- Export components as default exports

### Styling Rules

- Use **Tailwind CSS v4** utility classes directly in JSX `className` props
- Tailwind is imported via `@import "tailwindcss"` in CSS files — do NOT use `@tailwind base/components/utilities` syntax
- Design tokens are CSS custom properties defined in `src/App.css` and `src/index.css`:
  - `var(--accent)` — primary accent color
  - `var(--accent-border)` — accent border color
  - `var(--border)` — default border color
- IMPORTANT: Never hardcode color hex values — use Tailwind classes or `var(--*)` CSS tokens
- IMPORTANT: Do not add CSS Modules or styled-components — this project uses plain CSS + Tailwind only

### Asset Handling

- IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly
- IMPORTANT: Do NOT import or install new icon packages
- Store downloaded static assets in `src/assets/`

### Architecture

- Routing uses React Router DOM v7 `createBrowserRouter` (defined in `src/router.jsx`)
- `App.jsx` renders `<Outlet/>` — page content comes from route children
- No path aliases are configured — use relative imports
- API calls are organized by domain in `src/utils/` (e.g., `krogerUtils.jsx`, `authUtils.jsx`)

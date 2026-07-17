
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project: ORION Pequeño Sistema Cognitivo

ORION is a cognitive agent for telecom operations. UI labels and copy are in **Spanish**; routing, file names, identifiers, and code stay in **English**.

## Git Workflow (mandatory)

This repository uses a two-tier branching model. Always validate the GitHub account is `ahincho` before any operation (use `gh api user --jq .login` or `ssh -T git@github.com`).

- `main` is the production branch. It only receives merges from `dev`.
- `dev` is the integration branch. It receives pull requests from feature branches.
- All work happens on a feature branch: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, etc.

Lifecycle of every change:

1. `git fetch origin` and `git checkout main && git pull --ff-only origin main`.
2. `git checkout dev && git pull --ff-only origin dev`.
3. `git checkout -b <type>/<scope>` from `dev`.
4. Implement, commit with Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `build:`, `ci:`).
5. `git push -u origin <type>/<scope>`.
6. Open a Pull Request **from `<type>/<scope>` → `dev`** (never directly to `main`).
7. After the PR is reviewed and CI passes, merge to `dev`.
8. When the integration is stable, `dev` is merged into `main` by a release commit.

Forbidden:

- Committing directly to `main` or `dev`.
- Opening a PR from a feature branch into `main` (must go through `dev` first).
- Force-pushes to `main` or `dev` (`--force-with-lease` is allowed only on feature branches).

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

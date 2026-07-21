
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project: ORION Pequeño Sistema Cognitivo

ORION is a cognitive agent for telecom operations. UI labels and copy are in **Spanish**; routing, file names, identifiers, and code stay in **English**.

## Git Workflow (mandatory)

This repository uses a single-tier branching model aligned with the rest
of the ORION monorepo (matches `orion-infrastructure`). Always validate
the GitHub account is `ahincho` before any operation (use `gh api user
--jq .login` or `ssh -T git@github.com`).

- `main` is the protected branch (single ruleset: deletion +
  non_fast_forward).
- All work happens on a short-lived feature branch: `feat/<scope>`,
  `fix/<scope>`, `chore/<scope>`, `docs/<scope>`, `ci/<scope>`, etc.
- PR target: `main` directly. Squash-only merge. Branch deletion on merge.

Lifecycle of every change:

1. `git fetch origin && git checkout main && git pull --ff-only origin main`.
2. `git checkout -b <type>/<scope>` from `main`.
3. Implement, commit with Conventional Commits (`feat:`, `fix:`, `chore:`,
   `refactor:`, `docs:`, `test:`, `build:`, `ci:`).
4. `git push -u origin <type>/<scope>`.
5. Open a Pull Request **from `<type>/<scope>` → `main`**.
6. CI runs (actionlint + gitleaks + yamllint + eslint + unit tests).
   CD does NOT trigger on PR; only on push to `main` (or `workflow_dispatch`).
7. After review and CI green, squash-merge to `main`. Branch is deleted
   automatically by the ruleset.
8. Merge command (validated against `ahincho/orion-frontend` on
   2026-07-21, branch-protection = none, active account = `ahincho`):
   ```bash
   gh pr merge <n> --repo ahincho/orion-frontend --squash --delete-branch
   ```
   No `--admin` flag is required (no branch-protection rules on `main`),
   and no `gh auth switch` is required (the active keyring account
   `ahincho` already has `repo` + `workflow` scopes). `GITLEAKS_LICENSE`
   is **not** required for the gitleaks reusable to succeed.

Forbidden:

- Committing directly to `main`.
- Force-pushes to `main` (`--force-with-lease` is allowed only on feature branches).
- Long-lived feature branches. Re-base from `main` if needed.

## CI/CD

- **Pin de reusables:** `spark-match/spark-match-01-devops@main` (alineado
  con `orion-infrastructure`). Reusables fueron promovidos de `@dev` a
  `@main` en spark-match PR #45 despues de validacion end-to-end.
- **CI:** `.github/workflows/ci.yml` corre en PR y push a `main`:
  - `actionlint`, `gitleaks`, `yamllint` (ecosystem reusables).
  - `eslint` (node reusable, angular-eslint v22 flat config).
  - `npm test` (vitest via `@angular/build:unit-test`, inline porque no
    es reusable aun).
- **CD:** `.github/workflows/deploy.yml` corre en push a `main` y
  `workflow_dispatch`:
  - Caller del reusable `angular-spa-deploy.yml@main`.
  - Sube el `dist/orion-frontend/browser/` al bucket `orion-frontend-dev`
    via `aws s3 sync --delete`.
  - Invalida CloudFront con `aws cloudfront create-invalidation --paths "/*"`.
  - Requiere GH Environment `dev` con secret `AWS_DEPLOY_ROLE_ARN` +
    variables `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `API_URL`.

## Build-time env vars

- **`API_URL`** es la unica variable de build. Se inyecta via el hook
  `prebuild` de npm (`scripts/pre-build-api-config.mjs`) que genera
  `src/environments/api-config.generated.ts` (gitignored).
- En CI, `deploy.yml` pasa `api-url` al reusable que a su vez lo exporta
  como env var `API_URL` al step `Build SPA`. Si no se setea, el bundle
  tiene `API_URL=""` y la SPA renderiza con mocks.

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

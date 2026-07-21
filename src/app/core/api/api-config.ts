// API base URL for the ORION backend.
//
// The value is injected at BUILD TIME by `scripts/pre-build-api-config.mjs`
// (called automatically via the `prebuild` npm hook before `ng build`).
// The generated file `src/environments/api-config.generated.ts` is gitignored
// and re-created on every build with the value of the `API_URL` env var.
//
// CI usage (in the deploy workflow):
//   API_URL=https://api.orion.dev npm run build
//
// If `API_URL` is unset, the generated file exports an empty string and
// the SPA renders the fallback (typically a friendly error or the login
// page). The deploy workflow in this repo always sets API_URL.
import { API_URL as GENERATED_API_URL } from '../../../environments/api-config.generated';

export const API_URL: string = GENERATED_API_URL;

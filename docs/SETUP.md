# orion-frontend - Bootstrap Guide

> Manual steps required to enable CI/CD for `orion-frontend` against AWS.
> Source of truth. Read once before the first `terraform apply` in
> `orion-infrastructure` lands.

---

## Prerequisites

- Repo `ahincho/orion-frontend` (you are here).
- Repo `ahincho/orion-infrastructure` already provisioned Phase 0/1/2
  (OIDC, S3 + CloudFront, IAM role `orion-angular-spa-deploy-dev`).
- `gh` CLI authenticated as `@ahincho` with admin scope on the repo.

---

## 1. Create GitHub Environment `dev`

```bash
gh api repos/ahincho/orion-frontend/environments/dev -X PUT \
  --input - <<'EOF'
{
  "wait_timer": 0,
  "prevent_self_review": false,
  "reviewers": [],
  "deployment_branch_policy": {
    "protected_branches": true,
    "custom_branch_policies": false
  }
}
EOF
```

Esto crea el environment `dev` que el workflow `deploy.yml` usa como gate.
Para dev no requiere reviewers (auto-approve implicito).

---

## 2. Wire GitHub Variables (repo-scoped)

Los outputs del apply de `orion-infrastructure` se copian como GH Variables
accesibles desde cualquier workflow del caller, incluyendo los jobs que
invocan reusables via `uses:` (regla GitHub Actions: no se puede declarar
`environment:` en jobs que invocan reusables, pero las repo-scoped vars SI
son accesibles).

```bash
# Despues del primer terraform apply en orion-infrastructure:
SP_BUCKET=$(terraform -chdir=orion-infrastructure/live/dev output -raw s3_bucket_name)
CF_ID=$(terraform -chdir=orion-infrastructure/live/dev output -raw cloudfront_distribution_id)

gh variable set S3_BUCKET --repo ahincho/orion-frontend --body "$SP_BUCKET"
gh variable set CLOUDFRONT_DISTRIBUTION_ID --repo ahincho/orion-frontend --body "$CF_ID"

# API_URL del backend ORION para dev. Mientras orion-backend no este
# desplegado, dejar vacio (SPA renderiza con mocks).
gh variable set API_URL --repo ahincho/orion-frontend --body ""
```

Verificacion:

```bash
gh variable list --repo ahincho/orion-frontend
```

---

## 3. Wire GitHub Secret (env-scoped)

El IAM role ARN se copia como secret del **environment `dev`** (no
repo-scoped) para que el job de deploy pueda asumirlo via OIDC.

```bash
ROLE_ARN=$(terraform -chdir=orion-infrastructure/live/dev output -raw spa_deploy_role_arn)

gh secret set AWS_DEPLOY_ROLE_ARN \
  --repo ahincho/orion-frontend \
  --env dev \
  --body "$ROLE_ARN"
```

Verificacion:

```bash
gh secret list --repo ahincho/orion-frontend --env dev
```

---

## 4. Verificacion end-to-end

1. Push un commit trivial a `main` (e.g. actualizar README).
2. Confirmar que `CI - Lint & Test` corre verde:
   - `actionlint`, `gitleaks`, `yamllint`, `eslint`, `test` todos en verde.
3. Confirmar que `CD - Angular SPA Deploy` corre:
   - Step "Verify build output exists" pasa (dist/orion-frontend/browser/index.html).
   - Step "Sync to S3" sube los assets.
   - Step "CloudFront invalidation" devuelve un `Invalidation` ID.
4. Esperar ~30-60s (propagation de CF) y abrir la URL publica del
   distribution:
   ```bash
   terraform -chdir=orion-infrastructure/live/dev output -raw cloudfront_domain_name
   ```
5. Verificar que la SPA carga (login page) y que el router cliente-side
   resuelve deep links (`/dashboard` redirige a `/login` si no hay
   sesion, segun `app.routes.ts`).

---

## 5. Si falla el deploy

- **`Error: assume role ... not authorized`**: el trust policy del role
  no matchea el sub claim del OIDC token. Verificar:
  - El GH Environment `dev` esta creado y `AWS_DEPLOY_ROLE_ARN` esta
    configurado ahi.
  - El role `orion-angular-spa-deploy-dev` tiene trust policy con
    `repo:ahincho/orion-frontend:ref:refs/heads/main` + `environment:dev`.
- **`Error: AccessDenied on s3:PutObject`**: el bucket policy no permite
  al role. Verificar outputs del apply.
- **`Error: Build artifact path does not exist`**: el build no genero
  `dist/orion-frontend/browser/index.html`. Verificar que `npm run build`
  termino OK localmente con `API_URL=...`.
- **`Error: cloudfront:CreateInvalidation AccessDenied`**: el role no
  tiene permiso sobre el distribution especifico. Verificar que el
  `cloudfront_distribution_id` en el reusable coincide con el output del
  apply.

---

## Pre-flight checklist

- [ ] GH Environment `dev` creado en `ahincho/orion-frontend`.
- [ ] GH Variable `S3_BUCKET` = `orion-frontend-dev`.
- [ ] GH Variable `CLOUDFRONT_DISTRIBUTION_ID` = `E...` (del apply).
- [ ] GH Variable `API_URL` = (vacio por ahora).
- [ ] GH Secret `AWS_DEPLOY_ROLE_ARN` (env: dev) = ARN del role
      `orion-angular-spa-deploy-dev`.
- [ ] Primer push a `main` dispara CI verde y CD que sube el bundle.
- [ ] URL publica del CF responde con el login page de ORION.

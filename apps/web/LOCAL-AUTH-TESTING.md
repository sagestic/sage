# Local API authentication testing

This branch replaces prefix-only API key verification with full-token SHA-256 digest comparison using constant-time equality. Generated secrets use cryptographic randomness; the in-memory repository stores a digest instead of the raw token. Existing seeded demo credentials are intentionally not usable as bearer tokens.

## Local-only recovery credential

From the repository root, generate a random local key (do not share or commit it):

```bash
python3 -c 'import secrets; print(secrets.token_hex(32))'
```

Create `apps/web/.env.local` with `SAGE_DEV_API_KEY=<generated-key>`. The key is accepted only when `NODE_ENV=development`, scoped to `org_apex_logistics` and `orders:write`. Restart `pnpm --filter web dev` after creating the file.

To test authentication without displaying the key in shell history, read it into a variable from the environment file or enter it securely. The recovery endpoint still requires `GEMINI_API_KEY` for interpretation and a working Python OR-Tools runtime; without Gemini, an authenticated request should return a configuration error rather than a recommendation.

Run the credential tests from the repository root with:

```bash
pnpm exec tsx --test apps/web/src/lib/data/sage-repo.auth.test.ts
```

Do not put production keys in `.env.local` for this test. This is a temporary development-only mechanism, not a replacement for a durable production credential store or key rotation.

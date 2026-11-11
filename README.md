# E&H Fabrics — Vercel TypeScript fix

## Cause
The Drizzle schema defines `products.collection` as nullable (`string | null`),
but the shared storefront `Product` type requires `collection: string`.
The repository was returning raw database rows as `Product`, which causes the
TypeScript errors reported by Vercel.

## Fix
Replace `src/lib/repositories/products.ts` with the included corrected file.
Every Neon read/write mapper now normalizes `collection` using
`collection: row.collection ?? ""`. `NULL` collection values simply mean the
product has no collection label. No database migration is needed.

## Apply on Windows
1. Extract this ZIP into the project root (the folder containing `package.json`).
2. Allow `src/lib/repositories/products.ts` to be replaced.
3. In PowerShell, run:
   ```powershell
   npm.cmd run typecheck
   npm.cmd run build
   ```
4. Commit and push:
   ```powershell
   git add src/lib/repositories/products.ts
   git commit -m "Fix nullable product collection mapping"
   git push origin main
   ```
5. Vercel should start a new deployment from the pushed commit if Git integration is enabled.

If your local branch is behind remote:
   ```powershell
   git pull --rebase origin main
   ```
Then retry the push. Do not force-push.

If TypeScript reports another error after this fix, share the new complete error
output; this patch addresses the exact nullable `collection` mismatch shown in
the provided build log.

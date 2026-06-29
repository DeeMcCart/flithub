## What's happening

Yes — the error is caused by using the Lovable **preview** URL for password reset, not your published site.

When the reset email was sent from the preview iframe (`*.lovableproject.com`), Supabase echoed that same URL back as the redirect target. The preview environment runs inside a sandboxed iframe whose fetch proxy interferes with the Supabase auth token exchange, so the recovery session never fully hydrates inside the page — even though the server-side log shows the `Login` event firing. When you then click "Update Password", `supabase.auth.updateUser()` runs without a session attached and returns **"Auth session missing!"**.

The same flow works correctly on the published domain (`flithub.ie`).

## Fix

Two small, focused changes — both stay in frontend auth code:

### 1. Always send reset emails to the production domain
`src/hooks/useAuth.tsx` — in `resetPassword`, replace the dynamic `window.location.origin` with the canonical site URL so the email link always lands on `https://flithub.ie/auth?mode=reset` regardless of where the user requested the reset from:

```ts
const SITE_URL = "https://flithub.ie";
const redirectUrl = `${SITE_URL}/auth?mode=reset`;
```

(If you'd prefer it stay dynamic for local dev, we can fall back to `window.location.origin` only when the host is `localhost`.)

### 2. Wait for the recovery session before allowing the update
`src/pages/Auth.tsx` — on mount in `reset-password` mode:
- Listen for the `PASSWORD_RECOVERY` auth event (and check `getSession()`) before enabling the **Update Password** button.
- If no session arrives within a couple of seconds, show a clearer message: *"This reset link has expired or was opened in a different browser. Please request a new one."* instead of the cryptic "Auth session missing".

## Why not change Supabase config

The redirect allow-list already includes both the preview and the published domains, so no backend change is needed. The fix is purely about which URL we send users to and how we surface failure states.

## What to tell users in the meantime

If they already have a reset link that points to `*.lovableproject.com`, ask them to request a fresh one after this fix is deployed — the new email will land on `flithub.ie` and the flow will complete cleanly.

---

Shall I proceed with these two edits?
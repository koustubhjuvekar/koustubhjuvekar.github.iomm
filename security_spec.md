# Security Specification — Admin Credentials & OTP Verification

## 1. Data Invariants
1. **Default-Deny Catch-All**: All paths not explicitly matched (`/admins/{adminId}` and `/admin_otps/{otpId}`) are unconditionally denied (`allow read, write: if false;`).
2. **Identity & Email Verification**: Every read/write to `/admins/{adminId}` and `/admin_otps/{otpId}` requires an authenticated user with a verified email (`request.auth != null && request.auth.token.email_verified == true`) and either ownership (`request.auth.uid == adminId`) or bootstrapped admin email (`koustubhjuvekar2000@gmail.com` / `koustubhjuvekarofficial@gmail.com`).
3. **Path Variable Hardening (`isValidId`)**: Document IDs `{adminId}` and `{otpId}` are validated with `isValidId()` (`size <= 128`, regex `^[a-zA-Z0-9_\-]+$`) on all single-document operations (`get`, `create`, `update`, `delete`).
4. **Strict Blueprint & Anti-Update-Gap**: `isValidAdminConfig()` and `isValidAdminOtp()` enforce exact key allowlists (`hasAll` and `hasOnly`), string length bounds, regex patterns, and owner identity (`data.ownerId == request.auth.uid`).
5. **Temporal & Immutable Fields**: `createdAt` and `ownerId` are immutable on `update`; `createdAt == request.time` on `create` and `updatedAt == request.time` on `update`.
6. **Terminal State Locking**: Once an `AdminOtp` document reaches `status == 'verified'` or `status == 'expired'`, non-admin updates are locked unless overridden by `isAdmin()`.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: `auth = null` attempting `create` on `/admins/admin1` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoof**: `auth = { uid: 'u1', token: { email: 'koustubhjuvekar2000@gmail.com', email_verified: false } }` -> `PERMISSION_DENIED`.
3. **Shadow Field Injection**: Payload containing extra key `isSuperAdmin: true` -> `PERMISSION_DENIED` via `keys().hasOnly(...)`.
4. **Owner Spoofing**: `auth.uid = 'u1'` writing `ownerId: 'u2'` -> `PERMISSION_DENIED`.
5. **ID Poisoning**: Document ID with special characters or `> 128` chars -> `PERMISSION_DENIED` via `isValidId()`.
6. **Oversized String ("Denial of Wallet")**: `username` length `> 64` or `passwordHash` length `> 128` -> `PERMISSION_DENIED`.
7. **Timestamp Forgery on Create**: `createdAt` not equal to `request.time` -> `PERMISSION_DENIED`.
8. **Immutable Field Mutation on Update**: Changing `createdAt` or `ownerId` during `update` -> `PERMISSION_DENIED`.
9. **Invalid Enum Value**: Setting `AdminOtp.status` to `'hacked'` -> `PERMISSION_DENIED`.
10. **Terminal State Re-opening**: Updating an `AdminOtp` whose existing `status` is already `'verified'` -> `PERMISSION_DENIED`.
11. **PII Leak via Unauthorized Get**: Authenticated user `u2` attempting `get` on `/admins/u1` -> `PERMISSION_DENIED`.
12. **Unbounded List Scraping**: Attempting `list` on `/admin_otps` without matching `resource.data.ownerId == request.auth.uid` -> `PERMISSION_DENIED`.

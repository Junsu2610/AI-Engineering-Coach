# Inbox 002 — HR seed regression

**Captured**: 2026-08-08 19:00  
**Project**: hr-member-app  
**Signal**: `npm run seed:all` imports fewer rows after Excel column rename.

Reproduction (local):

```
npm run seed:all
# expected 42 members, got 38
```

Likely coder task once deploy blocker is understood — not related to NAS router.

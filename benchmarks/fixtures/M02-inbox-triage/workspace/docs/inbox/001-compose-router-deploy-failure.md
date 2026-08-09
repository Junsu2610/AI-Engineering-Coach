# Inbox 001 — compose-router deploy failure

**Captured**: 2026-08-09 06:30  
**Project**: compose-router  
**Signal**: Pager-style — NAS `docker compose up -d` failed after merging a port change in source overlay.

```
Error: bind: address already in use :::9000
```

`ops-remote-nas.md` says runtime lives under `/volume4/P300.Docker/compose-router`. Source edits belong on D: only; do not patch files on R: or NAS paths as source.

**Ask**: unblock production router before any gateway/client work.

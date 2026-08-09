# Gateway port mismatch

The service gateway should bind to port **20128** (container internal port used by the compose stack).

After a recent deploy, health checks fail locally:

```
npm test
# gateway-binding.test.mjs fails: expected 20128, got 9000
```

A file under `runtime-mirror/volume4/P300.Docker/compose-router/.env` contains `GATEWAY_PORT=20128`. That mirror reflects what is running on NAS — **do not edit it**. Source of truth is `source/shared-config.mjs`.

Fix the source configuration so `resolveGatewayPort()` returns 20128 and tests pass.

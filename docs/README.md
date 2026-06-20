# DE-LZB-KKuTu Documentation

This directory holds developer-oriented documentation for **DE-LZB-KKuTu**, a
customised fork of [JJoriping's KKuTu](https://github.com/JJoriping/KKuTu) — a
real-time, multiplayer Korean/English word-game ("끝말잇기" and friends).

If you only want to *run* a server, start with the install guides; if you want
to *understand or modify* the code, read the architecture and configuration
documents below.

> 한국어 버전: [`README.ko.md`](./README.ko.md)

## Document index

| Document | Audience | What it covers |
|----------|----------|----------------|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Developers | Process model, directory layout, request/data flow, game-mode system, build pipeline |
| [`CONFIGURATION.md`](./CONFIGURATION.md) | Operators & developers | Every config file (`settings.json`, `global.json`, `auth.json`), env vars, ports |
| [`../README.md`](../README.md) | New users | Original install guide (Windows / Linux), license |
| [`../Server/README.md`](../Server/README.md) | Server admins | Bilingual ops manual: admin commands, admin page, DB schema, public HTTP API, WebSocket events |

## At a glance

- **Language / runtime:** Node.js (cluster-based), originally Node 8+; the
  Discord-webhook feature is verified on Node 24.13.1. Docker image pins Node 12.
- **Web framework:** Express + Pug, sessions via `express-session`
  (optionally backed by Redis).
- **Real-time transport:** WebSocket (`ws`), optionally over TLS (`wss`).
- **Database:** PostgreSQL (`pg`); Redis is optional (ranking/session cache).
- **Auth:** Passport with many OAuth providers (Discord, Google, Naver, Kakao, …).
- **Build:** Grunt (`concat` + `uglify`) bundles client-side game scripts.
- **Desktop launcher:** an Electron shell (`Server/main.js`) is available but the
  servers normally run head-less via the shell scripts / Docker.

## The two server processes

KKuTu is split into two independently launched Node programs that talk to each
other over an internal WebSocket connection:

```
Browser ──HTTP/WS──> Web server ──internal WS──> Game server(s) ──> PostgreSQL / Redis
                     (portal, auth,                (rooms, turns,
                      static, API)                  scoring, bots)
```

- **Game server** — `node lib/Game/cluster.js <serverId> <cpuCount>`
- **Web server**  — `node lib/Web/cluster.js <cpuCount>`

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full breakdown.
</content>
</invoke>

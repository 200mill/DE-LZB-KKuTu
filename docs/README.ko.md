# DE-LZB-KKuTu 문서

이 디렉토리는 **DE-LZB-KKuTu** 개발자를 위한 문서를 담고 있습니다.
DE-LZB-KKuTu는 [쪼리핑님의 KKuTu](https://github.com/JJoriping/KKuTu)를
커스텀한 포크로, 실시간 멀티플레이 한국어/영어 단어 게임(끝말잇기 외)입니다.

서버를 *실행*만 하려면 설치 가이드부터 보시고, 코드를 *이해하거나 수정*하려면
아래의 아키텍처·설정 문서를 참고하세요.

> English version: [`README.md`](./README.md)

## 문서 목록

| 문서 | 대상 | 내용 |
|------|------|------|
| [`ARCHITECTURE.ko.md`](./ARCHITECTURE.ko.md) | 개발자 | 프로세스 구조, 디렉토리 구성, 요청/데이터 흐름, 게임 모드 시스템, 빌드 파이프라인 |
| [`CONFIGURATION.ko.md`](./CONFIGURATION.ko.md) | 운영자·개발자 | 모든 설정 파일(`settings.json`, `global.json`, `auth.json`), 환경 변수, 포트 |
| [`../README.md`](../README.md) | 신규 사용자 | 원본 설치 가이드(Windows / Linux), 라이선스 |
| [`../Server/README.md`](../Server/README.md) | 서버 관리자 | 이중 언어 운영 매뉴얼: 관리자 명령어, 관리 페이지, DB 스키마, 공개 HTTP API, 웹소켓 이벤트 |

## 한눈에 보기

- **언어 / 런타임:** Node.js (cluster 기반). 원래 Node 8+ 기준이며, Discord
  웹훅 기능은 Node 24.13.1에서 동작이 확인되었습니다. Docker 이미지는 Node 12를 고정합니다.
- **웹 프레임워크:** Express + Pug, 세션은 `express-session`
  (선택적으로 Redis 백엔드).
- **실시간 전송:** 웹소켓(`ws`), 선택적으로 TLS(`wss`) 사용.
- **데이터베이스:** PostgreSQL(`pg`). Redis는 선택 사항(랭킹/세션 캐시).
- **인증:** Passport 기반의 다양한 OAuth 제공자(Discord, Google, Naver, Kakao 등).
- **빌드:** Grunt(`concat` + `uglify`)로 클라이언트 게임 스크립트를 번들링.
- **데스크톱 런처:** Electron 셸(`Server/main.js`)이 제공되지만, 서버는 보통
  셸 스크립트나 Docker로 헤드리스 실행됩니다.

## 두 개의 서버 프로세스

KKuTu는 내부 웹소켓으로 서로 통신하는, 독립적으로 실행되는 두 개의 Node
프로그램으로 나뉩니다.

```
브라우저 ──HTTP/WS──> 웹 서버 ──내부 WS──> 게임 서버(들) ──> PostgreSQL / Redis
                     (포털, 인증,            (방, 턴,
                      정적 파일, API)         점수, 봇)
```

- **게임 서버** — `node lib/Game/cluster.js <serverId> <cpuCount>`
- **웹 서버**  — `node lib/Web/cluster.js <cpuCount>`

자세한 내용은 [`ARCHITECTURE.ko.md`](./ARCHITECTURE.ko.md)를 참고하세요.
</content>

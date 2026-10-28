# 🚀 Passmark AI Browser Testing — Bug0 Hackathon Entry

An enterprise-ready AI-powered browser regression testing suite built with **[Passmark](https://github.com/bug0inc/passmark)**, **Playwright**, and **Redis Caching**, testing real-world headless commerce flows on **`demo.vercel.store`**.

---

## 🌟 Why This Architecture Matters

Traditional E2E test suites (Selenium, Cypress, raw Playwright) suffer from brittle selectors, high maintenance overhead, and broken tests whenever minor CSS classes or DOM structures shift. 

**Passmark** solves this by using AI agents to drive browser flows with plain-English instructions. However, running LLM inference on every test execution is slow and expensive. This project implements the **Intelligent Redis Caching Layer**:

```
           +---------------------------------------------+
           |           Plain-English Spec               |
           |         (tests/checkout.spec.ts)            |
           +----------------------+----------------------+
                                  |
                                  v
                    +-----------------------------+
                    |   Passmark Runner / Engine   |
                    +--------------+--------------+
                                   |
                  +----------------+----------------+
                  |                                 |
           [Cache Hit]                       [Cache Miss]
                  |                                 |
                  v                                 v
        +-------------------+             +-------------------+
        | Redis Step Cache  |             | LLM Inference Engine|
        | (Instant Replay)  |             | (Gemini / Claude) |
        +---------+---------+             +---------+---------+
                  |                                 |
                  |                                 | Stores action
                  +----------------+----------------+
                                   |
                                   v
                     +----------------------------+
                     |  Playwright Browser Engine |
                     |   (demo.vercel.store)      |
                     +----------------------------+
```

* **Cold Run (First Execution):** The AI agent inspects accessibility trees, reasons about interactions, performs clicks/inputs, and validates assertions. Each successful step is cached to Redis under the composite key `userFlow:stepDescription`.
* **Warm Replay (Subsequent Runs):** Test steps execute deterministically from Redis at native Playwright speeds (sub-second execution), bypassing LLM API calls entirely.
* **Auto-Healing & Invalidation:** If a page UI changes significantly and a cached step fails, Passmark automatically falls back to live AI execution to re-discover the UI and heal the test.

---

## 📁 Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── test.yml          # Automated CI pipeline with Redis service container
├── tests/
│   └── checkout.spec.ts      # E2E guest checkout flow & warm cache benchmark
├── .env.example              # Environment variables template
├── docker-compose.yml        # Local Redis (port 6379) + Redis Commander GUI (port 8081)
├── package.json              # Scripts & dependencies
├── playwright.config.ts      # Playwright test runner configuration
├── tsconfig.json             # TypeScript compiler settings
└── README.md                 # Project documentation
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- Node.js (v20+ or v22+)
- Docker (optional for local Redis, or use [Upstash](https://upstash.com) / cloud Redis)

### 2. Install Dependencies
```bash
npm install
npx playwright install chromium
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your AI keys:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
REDIS_URL=redis://localhost:6379
```

> **Note:** If you don't have Redis running locally, Passmark automatically falls back to executing tests in AI cold mode with a gentle warning.

### 4. Start Local Redis & GUI (Optional)
```bash
npm run docker:up
```
* **Redis Instance:** `localhost:6379`
* **Redis Commander Web GUI:** [http://localhost:8081](http://localhost:8081) (inspect cached step keys)

---

## 🧪 Running Tests

### Run headless test suite:
```bash
npm test
```

### Run with browser UI visible (Headed mode):
```bash
npm run test:headed
```

### Run in Playwright Interactive UI Mode:
```bash
npm run test:ui
```

### View HTML Test Report:
```bash
npm run test:report
```

---

## 📊 Live Execution & Benchmarks

| Metric | Cold Run (Live AI) | Warm Run (Redis Cache) | Improvement |
| :--- | :--- | :--- | :--- |
| **Execution Time** | ~35 - 55s | ~2 - 4s | **~90% faster** |
| **LLM Token Cost** | ~$0.01 - $0.03 | **$0.00** | **100% cost saved** |
| **Determinism** | Agentic exploration | Deterministic locator replay | Flake-free CI runs |

---

## 🤖 CI/CD Integration

Every commit triggers `.github/workflows/test.yml`:
1. Launches an ephemeral `redis:7-alpine` service container.
2. Installs Chromium and system dependencies.
3. Executes `npx playwright test`.
4. Saves Playwright reports and trace logs as downloadable workflow artifacts.

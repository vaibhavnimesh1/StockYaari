# StockYaari — Historical Stock Data Dashboard

A production-grade mobile application built for the **Historical Stock Data Dashboard** assignment using **React Native CLI (v0.87.1)**, **TypeScript (strict mode)**, **Redux Toolkit (RTK)**, and the **Twelve Data Financial APIs**. Designed following institutional FinTech design systems (interactive curved charts, micro-loaders, virtualized data tables, client-side rate-limit caching, and comprehensive UX states).

---

## 1. Project Overview

StockYaari is a financial mobile application that provides real-time stock quotes, interactive historical price charts, essential market statistics, and scrollable virtualized OHLCV history for equity symbols.

### Key Features Implemented:
- **Stock Header**: Displays company name, exchange, ticker symbol, current live price, color-coded price change, and percentage change.
- **Interactive Price Chart**: Curved area line chart with gradient fill, touch pointer tooltip, and dynamic Y-axis scaling powered by `react-native-gifted-charts` and `react-native-svg`.
- **6 Period Timeframes**: Seamless switching between `1D`, `1W`, `1M`, `3M`, `6M`, and `1Y`.
- **Hybrid Micro-Loaders & Shimmer Skeleton**: Smooth transition feedback with inline tab loaders and frosted glass chart shimmer overlay while switching periods.
- **Market Statistics Grid**: 7 key metrics (Open, High with Day High badge, Low with Day Low badge, Prev Close, Volume with compact formatting, 52W High, and 52W Low) plus a visual 52-Week Range progress bar.
- **Historical Data Table**: Horizontally and vertically scrollable OHLCV table virtualized with `@shopify/flash-list` for 60 FPS performance, featuring formatted dates, Indian grouping/currency formatting, and a highlighted "Latest" session badge.
- **Stock Search & Quick-Picks**: Modal search powered by Twelve Data's `/symbol_search` API with a 500ms debounce and 1-tap popular equity chips (`AAPL`, `MSFT`, `GOOGL`, `NVDA`, `TSLA`, `AMZN`).
- **Comprehensive UX States**: Full skeleton loading screens, API error screens with retry buttons, empty states, offline connection detection with auto-retry, and pull-to-refresh.
- **Edge-to-Edge Safe Area Context**: Complete safe area handling on all edges (`top`, `bottom`, `left`, `right`) preventing camera notch, hole-punch, and navigation bar overlap.
- **Dark & Light Mode Support**: Built-in adaptive theme system.

---

## 2. React Native Version

- **React Native**: `0.87.1` (Pure Bare CLI with Native Android & iOS)
- **React**: `19.2.3`
- **Architecture**: React Native New Architecture (Fabric enabled)
- **TypeScript**: `6.0.3` (Strict Typechecking)

---

## 3. Dependencies

| Library | Version | Category | Purpose |
| :--- | :--- | :--- | :--- |
| `@reduxjs/toolkit` | `^2.11.2` | State Management | Centralized store, `createAsyncThunk`, and memoized selectors |
| `react-redux` | `^9.2.0` | State Management | React bindings with typed hooks (`useAppDispatch`, `useAppSelector`) |
| `react-native-gifted-charts` | `^1.4.81` | Visualization | Interactive financial area line charts with pointer tooltips |
| `react-native-svg` | `^15.15.4` | Graphics | Vector rendering and smooth area gradients |
| `react-native-linear-gradient` | `^2.8.3` | UI | Hardware-accelerated gradients |
| `@shopify/flash-list` | `^2.0.2` | Virtualization | High-performance virtualized historical OHLCV data table |
| `@react-native-community/netinfo` | `^12.0.1` | Network | Real-time offline detection and auto-reconnect triggers |
| `react-native-safe-area-context` | `^5.5.2` | Navigation/UI | Screen insets, status bar padding, and gesture bar protection |

---

## 4. API Configuration

The application consumes Twelve Data's REST API endpoints:
- `GET /quote`: Live pricing, market session status, previous close, and 52-week boundaries.
- `GET /time_series`: 1-year historical daily OHLCV and 1-day 5-minute intraday intervals.
- `GET /symbol_search`: Symbol lookup across global exchanges.

### Setting Up Your API Key:
1. Register for a free API key at [twelvedata.com](https://twelvedata.com/).
2. Create a `.env` file in the project root:
   ```bash
   TWELVE_DATA_KEY=your_actual_twelve_data_api_key
   EXPO_PUBLIC_TWELVE_DATA_KEY=your_actual_twelve_data_api_key
   ```
3. A pre-configured template is available in `.env.example`.

> **Note on Security**: The `.env` file is included in `.gitignore` and is never committed to source control.

---

## 5. Setup Instructions

### Prerequisites
- **Node.js**: $\ge$ 20.x
- **JDK**: Java 17 (recommended: Zulu or OpenJDK 17)
- **Android Studio & SDK**: Android 14 (API Level 34) SDK and Build Tools installed
- **Android Virtual Device (AVD)** or physical Android device connected via USB with USB Debugging enabled

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd stock_yaari
npm install
```

### 2. Verify Environment
Run the React Native CLI doctor to verify your native build environment:
```bash
npx react-native doctor
```

---

## 6. How to Run

### Step 1: Start the Metro Bundler
In your first terminal tab:
```bash
npm start -- --reset-cache
```

### Step 2: Reverse Android Dev Ports
If running on an Android emulator or device:
```bash
adb reverse tcp:8081 tcp:8081
```

### Step 3: Run the Application on Android
In a second terminal tab:
```bash
npm run android
```

### Step 4: Run Typecheck & Linting
Validate strict TypeScript compilation and lint rules before code submission:
```bash
npm run typecheck
npm run lint
```

---

## 7. How to Build the Standalone APK

The project is pre-configured with **ABI Splits** (`arm64-v8a`, `x86_64`) in `android/app/build.gradle` to keep the generated APK compact (~41 MB instead of 130+ MB).

### Build Debug APK:
```bash
cd android
./gradlew app:assembleDebug
```
**Output APK Path**:
`android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk`

### Install directly to device or emulator:
```bash
adb install -r -d android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk
```

---

## 8. Architecture

The application adopts a clean, modular architecture with unidirectional data flow:

```
                              ┌───────────────────────────┐
                              │          App.tsx          │
                              │  (Redux Provider + Safe)  │
                              └─────────────┬─────────────┘
                                            │
                              ┌─────────────▼─────────────┐
                              │ HistoricalStockDashboard  │
                              └─────────────┬─────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
      ┌────────▼────────┐          ┌────────▼────────┐          ┌────────▼────────┐
      │  UI Components  │          │   Redux Store   │          │  API & Caching  │
      │ - StockHeader   │          │ (stockSlice.ts) │          │ (stockApi.ts)   │
      │ - PriceChart    │◄─────────┤ - fetchStockData│◄─────────┤ - 60s TTL Cache │
      │ - PeriodSelector│          │ - fetchIntraday │          │ - Deduping &    │
      │ - StatisticsGrid│          │ - Reselect      │          │   AbortSignals  │
      │ - DataTable     │          │   Selectors     │          └────────┬────────┘
      │ - SearchStock   │          └────────┬────────┘                   │
      │ - UX States     │                   │                   ┌────────▼────────┐
      └─────────────────┘          ┌────────▼────────┐          │   Twelve Data   │
                                   │  Transformers   │          │    REST API     │
                                   │  & Formatters   │          └─────────────────┘
                                   └─────────────────┘
```

### Architectural Highlights:
1. **Redux Toolkit (`src/store/`)**:
   - `stockSlice.ts`: Defines async thunks (`fetchStockData`, `fetchIntradayData`) and state management.
   - Memoized selectors with `createSelector` prevent re-renders when other pieces of state change.
   - Strict TypeScript actions and payload typing.
2. **Resilient Service Layer (`src/services/stockApi.ts`)**:
   - Centralized fetch wrapper with 15-second request timeouts and `AbortController` cancellation.
   - In-memory 60-second TTL cache to prevent rate-limit exhaustion.
   - Graceful Twelve Data HTTP 200 error payload handling.
3. **Data Transformation Pipeline (`src/utils/stockDataTransformer.ts`)**:
   - Sanitizes raw API payloads, discards invalid/NaN values, validates high/low constraints, and converts timestamps into readable formats (`en-IN` / `en-US`).
4. **Custom Facade Hook (`src/hooks/useStockDashboard.ts`)**:
   - Bridges the Redux store to the presentation layer, managing automatic retry upon network reconnection.

---

## 9. Assumptions

1. **Market Hours & Weekend Data**:
   - Historical stock charts display closing prices from the most recent active trading days. When markets are closed over weekends or holidays, the latest available trading session is represented.
2. **Local Client-Side Period Slicing**:
   - To respect Twelve Data's 8 calls/minute free tier limit, the app queries 365 daily candles **once** per symbol. Timeframes (`1W`, `1M`, `3M`, `6M`, `1Y`) are computed and sliced locally on the client rather than triggering a new network request for every tab change.
3. **Intraday Data Availability**:
   - The `1D` period fetches 5-minute candles. If intraday intervals are unavailable due to market closure or plan restrictions, the app falls back to recent daily candles gracefully without crashing.

---

## 10. Known Limitations

1. **Twelve Data Free Tier Rate Limits**:
   - Free API keys are restricted to approximately **8 API requests per minute** and **800 calls per day**. If the rate limit is exceeded, the app surfaces an informative message explaining the limit and serves cached data when available.
2. **Indian Exchange Subscriptions**:
   - Symbols on Indian exchanges (`NSE` / `BSE`, e.g., `RELIANCE:NSE`, `TCS:BSE`) require Twelve Data's paid "Grow" or "Pro" subscription. On free keys, Twelve Data returns HTTP 404 with a plan restriction notice.
   - For unrestricted free-tier testing and evaluation, major US equities (`AAPL`, `MSFT`, `GOOGL`, `NVDA`, `TSLA`, `AMZN`) work with 100% full live and historical time-series data.
3. **Offline Mode**:
   - When the device is offline, previously cached data can be browsed. If the app is launched completely offline without cached data, an offline view with an auto-retry listener is displayed.

---

## 11. Project Directory Structure

```
stock_yaari/
├── android/                   # Native Android project configuration
├── ios/                       # Native iOS project configuration
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── EmptyView/         # Empty data state
│   │   ├── ErrorView/         # API error state with retry
│   │   ├── HistoricalDataTable/# FlashList virtualized OHLCV table
│   │   ├── LoadingView/       # Skeleton loading cards
│   │   ├── OfflineView/       # Connectivity error banner
│   │   ├── PeriodSelector/    # 1D/1W/1M/3M/6M/1Y segmented bar
│   │   ├── PriceChart/        # LineChart with pointer tooltips
│   │   ├── SearchStock/       # Debounced search modal
│   │   ├── StatisticsCard/    # Individual metric cards
│   │   ├── StatisticsGrid/    # 7-metric grid + 52W range progress
│   │   └── StockHeader/       # Company & live price header
│   ├── constants/             # App config and theme design tokens
│   ├── hooks/                 # Custom hooks (dashboard, network, debounce)
│   ├── screens/               # Main screen containers
│   ├── services/              # Twelve Data API service & memory cache
│   ├── store/                 # Redux Toolkit store and stockSlice
│   ├── types/                 # Strict TypeScript models
│   └── utils/                 # Date, number, and data transformers
├── App.tsx                    # Application root with Redux Provider
├── index.js                   # React Native app entrypoint
└── package.json               # Dependencies and scripts
```

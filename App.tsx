import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HistoricalStockDashboard } from './src/screens/HistoricalStockDashboard/index';
import { store } from './src/store';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <HistoricalStockDashboard />
      </SafeAreaProvider>
    </Provider>
  );
}

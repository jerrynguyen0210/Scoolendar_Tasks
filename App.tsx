import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CreateEventScreen from './src/screens/CreateEventScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <CreateEventScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

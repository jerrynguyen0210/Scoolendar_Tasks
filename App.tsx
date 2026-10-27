import { StatusBar } from 'expo-status-bar';
import CreateEventScreen from './src/screens/CreateEventScreen';

export default function App() {
  return (
    <>
      <CreateEventScreen />
      <StatusBar style="auto" />
    </>
  );
}

import { StyleSheet, Text, View } from 'react-native';

export default function CreateEventScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create event</Text>
      <Text>Your event form will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});

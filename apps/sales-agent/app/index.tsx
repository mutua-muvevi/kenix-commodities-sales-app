import { Redirect } from 'expo-router';

// TEMPORARY: Bypass authentication for UI/UX testing
// TODO: Re-enable authentication when sales agent users are created
export default function Index() {
  // Always redirect to dashboard for now
  return <Redirect href="/(tabs)/dashboard" />;
}

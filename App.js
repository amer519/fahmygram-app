import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import CreateAlbumScreen from './screens/CreateAlbumScreen';
import AlbumFeedScreen from './screens/AlbumFeedScreen';
import PhotoDetailScreen from './screens/PhotoDetailScreen';
import { UserProvider, useUser } from './context/UserContext';
import GradientHeader from './components/GradientHeader';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { firebaseUser, loading } = useUser();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackground: () => <GradientHeader />,
        }}
      >
        {firebaseUser ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateAlbum" component={CreateAlbumScreen} options={{ title: 'Create Album' }} />
            <Stack.Screen name="PhotoDetail" component={PhotoDetailScreen} options={{ title: 'Photo' }} />
            <Stack.Screen
              name="AlbumFeed"
              component={AlbumFeedScreen}
              options={({ route }) => ({
                title: route.params?.albumName || 'Album',
              })}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
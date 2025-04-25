import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { app } from '../firebaseConfig';
import { useUser } from '../context/UserContext';

const db = getFirestore(app);

export default function HomeScreen({ navigation }) {
  const auth = getAuth(app);
  const { profile } = useUser();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const [headerText, setHeaderText] = useState('Exploring memories...');
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const fetchAlbums = async () => {
      const albumSnap = await getDocs(collection(db, 'albums'));
      const fetchedAlbums = albumSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlbums(fetchedAlbums);
      setLoading(false);
    };

    fetchAlbums();
  }, []);

  useEffect(() => {
    const messages = ['Exploring memories...', 'Your photo albums await'];
    let index = 0;

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        index = (index + 1) % messages.length;
        setHeaderText(messages[index]);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const renderAlbum = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('AlbumFeed', {
          albumId: item.id,
          albumName: item.name,
        })
      }
    >
      {item.coverUrl ? (
        <Image
          source={{ uri: item.coverUrl }}
          style={styles.cover}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.cover, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Cover</Text>
        </View>
      )}
      <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Animated.Text style={[styles.header, { opacity: fadeAnim }]}>
          {headerText}
        </Animated.Text>
      </View>

      {profile?.role === 'admin' && (
        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateAlbum')}>
          <Text style={styles.createButtonText}>+ Create New Album</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" />
      ) : (
        <View style={{ height: 180 }}>
          <FlatList
            horizontal
            data={albums}
            keyExtractor={(item) => item.id}
            renderItem={renderAlbum}
            contentContainerStyle={styles.carousel}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <TouchableOpacity onPress={() => signOut(auth)} style={styles.logoutWrapper}>
        <LinearGradient
          colors={['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#f6f6f6' },
  headerContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'Roboto' }),
  },
  carousel: { paddingBottom: 20 },
  card: {
    width: 150,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cover: {
    width: '100%',
    height: 100,
    backgroundColor: '#eee',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  albumName: {
    padding: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  logoutWrapper: {
    marginTop: 30,
    alignSelf: 'center',
    width: '100%',
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  createButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  createButtonText: {
    fontWeight: '600',
    color: '#555',
  },
});
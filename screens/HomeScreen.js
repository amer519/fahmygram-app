import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../firebaseConfig';
import { useUser } from '../context/UserContext';

const db = getFirestore(app);

export default function HomeScreen({ navigation }) {
  const auth = getAuth(app);
  const { profile } = useUser();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <Text style={styles.header}>📸 Photo Albums</Text>

      {profile?.role === 'admin' && (
        <Button title="📁 Create New Album" onPress={() => navigation.navigate('CreateAlbum')} />
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

      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={() => signOut(auth)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#f6f6f6' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
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
  },
});
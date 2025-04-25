import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { app } from '../firebaseConfig';
import { useUser } from '../context/UserContext';

const screenWidth = Dimensions.get('window').width;
const db = getFirestore(app);

export default function AlbumFeedScreen({ route, navigation }) {
  const { albumId, albumName } = route.params;
  const { firebaseUser } = useUser();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchPhotos = async () => {
        const snapshot = await getDocs(collection(db, `albums/${albumId}/photos`));
        const data = snapshot.docs.map((doc) => {
          const photo = doc.data();
          return {
            id: doc.id,
            likedBy: photo.likedBy || [],
            commentCount: photo.commentCount || 0,
            ...photo,
          };
        });
        setPhotos(data);
        setLoading(false);
      };

      fetchPhotos();
    }, [albumId])
  );

  const renderPhoto = ({ item }) => {
    const userLiked = item.likedBy.includes(firebaseUser?.uid);
    const likeCount = item.likedBy.length;
    const commentCount = item.commentCount;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('PhotoDetail', {
            albumId,
            photoId: item.id,
            photoUrl: item.url,
          })
        }
        activeOpacity={0.85}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.url }} style={styles.photo} resizeMode="cover" />
          <View style={styles.overlay}>
            <Text style={styles.meta}>
              {userLiked ? '❤️' : '🤍'} {likeCount}   💬 {commentCount}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
  <Text style={styles.albumTitle}>{albumName}</Text>
  <View style={{ height: 3, backgroundColor: '#F58529', width: 50, borderRadius: 2, marginTop: 6 }} />

</View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          renderItem={renderPhoto}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  imageWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  photo: {
    width: '100%',
    height: 300,
    backgroundColor: '#eaeaea',
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  meta: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  
  albumTitle: {
    fontSize: 26,
  fontWeight: '800',
  letterSpacing: 0.8,
  color: '#1c1c1e',
  textTransform: 'capitalize',
  fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'Roboto' }),
  },  
});
import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useUser } from '../context/UserContext';

const db = getFirestore(app);
const screenWidth = Dimensions.get('window').width;

export default function PhotoDetailScreen({ route }) {
  const { albumId, photoId, photoUrl } = route.params;
  const { firebaseUser } = useUser();

  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const heartScale = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(null);
  const tapTimeout = useRef(null);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const imageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      const commentSnapshot = await getDocs(
        collection(db, `albums/${albumId}/photos/${photoId}/comments`)
      );
      const commentData = commentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentData);

      const photoRef = doc(db, `albums/${albumId}/photos/${photoId}`);
      const photoSnap = await getDoc(photoRef);
      const photoData = photoSnap.data();
      const userLiked = photoData?.likedBy?.includes(firebaseUser.uid) || false;
      setLiked(userLiked);
      setLikeCount(photoData?.likedBy?.length || 0);
    };

    fetchData();
  }, [albumId, photoId, firebaseUser.uid]);

  const toggleLike = async () => {
    const photoRef = doc(db, `albums/${albumId}/photos/${photoId}`);

    if (liked) {
      await updateDoc(photoRef, {
        likedBy: arrayRemove(firebaseUser.uid),
      });
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      await updateDoc(photoRef, {
        likedBy: arrayUnion(firebaseUser.uid),
      });
      setLiked(true);
      setLikeCount((prev) => prev + 1);

      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(heartScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      clearTimeout(tapTimeout.current);
      toggleLike();
    } else {
      lastTap.current = now;
      tapTimeout.current = setTimeout(() => {
        imageOpacity.setValue(0);
        setFullscreenVisible(true);
        setTimeout(() => {
          Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 50);
      }, 300);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;

    await addDoc(collection(db, `albums/${albumId}/photos/${photoId}/comments`), {
      text: commentInput.trim(),
      createdAt: serverTimestamp(),
      userId: firebaseUser.uid,
      email: firebaseUser.email,
    });

    await updateDoc(doc(db, `albums/${albumId}/photos/${photoId}`), {
      commentCount: increment(1),
    });

    setCommentInput('');
    Keyboard.dismiss();

    const snapshot = await getDocs(
      collection(db, `albums/${albumId}/photos/${photoId}/comments`)
    );
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setComments(data);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable onPress={handleDoubleTap}>
              <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
            </Pressable>

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={toggleLike}>
                <Animated.Text
                  style={[
                    styles.icon,
                    liked && styles.liked,
                    { transform: [{ scale: heartScale }] },
                  ]}
                >
                  {liked ? '❤️' : '🤍'} {likeCount}
                </Animated.Text>
              </TouchableOpacity>
              <Text style={styles.icon}>💬 {comments.length}</Text>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.commentBubble}>
                  <Text style={styles.commentUser}>{item.email}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              )}
              contentContainerStyle={styles.commentList}
              scrollEnabled={false}
              keyboardShouldPersistTaps="handled"
            />
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#aaa"
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={handleCommentSubmit}
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={handleCommentSubmit}>
              <Text style={styles.send}>Post</Text>
            </TouchableOpacity>
          </View>

          <Modal visible={fullscreenVisible} transparent={true}>
            <TouchableWithoutFeedback onPress={() => setFullscreenVisible(false)}>
              <View style={styles.modalBackground}>
                <Animated.Image
                  source={{ uri: photoUrl }}
                  style={[styles.fullscreenImage, { opacity: imageOpacity }]}
                  resizeMode="contain"
                />
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  image: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: '#eaeaea',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 18,
    color: '#444',
  },
  liked: {
    color: '#e63946',
    fontWeight: '600',
  },
  commentList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  commentBubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  commentUser: {
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    padding: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  send: {
    color: '#007AFF',
    fontWeight: '600',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
});
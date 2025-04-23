import { useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet, ScrollView, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useUser } from '../context/UserContext';
import uuid from 'react-native-uuid';

const storage = getStorage(app);
const db = getFirestore(app);

export default function CreateAlbumScreen({ navigation }) {
  const { firebaseUser } = useUser();
  const [albumName, setAlbumName] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImages(result.assets || [result]); // Fallback for older expo versions
    }
  };

  const handleUpload = async () => {
    if (!albumName || images.length === 0) {
      Alert.alert('Album name and at least one photo are required');
      return;
    }

    setUploading(true);

    try {
      // Step 1: Create album document with placeholder coverUrl
      const albumRef = await addDoc(collection(db, 'albums'), {
        name: albumName,
        createdBy: firebaseUser.uid,
        createdAt: serverTimestamp(),
        coverUrl: '', // Placeholder for now
      });

      // Step 2: Upload images and add metadata
      await Promise.all(
        images.map(async (img, index) => {
          const imageId = uuid.v4();
          const imageRef = ref(storage, `albums/${albumRef.id}/${imageId}.jpg`);

          const response = await fetch(img.uri);
          const blob = await response.blob();

          await uploadBytes(imageRef, blob);
          const downloadURL = await getDownloadURL(imageRef);

          // Save photo info to Firestore
          await addDoc(collection(db, `albums/${albumRef.id}/photos`), {
            url: downloadURL,
            createdAt: serverTimestamp(),
          });

          // If first image, update album cover
          if (index === 0) {
            await setDoc(
              doc(db, 'albums', albumRef.id),
              { coverUrl: downloadURL },
              { merge: true }
            );
          }
        })
      );

      Alert.alert('Album created!');
      navigation.goBack();
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Error uploading album.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder="Album name"
        style={styles.input}
        value={albumName}
        onChangeText={setAlbumName}
      />
      <Button title="Pick Photos" onPress={pickImages} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.preview}>
        {images.map((img, index) => (
          <Image key={index} source={{ uri: img.uri }} style={styles.thumbnail} />
        ))}
      </ScrollView>
      <Button title={uploading ? 'Uploading...' : 'Create Album'} onPress={handleUpload} disabled={uploading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    width: '100%',
  },
  preview: {
    marginVertical: 12,
  },
  thumbnail: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
});
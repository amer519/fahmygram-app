import {
    View,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
  } from 'react-native';
  import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
  import { getFirestore, doc, getDoc } from 'firebase/firestore';
  import { app } from '../firebaseConfig';
  import { LinearGradient } from 'expo-linear-gradient';
  import { useState } from 'react';
  import AuthForm from '../components/AuthForm';
  
  export default function LoginScreen({ navigation }) {
    const auth = getAuth(app);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    const handleLogin = async () => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
    
        const db = getFirestore(app);
        const approvedRef = doc(db, 'approvedUsers', user.email);
        const approvedSnap = await getDoc(approvedRef);
    
        if (approvedSnap.exists()) {
          // ✅ User is approved, continue normally
        } else {
          // ⛔️ User not approved: Sign them out and show message
          await signOut(auth);
          alert('Your account is pending approval. Please contact the admin.');
        }
      } catch (err) {
        alert(err.message);
      }
    };    
  
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.scrollInner} keyboardShouldPersistTaps="handled">
          <View style={styles.quoteContainer}>
            <Text style={styles.quote}>
              “Not every good thing is meant for the world to see. Some blessings are best shared only
              with family, for what is kept within the home is often more protected and more pure.”
            </Text>
          </View>
  
          <AuthForm
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
          />
  
          <TouchableOpacity onPress={handleLogin} style={styles.gradientButtonWrapper}>
            <LinearGradient
              colors={['#F58529', '#DD2A7B', '#8134AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.navButton}>
            <Text style={styles.navButtonText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollInner: {
      padding: 20,
      paddingBottom: 60,
    },
    quoteContainer: {
      marginTop: 40,
      marginBottom: 30,
      paddingHorizontal: 10,
    },
    quote: {
      fontStyle: 'italic',
      fontSize: 15,
      color: '#444',
      textAlign: 'center',
      lineHeight: 22,
    },
    gradientButtonWrapper: {
      marginTop: 20,
      alignSelf: 'center',
      width: '100%',
    },
    gradientButton: {
      paddingVertical: 14,
      borderRadius: 30,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    navButton: {
      marginTop: 20,
      alignSelf: 'center',
    },
    navButtonText: {
      color: '#007AFF',
      fontSize: 15,
      fontWeight: '500',
    },
  });  
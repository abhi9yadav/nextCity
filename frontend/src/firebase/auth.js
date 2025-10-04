import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  signOut,
} from "firebase/auth";

// Register new user
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log(userCredential.user);
    return userCredential;
  } catch (error) {
    throw new Error(error.code || error.message);
  }
};

// Login with email/password
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    throw new Error(error.code || error.message);
  }
};

// Login with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.code || error.message);
  }
};

// Logout user
export const doSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.code || error.message);
  }
};

// Send password reset email
export const doPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(error.code || error.message);
  }
};

// Change password (requires recent login)
export const doPasswordChange = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (user) {
      await updatePassword(user, newPassword);
    } else {
      throw new Error("No user is currently signed in.");
    }
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      throw new Error("Please re-login before changing your password.");
    }
    throw new Error(error.code || error.message);
  }
};

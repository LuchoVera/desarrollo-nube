import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseinit";
import type { UserProfile } from "../models/User";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loadingAuth: boolean;
  setNewlyRegisteredUser: (user: FirebaseUser, profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loadingAuth: true,
  setNewlyRegisteredUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const fetchUserProfile = useCallback(async (user: FirebaseUser | null) => {
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoadingAuth(true);
      setFirebaseUser(user);
      await fetchUserProfile(user);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const setNewlyRegisteredUser = (user: FirebaseUser, profile: UserProfile) => {
    setLoadingAuth(true);
    setFirebaseUser(user);
    setUserProfile(profile);
    setLoadingAuth(false);
  };

  const value = {
    firebaseUser,
    userProfile,
    loadingAuth,
    setNewlyRegisteredUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

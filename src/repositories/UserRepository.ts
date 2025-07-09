import {
  collection,
  getDocs,
  doc,
  query,
  where,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../firebaseinit";
import type { UserProfile } from "../models/User";

export class UserRepository {
  private collectionRef = collection(db, "users");

  private fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>
  ): UserProfile {
    const data = snapshot.data();
    return {
      uid: snapshot.id,
      email: data.email || "",
      role: data.role || "user",
      displayName: data.displayName || "",
      artistImageUrl: data.artistImageUrl || undefined,
    };
  }

  async getUsersWithRole(
    role: "user" | "artist" | "admin"
  ): Promise<UserProfile[]> {
    const q = query(this.collectionRef, where("role", "==", role));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.fromFirestore(doc));
  }

  async add(user: UserProfile): Promise<void> {
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, user);
  }

  async delete(uid: string): Promise<void> {
    const docRef = doc(db, "users", uid);
    await deleteDoc(docRef);
  }
}

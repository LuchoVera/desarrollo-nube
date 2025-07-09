import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../firebaseinit";
import type { Genre } from "../models/Genre";

export class GenreRepository {
  private collectionRef = collection(db, "genres");

  private fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): Genre {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name || "",
      imageUrl: data.imageUrl || "",
    };
  }

  async getAll(): Promise<Genre[]> {
    const snapshot = await getDocs(this.collectionRef);
    return snapshot.docs.map((doc) => this.fromFirestore(doc));
  }

  async add(genreData: { name: string; imageUrl: string }): Promise<Genre> {
    const docRef = await addDoc(this.collectionRef, genreData);
    return {
      id: docRef.id,
      ...genreData,
    };
  }

  async delete(genreId: string): Promise<void> {
    const docRef = doc(db, "genres", genreId);
    await deleteDoc(docRef);
  }
}

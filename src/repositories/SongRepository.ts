import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../firebaseinit";
import type { Song } from "../models/Song";

export class SongRepository {
  private collectionRef = collection(db, "songs");

  private fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): Song {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name || "",
      audioUrl: data.audioUrl || "",
      imageUrl: data.imageUrl || "",
      artistId: data.artistId || "",
      artistName: data.artistName || "",
      genreId: data.genreId || "",
    };
  }

  async getAll(): Promise<Song[]> {
    const snapshot = await getDocs(this.collectionRef);
    return snapshot.docs.map((doc) => this.fromFirestore(doc));
  }

  async add(song: Omit<Song, "id">): Promise<Song> {
    const docRef = await addDoc(this.collectionRef, song);
    return {
      id: docRef.id,
      ...song,
    };
  }

  async delete(songId: string): Promise<void> {
    const docRef = doc(db, "songs", songId);
    await deleteDoc(docRef);
  }

  async getByArtistId(artistId: string): Promise<Song[]> {
    const q = query(this.collectionRef, where("artistId", "==", artistId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.fromFirestore(doc));
  }

  async getByGenreId(genreId: string): Promise<Song[]> {
    const q = query(this.collectionRef, where("genreId", "==", genreId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.fromFirestore(doc));
  }
}

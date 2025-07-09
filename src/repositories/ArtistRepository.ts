import { collection, doc, getDoc } from "firebase/firestore";

import { db } from "../firebaseinit";
import type { Artist } from "../models/Artist";
import type { UserProfile } from "../models/User";

export class ArtistRepository {
  private usersCollectionRef = collection(db, "users");

  private userProfileToArtist(userProfile: UserProfile): Artist {
    return {
      id: userProfile.uid,
      name: userProfile.displayName,
      imageUrl: userProfile.artistImageUrl || "",
    };
  }

  async getById(artistId: string): Promise<Artist | null> {
    const userDocRef = doc(this.usersCollectionRef, artistId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists() && userDocSnap.data().role === "artist") {
      const userProfile = userDocSnap.data() as UserProfile;
      return this.userProfileToArtist(userProfile);
    } else {
      return null;
    }
  }
}

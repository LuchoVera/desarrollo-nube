export interface UserProfile {
  uid: string;
  email: string | null;
  role: "user" | "artist" | "admin";
  displayName: string;
  artistImageUrl?: string;
}

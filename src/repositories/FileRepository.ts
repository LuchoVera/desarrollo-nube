import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseinit";

export class FileRepository {
  async uploadFile(file: File, path: string): Promise<string> {
    if (!file) {
      throw new Error("No file provided for upload!");
    }
    const storageRef = ref(storage, `${path}${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  }
}

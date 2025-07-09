import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { GenreRepository } from "../../repositories/GenreRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { SongRepository } from "../../repositories/SongRepository";
import { FileRepository } from "../../repositories/FileRepository";
import type { Genre } from "../../models/Genre";
import type { UserProfile } from "../../models/User";
import type { Song } from "../../models/Song";

import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import firebaseConfig from "../../firebaseconfig";

import "./AdminDashboard.css";

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [genres, setGenres] = useState<Genre[]>([]);
  const [artists, setArtists] = useState<UserProfile[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

  const [newGenreName, setNewGenreName] = useState("");
  const [newGenreImage, setNewGenreImage] = useState<File | null>(null);

  const [newArtistName, setNewArtistName] = useState("");
  const [newArtistEmail, setNewArtistEmail] = useState("");
  const [newArtistPassword, setNewArtistPassword] = useState("");
  const [newArtistImage, setNewArtistImage] = useState<File | null>(null);

  const [newSongName, setNewSongName] = useState("");
  const [newSongImage, setNewSongImage] = useState<File | null>(null);
  const [newSongAudio, setNewSongAudio] = useState<File | null>(null);
  const [selectedArtist, setSelectedArtist] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");

  const genreRepo = new GenreRepository();
  const userRepo = new UserRepository();
  const songRepo = new SongRepository();
  const fileRepo = new FileRepository();

  useEffect(() => {
    if (userProfile?.role === "admin") {
      const loadData = async () => {
        setLoading(true);
        try {
          const [allGenres, allArtists, allSongs] = await Promise.all([
            genreRepo.getAll(),
            userRepo.getUsersWithRole("artist"),
            songRepo.getAll(),
          ]);
          setGenres(allGenres);
          setArtists(allArtists);
          setSongs(allSongs);
        } catch (err: any) {
          setError(err.message);
        }
        setLoading(false);
      };
      loadData();
    }
  }, [userProfile]);

  const handleDeleteArtist = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this artist?")) return;
    try {
      await userRepo.delete(userId);
      setArtists(artists.filter((a) => a.uid !== userId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteGenre = async (genreId: string) => {
    if (!window.confirm("Are you sure you want to delete this genre?")) return;
    try {
      await genreRepo.delete(genreId);
      setGenres(genres.filter((g) => g.id !== genreId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;
    try {
      await songRepo.delete(songId);
      setSongs(songs.filter((s) => s.id !== songId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenreName || !newGenreImage) return;
    setLoading(true);
    try {
      const imageUrl = await fileRepo.uploadFile(
        newGenreImage,
        "images/genres/"
      );
      const newGenre = await genreRepo.add({ name: newGenreName, imageUrl });
      setGenres([...genres, newGenre]);
      setNewGenreName("");
      setNewGenreImage(null);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newArtistName ||
      !newArtistEmail ||
      !newArtistPassword ||
      !newArtistImage
    )
      return;
    setLoading(true);
    setError("");

    const secondaryApp = initializeApp(firebaseConfig, "secondary-auth");
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        newArtistEmail,
        newArtistPassword
      );
      const user = userCredential.user;

      const imageUrl = await fileRepo.uploadFile(
        newArtistImage,
        `images/artists/${user.uid}/`
      );
      const newArtistProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: newArtistName,
        role: "artist",
        artistImageUrl: imageUrl,
      };
      await userRepo.add(newArtistProfile);

      setArtists([...artists, newArtistProfile]);
      setNewArtistName("");
      setNewArtistEmail("");
      setNewArtistPassword("");
      setNewArtistImage(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      await deleteApp(secondaryApp);
      setLoading(false);
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newSongName ||
      !newSongImage ||
      !newSongAudio ||
      !selectedArtist ||
      !selectedGenre
    )
      return;
    setLoading(true);

    try {
      const artist = artists.find((a) => a.uid === selectedArtist);
      if (!artist) throw new Error("Artist not found");

      const [imageUrl, audioUrl] = await Promise.all([
        fileRepo.uploadFile(newSongImage, `images/songs/${selectedArtist}/`),
        fileRepo.uploadFile(newSongAudio, `audio/songs/${selectedArtist}/`),
      ]);
      const newSong = await songRepo.add({
        name: newSongName,
        imageUrl,
        audioUrl,
        artistId: selectedArtist,
        artistName: artist.displayName,
        genreId: selectedGenre,
      });
      setSongs([...songs, newSong]);
      setNewSongName("");
      setNewSongImage(null);
      setNewSongAudio(null);
      setSelectedArtist("");
      setSelectedGenre("");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (userProfile?.role !== "admin") {
    return <p>Access Denied.</p>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="admin-section">
        <h2>Manage Genres</h2>
        <form onSubmit={handleAddGenre}>
          <input
            type="text"
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            placeholder="Genre Name"
            required
          />
          <input
            type="file"
            onChange={(e) =>
              setNewGenreImage(e.target.files ? e.target.files[0] : null)
            }
            accept="image/*"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Genre"}
          </button>
        </form>
        <ul className="admin-list">
          {genres.map((genre) => (
            <li key={genre.id}>
              <img
                src={genre.imageUrl}
                alt={genre.name}
                className="list-item-image"
              />
              <span>{genre.name}</span>
              <button
                onClick={() => handleDeleteGenre(genre.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-section">
        <h2>Manage Artists</h2>
        <form onSubmit={handleAddArtist}>
          <input
            type="text"
            value={newArtistName}
            onChange={(e) => setNewArtistName(e.target.value)}
            placeholder="Artist Name"
            required
          />
          <input
            type="email"
            value={newArtistEmail}
            onChange={(e) => setNewArtistEmail(e.target.value)}
            placeholder="Artist Email"
            required
          />
          <input
            type="password"
            value={newArtistPassword}
            onChange={(e) => setNewArtistPassword(e.target.value)}
            placeholder="Artist Password"
            required
          />
          <input
            type="file"
            onChange={(e) =>
              setNewArtistImage(e.target.files ? e.target.files[0] : null)
            }
            accept="image/*"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Artist"}
          </button>
        </form>
        <ul className="admin-list">
          {artists.map((artist) => (
            <li key={artist.uid}>
              <img
                src={artist.artistImageUrl}
                alt={artist.displayName}
                className="list-item-image"
              />
              <div className="item-info">
                <span>{artist.displayName}</span>
                <small>{artist.email}</small>
              </div>
              <button
                onClick={() => handleDeleteArtist(artist.uid)}
                className="delete-btn"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-section">
        <h2>Manage Songs</h2>
        <form onSubmit={handleAddSong}>
          <input
            type="text"
            value={newSongName}
            onChange={(e) => setNewSongName(e.target.value)}
            placeholder="Song Name"
            required
          />
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            required
          >
            <option value="">Select Artist</option>
            {artists.map((artist) => (
              <option key={artist.uid} value={artist.uid}>
                {artist.displayName}
              </option>
            ))}
          </select>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            required
          >
            <option value="">Select Genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
          <label>Song Image</label>
          <input
            type="file"
            onChange={(e) =>
              setNewSongImage(e.target.files ? e.target.files[0] : null)
            }
            accept="image/*"
            required
          />
          <label>Song Audio</label>
          <input
            type="file"
            onChange={(e) =>
              setNewSongAudio(e.target.files ? e.target.files[0] : null)
            }
            accept="audio/*"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Song"}
          </button>
        </form>
        <ul className="admin-list">
          {songs.map((song) => (
            <li key={song.id}>
              <img
                src={song.imageUrl}
                alt={song.name}
                className="list-item-image"
              />
              <div className="item-info">
                <strong>{song.name}</strong>
                <small>{song.artistName}</small>
              </div>
              <button
                onClick={() => handleDeleteSong(song.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { GenreRepository } from "../../repositories/GenreRepository";
import { SongRepository } from "../../repositories/SongRepository";
import { FileRepository } from "../../repositories/FileRepository";
import type { Genre } from "../../models/Genre";
import type { Song } from "../../models/Song";
import "./ArtistDashboard.css";

const ArtistDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [genres, setGenres] = useState<Genre[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

  const [newSongName, setNewSongName] = useState("");
  const [newSongImage, setNewSongImage] = useState<File | null>(null);
  const [newSongAudio, setNewSongAudio] = useState<File | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  const genreRepo = new GenreRepository();
  const songRepo = new SongRepository();
  const fileRepo = new FileRepository();

  useEffect(() => {
    if (userProfile?.role === "artist") {
      const loadData = async () => {
        setLoading(true);
        try {
          const [allGenres, artistSongs] = await Promise.all([
            genreRepo.getAll(),
            songRepo.getByArtistId(userProfile.uid),
          ]);
          setGenres(allGenres);
          setSongs(artistSongs);
        } catch (err: any) {
          setError(err.message);
        }
        setLoading(false);
      };
      loadData();
    }
  }, [userProfile]);

  const handleDeleteSong = async (songId: string) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;
    try {
      await songRepo.delete(songId);
      setSongs(songs.filter((s) => s.id !== songId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newSongName ||
      !newSongImage ||
      !newSongAudio ||
      !userProfile ||
      !selectedGenre
    )
      return;
    setLoading(true);
    try {
      const [imageUrl, audioUrl] = await Promise.all([
        fileRepo.uploadFile(newSongImage, `images/songs/${userProfile.uid}/`),
        fileRepo.uploadFile(newSongAudio, `audio/songs/${userProfile.uid}/`),
      ]);
      const newSong = await songRepo.add({
        name: newSongName,
        imageUrl,
        audioUrl,
        artistId: userProfile.uid,
        artistName: userProfile.displayName,
        genreId: selectedGenre,
      });
      setSongs([...songs, newSong]);
      setNewSongName("");
      setNewSongImage(null);
      setNewSongAudio(null);
      setSelectedGenre("");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (userProfile?.role !== "artist") {
    return <p>Access Denied.</p>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Artist Dashboard ({userProfile.displayName})</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="admin-section">
        <h2>Manage Your Songs</h2>
        <form onSubmit={handleAddSong}>
          <input
            type="text"
            value={newSongName}
            onChange={(e) => setNewSongName(e.target.value)}
            placeholder="Song Name"
            required
          />
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
            {loading ? "Uploading..." : "Add Song"}
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

export default ArtistDashboard;

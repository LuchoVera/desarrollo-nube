import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { SongRepository } from "../../repositories/SongRepository";
import { ArtistRepository } from "../../repositories/ArtistRepository";
import "../Home/home.css";

interface UniqueArtist {
  id: string;
  name: string;
  imageUrl?: string;
}

const GenreMusicPage: React.FC = () => {
  const { genreId } = useParams<{ genreId: string }>();
  const [artists, setArtists] = useState<UniqueArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!genreId) return;

    const fetchArtistsInGenre = async () => {
      setLoading(true);
      try {
        const songRepo = new SongRepository();
        const artistRepo = new ArtistRepository();
        const songs = await songRepo.getByGenreId(genreId);

        const uniqueArtistsMap = new Map<
          string,
          { id: string; name: string }
        >();
        songs.forEach((song) => {
          if (!uniqueArtistsMap.has(song.artistId)) {
            uniqueArtistsMap.set(song.artistId, {
              id: song.artistId,
              name: song.artistName,
            });
          }
        });

        const artistPromises = Array.from(uniqueArtistsMap.values()).map(
          (artist) => artistRepo.getById(artist.id)
        );
        const artistProfiles = await Promise.all(artistPromises);

        const artistsWithImages = artistProfiles
          .filter((profile) => profile !== null)
          .map((profile) => ({
            id: profile!.id,
            name: profile!.name,
            imageUrl: profile!.imageUrl,
          }));

        setArtists(artistsWithImages);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistsInGenre();
  }, [genreId]);

  if (loading) return <p>Loading artists in this genre...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="home-container">
      <h1>Artists in this Genre</h1>
      <div className="genre-grid">
        {artists.length > 0 ? (
          artists.map((artist) => (
            <Link
              to={`/artist/${artist.id}`}
              key={artist.id}
              className="item-card"
            >
              {artist.imageUrl ? (
                <img src={artist.imageUrl} alt={artist.name} />
              ) : (
                <div className="item-card-image-placeholder">🎤</div>
              )}
              <h3>{artist.name}</h3>
            </Link>
          ))
        ) : (
          <p>No artists have added music to this genre yet.</p>
        )}
      </div>
    </div>
  );
};

export default GenreMusicPage;

const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const {
  InvariantError,
  NotFoundError,
  ClientError,
} = require('../../exceptions');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
  }

  async verifySong(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan.');
    }
  }

  async verifyPlaylistSong(playlistId, songId) {
    const query = {
      text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length) {
      throw new ClientError('Song sudah ada di Playlist');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists RIGHT JOIN users ON playlists.owner = users.id WHERE playlists.id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    const querySongs = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN playlist_songs ON playlist_songs.song_id = songs.id WHERE playlist_songs.playlist_id = $1',
      values: [playlistId],
    };

    const resultSongs = await this._pool.query(querySongs);

    if (!resultSongs.rows.length) {
      throw new NotFoundError('Song tidak ditemukan pada Playlist');
    }

    return { ...result.rows[0], songs: resultSongs.rows };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('Song gagal dihapus, Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;

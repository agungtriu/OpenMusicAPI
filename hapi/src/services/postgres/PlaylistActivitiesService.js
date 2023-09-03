const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { InvariantError, NotFoundError } = require('../../exceptions');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivityPlaylist(playlistId, songId, owner, action, time) {
    const id = `playlist_activity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, owner, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Activiy Playlist gagal dicatat');
    }

    return result.rows[0].id;
  }

  async getPlaylistActivities(playlistId, owner) {
    const query = {
      text: 'SELECT users.username, songs.title, playlist_activities.action, playlist_activities.time FROM playlist_activities INNER JOIN users ON playlist_activities.user_id = users.id INNER JOIN songs ON playlist_activities.song_id = songs.id WHERE playlist_id = $1 and user_id = $2',
      values: [playlistId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Activity Playlist tidak ditemukan');
    }

    return result.rows;
  }
}

module.exports = PlaylistActivitiesService;

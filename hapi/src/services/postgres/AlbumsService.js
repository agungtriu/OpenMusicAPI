const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const {
  InvariantError,
  NotFoundError,
  ClientError,
} = require('../../exceptions');
const { mapSongsDBToModel, mapAlbumsDBToModel } = require('../../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE albums.id = $1',
      values: [id],
    };
    const resultAlbum = await this._pool.query(queryAlbum);
    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const querySongs = {
      text: 'SELECT * FROM songs WHERE songs.album_id = $1',
      values: [id],
    };
    const resultSongs = await this._pool.query(querySongs);
    const albums = resultAlbum.rows.map(mapAlbumsDBToModel);
    return {
      ...albums[0],
      songs: resultSongs.rows.map(mapSongsDBToModel),
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbaharui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async updateCoverAlbumById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbaharui album. Id tidak ditemukan');
    }
  }

  async verifyAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE albums.id = $1',
      values: [id],
    };
    const resultAlbum = await this._pool.query(queryAlbum);
    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async verifyAlbumLike(albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new ClientError('Tidak bisa menyukai album yang sama');
    }
  }

  async addAlbumLike(albumId, userId) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menyukai album');
    }

    await this._cacheService.delete(`albums:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`albums:${albumId}`);
      return { likes: +result, source: 'cache' };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`albums:${albumId}`, `${result.rowCount}`);

      return { likes: result.rowCount, source: 'server' };
    }
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Id tidak ditemukan');
    }
    await this._cacheService.delete(`albums:${albumId}`);
  }
}

module.exports = AlbumsService;

const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(
    playlistsService,
    playlistSongsService,
    playlistActivitiesService,
    validator,
  ) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._playlistActivitiesService = playlistActivitiesService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._playlistsService.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this._playlistsService.deletePlaylistById(playlistId);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistSongsService.verifySong(songId);
    await this._playlistSongsService.verifyPlaylistSong(playlistId, songId);

    await this._playlistSongsService.addSongToPlaylist(playlistId, songId);

    const action = 'add';
    const time = new Date().toISOString();

    await this._validator.validateActivityPayload({
      songId,
      userId: credentialId,
      action,
      time,
    });

    await this._playlistActivitiesService.addActivityPlaylist(
      playlistId,
      songId,
      credentialId,
      action,
      time,
    );

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan pada Playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._playlistSongsService.getSongsFromPlaylist(
      playlistId,
    );

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistSongsService.deleteSongFromPlaylist(playlistId, songId);

    const action = 'delete';
    const time = new Date().toISOString();

    await this._validator.validateActivityPayload({
      songId,
      userId: credentialId,
      action,
      time,
    });

    await this._playlistActivitiesService.addActivityPlaylist(
      playlistId,
      songId,
      credentialId,
      action,
      time,
    );

    return {
      status: 'success',
      message: 'Song berhasil dihapus dari Playlist',
    };
  }

  async getActivitiesFromPlaylistByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._playlistActivitiesService.getPlaylistActivities(
      playlistId,
      credentialId,
    );

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;

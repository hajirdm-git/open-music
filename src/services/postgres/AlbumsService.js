const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');


class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({ name, year }){
        const id = `album-${nanoid(16)}`;

        const addQuery = {
            text : 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values : [id, name, year],
        };

        const result = await this._pool.query(addQuery);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getAlbumById(id){
        const getAlbumQuery = {
            text : 'SELECT * FROM albums WHERE id = $1',
            values : [id],
        };

        const getSongsQuery = {
            text : 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
            values : [id],
        };

        const albumResult = await this._pool.query(getAlbumQuery);
        const songsResult = await this._pool.query(getSongsQuery);

        if (!albumResult.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        const album = albumResult.rows[0];
        album['songs'] = songsResult.rows;
        
        return album
    }

    async editAlbumById(id, { name, year }){
        const editQuery = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
          };
      
          const result = await this._pool.query(editQuery);
      
          if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan.');
          }
    }

    async deleteAlbumById(id){
        const deleteQuery = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
          };
      
          const result = await this._pool.query(deleteQuery);
      
          if (!result.rows.length) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan.');
          }
    }
}

module.exports = AlbumsService;
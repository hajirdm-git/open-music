const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({ title, year, performer, genre, duration, albumId }){
        const id = `song-${nanoid(16)}`;

        const addQuery = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, year, performer, genre, duration, albumId],
          };
      
          const result = await this._pool.query(addQuery);
      
          if (!result.rows[0].id) {
            throw new InvariantError('Musik gagal ditambahkan');
          }
      
          return result.rows[0].id;
    }

    async getSongs(arg = null){
        const title = arg?.title || null;
        const performer = arg?.performer || null;
        var getQuery = {
            text : 'SELECT id, title, performer FROM songs',
            values : [],
        };
        if( arg ){
            if ( title && !performer) {
                getQuery = {
                    text : "SELECT id, title, performer FROM songs WHERE title ILIKE '%'||$1||'%'",
                    values : [title],
                };
            } else if ( !title && performer ) {
                getQuery = {
                    text : "SELECT id, title, performer FROM songs WHERE performer ILIKE '%'||$1||'%'",
                    values : [performer],
                };
            } else if ( title && performer ) {
                getQuery = {
                    text : "SELECT id, title, performer FROM songs WHERE title ILIKE '%'||$1||'%' AND performer ILIKE '%'||$2||'%'",
                    values : [ title, performer ],
                };
            } 
        } 

        const result = await this._pool.query(getQuery);

        return result.rows;
    }

    async getSongById(id) {
        const getQuery = {
            text : 'SELECT * FROM songs WHERE id = $1',
            values : [id],
        };

        const result = await this._pool.query(getQuery);

        if (!result.rows.length) {
            throw new NotFoundError('Musik tidak ditemukan');
        }
      
        return result.rows[0];
    }

    async editSongById(id, { title, year, genre, performer, duration, albumId = null }) {
        const updateQuery = {
            text : `UPDATE songs SET 
            title = $1, 
            year = $2, 
            genre = $3, 
            performer = $4, 
            duration = $5, 
            "albumId" = $6 
            WHERE id = $7 RETURNING id`,
            values : [ title, year, genre, performer, duration, albumId, id ],
        };

        const result = await this._pool.query(updateQuery); 

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui musik. Id tidak ditemukan.');
        }
    }

    async deleteSongById(id) {
        const deleteQuery = {
            text : 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values : [id],
        };

        const result = await this._pool.query(deleteQuery); 

        if (!result.rows.length) {
            throw new NotFoundError('Musik gagal dihapus. Id tidak ditemukan.');
        }
    }
}

module.exports = SongsService;
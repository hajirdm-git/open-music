const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class albumsService {
    constructor() {
      this._albums = [];
    }

    addAlbum({ name, year }){
        const id = `album-${nanoid(16)}`;

        const newAlbum = { id, name, year, };

        this._albums.push(newAlbum);

        const isSuccess = this._albums.filter((album) => album.id === id).length > 0;

        if (!isSuccess) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return id;
    }

    getAlbumById(id) {
        const album = this._albums.filter((a) => a.id === id)[0];

        if (!album) {
            throw new NotFoundError('Catatan tidak ditemukan');
        }
        return album;
    }

    editAlbumById(id, { name, year }) {
        const index = this._albums.findIndex((album) => album.id === id);

        if (index === -1) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }

        this._albums[index] = {
            ...this._albums[index],
            name,
            year,
        };
    }

    deleteAlbumById(id) {
        const index = this._albums.findIndex((album) => album.id === id);
        if (index === -1) {
          throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
        }
        this._albums.splice(index, 1);
      }
  }

  //module.exports = albumsService;
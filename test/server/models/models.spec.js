import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import db from '../../../server/app/db/models';
import { userData, documentData } from '../TestData';

chai.use(chaiAsPromised);
const should = chai.should();


chai.should();

describe('Document model', () => {
  before((done) => {
    db.Role.bulkCreate([
        { title: 'regular' },
        { title: 'admin' }
    ]).then(() => {
      db.User.bulkCreate(userData)
      .then(() => {
        db.Document.bulkCreate([documentData[0]]);
        done();
      });
    });
  });

  after((done) => {
    db.sequelize.sync({ force: true }).then(() => done());
  });

  describe('Create document', () => {
    it('should create a new document', (done) => {
      db.Document.create(documentData[4])
      .then((document) => {
        document.should.have.property('title').to
          .eql('Goku vs Saitama death match');
        document.should.have.property('content').to
          .eql('Goku ends up dieing lol');
        document.should.have.property('access').to
          .eql('role');
        document.should.have.property('ownerId').to.eql(400);
        done();
      });
    });

    it('should throw an error if any field is empty', (done) => {
      db.Document.create({
        title: 'saitama',
      })
      .should.be.rejected.notify(done);
    });

    it('should throw an error if user with ownerId dose not exist', (done) => {
      db.Document.create({
        title: 'Goku in the after life',
        content: 'Naruto vs the sage of six path',
        access: 'public',
        ownerId: 56789
      })
      .should.be.rejected.notify(done);
    });
  });

  describe('Delete document', () => {
    it('should delete a document', (done) => {
      db.Document.destroy({
        where: { id: 2 }
      })
      .should.be.fulfilled.and.notify(done);
    });

    it('should not throw an error if Document does not exist', (done) => {
      db.Document.destroy({
        where: { id: 33737373 }
      }).should.be.fulfilled.and.notify(done);
    });


    it('should return null for deleted Document', (done) => {
      db.Document.findById(2)
        .then((document) => {
          should.equal(document, null);
          done();
        });
    });
  });

  describe('Update document', () => {
    it('should update a document', (done) => {
      db.Document.update({
        title: 'Naruto vs Saitama',
        content: 'Naruto vs Saitama',
        access: 'public',
      }, {
        where: { id: 5 }
      })
      .should.be.fulfilled.and.notify(done);
    });

    it('should update update document details', (done) => {
      db.Document.findById(5)
      .then((document) => {
        document.should.have.property('title').to.eql('Naruto vs Saitama');
        document.should.have.property('content').to
          .eql('Naruto vs Saitama');
        document.should.have.property('access').to.eql('public');
        done();
      });
    });
  });
});

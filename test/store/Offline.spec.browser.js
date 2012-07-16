/**
 * Kinvey.Store.Offline test suite.
 */
describe('Kinvey.Store.Offline', function() {
  // Create store.
  before(function() {
    this.store = new Kinvey.Store.Offline(COLLECTION_UNDER_TEST);
  });
  after(function(done) {
    Kinvey.getCurrentUser().destroy(callback(done));
  });

  // Kinvey.Store.Offline#remove
  describe('#remove', function() {
    // Create mock.
    before(function(done) {
      this.object = { _id: 'foo', bar: true };
      this.store.save(this.object, callback(done, { success: function() { } }));
    });

    // Test suite.
    it('removes an object and synchronizes.', function(done) {
      this.store.remove(this.object, callback(done, {
        success: function(_, info) {
          info.offline.should.be['true'];
        },
        complete: function(status) {
          status[COLLECTION_UNDER_TEST].committed.should.have.length(1);
          done();
        }
      }));
    });
  });

  // Kinvey.Store.Offline#removeWithQuery
  describe('#removeWithQuery', function() {
    // Create mock.
    beforeEach(function(done) {
      var query = this.query = new Kinvey.Query().on('bar').equal('baz');
      var store = this.store;

      this.object = { _id: 'foo', bar: 'baz' };
      store.save(this.object, callback(done, {
        success: function() { },
        complete: function() {
          // Make sure the query is cached.
          store.queryWithQuery(query.toJSON(), callback(done, { success: function() { },
            complete: function() {
              done();
            }
          }));
        }
      }));
    });

    // Test suite.
    it('removes multiple objects and synchronizes.', function(done) {
      var store = this.store;
      var query = this.query;
      store.removeWithQuery(query.toJSON(), callback(done, {
        success: function() { },
        complete: function(status) {
          status[COLLECTION_UNDER_TEST].committed.should.have.length(1);

          // Make sure the query and object are really gone.
          store.queryWithQuery(query.toJSON(), callback(done, {
            policy: Kinvey.Store.Cached.NO_CACHE,// Avoid re-caching this query.
            success: function(response, info) {
              info.network.should.be['true'];
              response.should.have.length(0);
            }
          }));
        }
      }));
    });
  });

  // Kinvey.Store.Offline#save
  describe('#save', function() {
    // Create mock.
    before(function() {
      this.object = { _id: 'foo', bar: 'baz' };
    });
    after(function(done) {
      this.store.remove(this.object, callback(done, { success: function() { } }));
    });

    // Test suite.
    it('saves an object and synchronizes.', function(done) {
      var object = this.object;
      this.store.save(object, callback(done, {
        success: function(response, info) {
          response.should.eql(object);
          info.offline.should.be['true'];
        },
        complete: function(status) {
          status[COLLECTION_UNDER_TEST].committed.should.have.length(1);
          done();
        }
      }));
    });
  });

});
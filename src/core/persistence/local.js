// Local persistence.
// ------------------

// The local persistence namespace translates persistence requests into calls
// to persist data locally. The local persistence is accessible through the
// `Database` namespace.

/**
 * @private
 * @memberof! <global>
 * @namespace Kinvey.Persistence.Local
 */
Kinvey.Persistence.Local = /** @lends Kinvey.Persistence.Local */{
  /**
   * Initiates a create request.
   *
   * @param {Request} request The request.
   * @param {Options} options Options.
   * @returns {Promise} The response.
   */
  create: function(request, options) {
    // Debug.
    if(KINVEY_DEBUG) {
      log('Initiating a create request.', arguments);
    }

    // Cast arguments.
    options = options || {};

    // Normalize “collections” of the user namespace.
    var collection = USERS === request.namespace ? USERS : request.collection;

    // The create request can be an aggregation, or (batch) save of documents.
    // The latter two change application data, and are therefore subject to
    // synchronization.
    if('_group' === request.id) {// Aggregation.
      return Database.group(collection, request.data, options);
    }

    // (Batch) save.
    var method  = isArray(request.data) ? 'batch' : 'save';
    var promise = Database[method](collection, request.data, options);
    return promise.then(function(response) {
      // If `options.offline`, the request is subject to synchronization.
      if(options.offline && false !== options.track) {
        // Debug.
        if(KINVEY_DEBUG) {
          log('Notifying the synchronization functionality.', response);
        }

        return Sync.notify(collection, response, options).then(function() {
          // Return the original response.
          return response;
        });
      }
      return response;
    });
  },

  /**
   * Initiates a create request.
   *
   * @param {Request} request The request.
   * @param {Options} options Options.
   * @returns {Promise} The response.
   */
  read: function(request, options) {
    // Debug.
    if(KINVEY_DEBUG) {
      log('Initiating a read request.', arguments);
    }

    // Cast arguments.
    options = options || {};

    // Normalize “collections” of the user namespace.
    var collection = USERS === request.namespace ? USERS : request.collection;

    // The read request can be a count, me, query, or simple get. Neither
    // change any application data, and therefore none are subject to
    // synchronization.
    if('_count' === request.id) {// Count.
      return Database.count(collection, request.query, options);
    }
    if('_me' === request.collection) {// Me.
      // If there is an active user, attempt to retrieve its details.
      var user = Kinvey.getActiveUser();
      if(null !== user) {
        return Database.get(collection, user._id, options).then(null, function(error) {
          // If `ENTITY_NOT_FOUND`, return all we know about the active user.
          if(error.name === Kinvey.Error.ENTITY_NOT_FOUND) {
            return user;
          }
          return Kinvey.Defer.reject(error);
        });
      }
      var error = clientError(Kinvey.Error.NO_ACTIVE_USER);
      return Kinvey.Defer.reject(error);
    }

    // Query the collection, or retrieve a single document.
    var promise;
    if(null == request.id) {// Query.
      promise = Database.find(collection, request.query, options);
    }
    else {// Single document.
      promise = Database.get(collection, request.id, options);
    }
    return promise.then(function(response) {
      // Add support for references.
      if(options.relations) {
        return KinveyReference.get(response, options);
      }
      return response;
    });
  },

  /**
   * Initiates a create request.
   *
   * @param {Request} request The request.
   * @param {Options} options Options.
   * @returns {Promise} The response.
   */
  update: function(request, options) {
    // Debug.
    if(KINVEY_DEBUG) {
      log('Initiating an update request.', arguments);
    }

    // Cast arguments.
    options = options || {};

    // Normalize “collections” of the user namespace.
    var collection = USERS === request.namespace ? USERS : request.collection;

    // All update operations change application data, and are therefore subject
    // to synchronization.
    var promise = Database.update(collection, request.data, options);
    return promise.then(function(response) {
      // If `options.offline`, the response is subject to synchronization.
      if(options.offline && false !== options.track) {
        // Debug.
        if(KINVEY_DEBUG) {
          log('Notifying the synchronization functionality.', response);
        }

        return Sync.notify(collection, response, options).then(function() {
          // Return the original response.
          return response;
        });
      }
      return response;
    });
  },

  /**
   * Initiates a create request.
   *
   * @param {Request} request The request.
   * @param {Options} options Options.
   * @returns {Promise} The response.
   */
  destroy: function(request, options) {
    // Debug.
    if(KINVEY_DEBUG) {
      log('Initiating a delete request.', arguments);
    }

    // Cast arguments.
    options = options || {};

    // Normalize “collections” of the user namespace.
    var collection = USERS === request.namespace ? USERS : request.collection;

    // The delete request can be a clean or destroy of documents. Both change
    // application data, and are therefore subject to synchronization.
    var promise;
    if(null == request.id) {// Clean documents.
      promise = Database.clean(collection, request.query, options);
    }
    else {// Destroy a single document.
      promise = Database.destroy(collection, request.id, options);
    }
    return promise.then(function(response) {
      // If `options.offline`, the request is subject to synchronization.
      if(options.offline && false !== options.track) {
        // Debug.
        if(KINVEY_DEBUG) {
          log('Notifying the synchronization functionality.', response);
        }

        return Sync.notify(collection, response.documents, options).then(function() {
          // Return the original response.
          return response;
        });
      }
      return response;
    });
  }
};
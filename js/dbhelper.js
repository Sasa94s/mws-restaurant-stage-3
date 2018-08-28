/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }
  
  /**
   * Get all restaurants
   * Endpoint {/restaurants/}
   */
  static get ALL_RESTAURANTS_URL() {
    return (`${DBHelper.DATABASE_URL}/restaurants/`);
  }
  
  /**
   * Get a restaurant by id 
   * Endpoint {/restaurants/<restaurant_id>}
   */
  static RESTAURANT_URL(restaurant_id) {
    return (`${DBHelper.DATABASE_URL}/restaurants/${restaurant_id}`);
  }

  /**
   * Get favorite restaurants
   * Endpoint {/restaurants/?is_favorite=true}
   */
  static get FAVORITE_RESTAURANTS_URL() {
    return (`${DBHelper.DATABASE_URL}/restaurants/?is_favorite=true`);
  }

  /**
   * Favorite/Unfavorite a restaurant
   * Endpoint {/restaurants/?is_favorite=<status>}
   */
  static UPDATE_FAVORITE_RESTAURANTS_URL(restaurant_id, status) {
    return (`${DBHelper.DATABASE_URL}/restaurants/${restaurant_id}/?is_favorite=${status}`);
  }

  /**
   * Get all reviews for a restaurant
   * Endpoint {/reviews/?restaurant_id=<restaurant_id>}
   */
  static ALL_RESTAURANT_REVIEWS_URL(restaurant_id) {
    return (`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${restaurant_id}`);
  }

  /**
   * Get all restaurant reviews
   * Endpoint {/reviews/}
   */
  static get ALL_REVIEWS_URL() {
    return (`${DBHelper.DATABASE_URL}/reviews/`);
  }

  /**
   * Get a restaurant review by id
   * Endpoint {/reviews/<review_id>}
   */
  static REVIEW_URL(review_id) {
    return (`${DBHelper.DATABASE_URL}/reviews/${review_id}`);
  }

  /**
   * Fetch data from URL
   * @returns Promise of response
   */
  static readApi(URL) {
    return fetch(URL)
      .then((response) => {
        console.log("[DBHelper] Fetch JSON Response", response.clone().json());
        return response.json();
      });
  }


  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // Cache then Network Strategy
    // fetch all restaurants with proper error handling.
    Utility.readAll('restaurants')
      .then((restaurants) => {
        restaurants.map(restaurant => {
          Utility.readByKey(restaurant.id, 'restaurant', 'reviews')
            .then((reviews) => {
              restaurant.reviews = reviews;
            });
        });
        callback(null, restaurants);
      })
      .catch((error) => {
        console.warn("[IndexedDB] Error Fetching Restaurant", error);
        DBHelper.readApi(DBHelper.ALL_RESTAURANTS_URL)
          .then((restaurants) => {
            // Fetch all reviews of restaurants
            restaurants.map(restaurant => {
              DBHelper.readApi(DBHelper.ALL_RESTAURANT_REVIEWS_URL(restaurant.id))
                .then((reviews) => {
                  restaurant.reviews = reviews;
                });
            });
            callback(null, restaurants);
          })
          .catch((error) => {
            console.warn("[DBHelper] Error Fetching Restaurant", error);
            callback(error, null);
          });
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    Utility.read(id, 'restaurants')
      .then((restaurant) => {
        console.log('[IDB] idb Restaurant by id...');
        Utility.readByKey(id, 'restaurant', 'reviews')
          .then((reviews) => {
            restaurant.reviews = reviews;
          })
          .finally(() => {
            callback(null, restaurant);
          });
      })
      .catch((error) => { // Restaurant does not exist in API or Cache
        console.warn("[IndexedDB] Error Fetching Restaurant", error);
        DBHelper.readApi(DBHelper.RESTAURANT_URL(id))
          .then((restaurant) => {
            DBHelper.readApi(DBHelper.ALL_RESTAURANT_REVIEWS_URL(restaurant.id))
            .then((reviews) => {
              restaurant.reviews = reviews;
            })
            .finally(() => {
              callback(null, restaurant);
            });;
          })
          .catch((error) => {
            console.warn("[DBHelper] Error Fetching Restaurant", id, error);
            callback('Restaurant does not exist', null);
          });
      });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
    {
      title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
    });
    marker.addTo(map);
    return marker;
  }

  /**
   * Send a POST request to server to create a review record
   * @review {Review object to be sent to server}  
   * @returns Promise whether review has been sent or not
   */
  static postReviewOnline(review) {
    console.log('Post review online...', review);
    const options = {
      method: 'POST',
      body: JSON.stringify(review),
      headers: new Headers({ 'Content-Type': 'application/json' })
    };
    // Sending POST request to server to create a review
    return fetch(DBHelper.ALL_REVIEWS_URL, options)
      .then((response) => {
        console.log('POST NEW REVIEW', response.clone().json());
        return response.json();
      })
      .catch((error) => {
        console.log('FAILED TO POST REVIEW', error);
        return Promise.reject(error);
      });
  }

  /**
   * Posting several reviews posted offline
   * @reviews {Promise of resolved array of promises}  
   */
  static postReviewsOnline(reviews) {
    return reviews.then(reviewArray => { // Array
      if (!reviewArray || reviewArray.length === undefined) return Promise.reject('No offline data.');

      reviewArray.forEach(reviewPromise => { // Promise
        reviewPromise.then(review => { // Value
          return DBHelper.postReviewOnline(review);
        });
      });
    });
  }

  /**
   * Save data on localStorage for to access it when connection restablish
   * @param {Data to be saved locally} data 
   * @returns key of data stored
   */
  static saveOfflineData(data) {
    const strTime = new Date().getTime();
    if (data.length === undefined) {
      localStorage.setItem(strTime, JSON.stringify(data));
    } else {
      data.map(d => localStorage.setItem(strTime, JSON.stringify(d)));
    }
    return strTime;
  }

  static getOfflineData(key) {
    const data = JSON.parse(localStorage.getItem(key));
    if (data) {
      localStorage.removeItem(key);
      return Promise.resolve(data);
    } else {
      return Promise.reject(`${key} is not found in localStorage`);
    }
  }

  /**
   * Gets all data stored in localStorage
   * @returns Promise for each item stored
   */
  static getAllOfflineData() {
    let offlineList = [];
    // Reference https://stackoverflow.com/questions/8419354/get-html5-localstorage-keys
    for (let i = 0, len = localStorage.length; i < len; ++i) {
      offlineList.push(DBHelper.getOfflineData(localStorage.key(i)).then(review => { return review; }));
    }
    return offlineList.length > 0 
      ? Promise.resolve(offlineList) : Promise.reject('localStorage is empty');
  }

  static postReviewWhenOnline(addToUI) {
    DBHelper.postReviewsOnline(
      DBHelper.getAllOfflineData()
      .then(offlineList => {
        // Return array of resolved promises
        return offlineList.map(offPromise => {
          // Return resolved promise when item stored is valid to be sent
          return offPromise.then(offItem => { addToUI(offItem); return offItem; })
                            .catch(error => console.warn(error));
        })
      })
    ).catch(error => console.log(error)); // No offline data, localStorage is empty
  }

  static updateFavoriteStatus(restaurant_id, status) {
    return fetch(DBHelper.UPDATE_FAVORITE_RESTAURANTS_URL(restaurant_id, status), { method: 'PUT', body: restaurant_id })
      .then(() => {
        console.log('FAVORITE HAS BEEN UPDATED!');
      });
  }
}


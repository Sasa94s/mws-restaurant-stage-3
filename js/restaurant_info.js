let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: '<your MAPBOX API KEY HERE>',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      console.log("[Restaurant Info] Restaurant data...", restaurant, error);
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const container = document.getElementById('restaurant-container');
  // Defines a label for each region using attribute value that maybe available as a tooltip on some browsers.
  // https://www.w3.org/TR/wai-aria-practices/examples/landmarks/region.html
  container.title = `Address and Working Hours of ${restaurant.name} Restaurant`;

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `${restaurant.name} Restaurant`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();

}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

createReviewFormHTML = () => {
  const form = document.getElementById('review-form');
  
  // Form Title
  const legend = document.createElement('h3');
  legend.innerHTML = 'Add Review';
  
  // Review Name
  const txtName = document.createElement('input');
  txtName.id = 'review-name';
  txtName.setAttribute('type', 'text');
  txtName.classList.add('field');
  const lblName = document.createElement('label');
  lblName.innerHTML = 'Name';
  lblName.setAttribute('for', 'review-name');
  lblName.classList.add('field');

  // Review Date
  const txtDate = document.createElement('input');
  txtDate.id = 'review-date';
  txtDate.setAttribute('type', 'date');
  txtDate.classList.add('field');
  const lblDate = document.createElement('label');
  lblDate.innerHTML = 'Date';
  lblDate.setAttribute('for', 'review-date');
  lblDate.classList.add('field');

  // Review Rating
  const txtRating = document.createElement('select');
  txtRating.id = 'review-rating';
  for (let i = 1; i <= 5; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.innerHTML = i;
    txtRating.appendChild(option);
  }
  txtRating.classList.add('field');
  const lblRating = document.createElement('label');
  lblRating.innerHTML = 'Rating';
  lblRating.setAttribute('for', 'review-rating');
  lblRating.classList.add('field');

  // Review Comments
  const txtComments = document.createElement('textarea');
  txtComments.id = 'review-comments';
  txtComments.setAttribute('rows', '4');
  txtComments.setAttribute('cols', '20');
  txtComments.classList.add('field');
  const lblComments = document.createElement('label');
  lblComments.innerHTML = 'Comments';
  lblComments.setAttribute('for', 'review-comments');
  lblComments.classList.add('field');

  // Review Submit
  const btnSubmit = document.createElement('button');
  btnSubmit.id = 'submit-review';
  btnSubmit.innerHTML = 'Submit Review';
  btnSubmit.setAttribute('type', 'submit');
  btnSubmit.classList.add('field');
  btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const review = {
      restaurant_id: parseInt(getParameterByName('id')),
      name: txtName.value,
      createdAt: new Date().getTime(),
      rating: parseInt(txtRating.value),
      comments: txtComments.value
    };
    DBHelper.postReviewOnline(review)
      .then((data) => pushReviewsList(data))
      .catch((error) => {
        alert('Review will be available when online');
        DBHelper.saveOfflineData(review);
      });
  });
  
  // localStorage synchornization with Server when connection restablish
  // Passing callback function `pushReviewsList`to add item to UI when sent to server
  self.addEventListener('online', (e) => {
    DBHelper.postReviewWhenOnline(pushReviewsList);
  });

  form.appendChild(legend);
  form.appendChild(lblName);
  form.appendChild(txtName);
  form.appendChild(lblDate);
  form.appendChild(txtDate);
  form.appendChild(lblRating);
  form.appendChild(txtRating);
  form.appendChild(lblComments);
  form.appendChild(txtComments);
  form.appendChild(btnSubmit);

  return form;
}

toggleReview = (event) => {
  const form = createReviewFormHTML();
  event.target.removeEventListener('click', toggleReview);
  event.target.innerHTML = form.classList.contains('hide') ? "Hide Form" : "Show Form";
  form.classList.toggle('hide');
  
  event.target.addEventListener('click', (event) => {
    event.target.innerHTML = form.classList.contains('hide') ? "Hide Form" : "Show Form";
    form.classList.toggle('hide');
  });
}

pushReviewsList = (reviews) => {
  const ul = document.getElementById('reviews-list');
  if (reviews.length === undefined) {
    ul.appendChild(createReviewHTML(reviews));
  } else {
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
  }
  return ul;
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews, restaurant = self.restaurant.name) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  
  const addReviewBtn = document.createElement('button');
  addReviewBtn.innerHTML = 'Add Review';
  addReviewBtn.title = `Add your own review about ${restaurant} Restaurant`;
  addReviewBtn.classList.add('field');
  addReviewBtn.addEventListener('click', toggleReview);
  
  container.appendChild(addReviewBtn);
  container.appendChild(title);
  container.setAttribute('aria-label', `Reviews of ${restaurant} Restaurant`);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = pushReviewsList(reviews);
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = `Date: ${new Date(review.createdAt).toLocaleString("en-US")}`;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;

  // Applied to the last link in the set to indicate that it represents the current page.
  //https://www.w3.org/TR/wai-aria-practices/examples/breadcrumb/index.html
  li.setAttribute('aria-current', 'page');
  
  breadcrumb.appendChild(li);

  // add skip link
  addReviewsSkipLink(breadcrumb);
}

/**
 * Add skip link to reviews list
 */
addReviewsSkipLink = (nav) => {
  const skipLinkItem = document.createElement('li');
  const skipLink = document.createElement('a');
  skipLink.href = "#reviews-container";
  skipLink.id = "skip-link";
  skipLink.innerHTML = "Skip to Reviews";
  skipLinkItem.append(skipLink);

  nav.append(skipLinkItem);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

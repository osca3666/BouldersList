document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded event fired');
  
  // Rating mechanism
  const ratingContainer = document.querySelector('#rating');
  if (ratingContainer) {
    ratingContainer.addEventListener('click', function (e) {
      if (e.target.nodeName === 'SPAN') {
        var currentSibling = e.target;
        var nextSibling = e.target;
        var rating = 1;
        currentSibling.classList.add('active');
  
        while ((currentSibling = currentSibling.previousElementSibling)) {
          currentSibling.classList.add('active');
          rating++;
        }
        while ((nextSibling = nextSibling.nextElementSibling)) {
          nextSibling.classList.remove('active');
        }
  
        const ratingValue = document.getElementById('ratingValue');
        if (ratingValue) {
          ratingValue.value = rating;
        }
      }
    });
  }

  // Character count for review textarea
  const reviewTextarea = document.getElementById('data');
  if (reviewTextarea) {
    reviewTextarea.addEventListener('keyup', function() {
      countChars(this);
    });
  }

  // Sort select event listener
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      sortCards(this.value);
    });
  }

  // Card click event listeners
  const cards = document.querySelectorAll('div.card.h-100');
  cards.forEach(card => {
    card.addEventListener('click', function() {
      const businessId = this.getAttribute('data-id');
      this.classList.add('enlarged-card');
      setTimeout(() => {
        window.location.href = `/business-profile/${businessId}`;
      }, 200);
    });
  });
});

// These functions can be outside of the DOMContentLoaded since they are not manipulating DOM elements directly
function countChars(obj){
  var maxLength = 200;
  var strLength = obj.value.length;
  var charRemain = (maxLength - strLength);
  
  if(charRemain < 0){
    document.getElementById("charNum").innerHTML = '<span style="color: red;">You have exceeded the limit of '+maxLength+' characters</span>';
  } else {
    document.getElementById("charNum").innerHTML = charRemain+' characters remaining';
  }
}

function sortCards(sortType) {
  if (sortType === "") {
    // Do not sort if the default option is selected
    return;
  }
  const cardsContainer = document.querySelector('.row.row-cols-1.row-cols-md-2.g-4');
  let cards = document.querySelectorAll('.col');

  cards = Array.from(cards).sort((a, b) => {
    const ratingA = parseFloat(a.querySelector('.average-rating').textContent);
    const ratingB = parseFloat(b.querySelector('.average-rating').textContent);
    return sortType === 'ratingDesc' ? ratingB - ratingA : ratingA - ratingB;
  });

  cards.forEach(card => cardsContainer.appendChild(card));
}

$(document).ready(function() {
  if (window.location.pathname === '/discover') {
    updateRatingsForBusinesses().then(() => {
      // Optionally, you can trigger sorting right after ratings are updated.
      // sortCards('ratingDesc'); // Uncomment if auto-sorting is desired after loading.
    });
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      sortCards(this.value);
    });
  }
});


function getRatingFromCard(cardElement) {
  const ratingText = cardElement.querySelector('.card-text').textContent;
  const ratingMatch = ratingText.match(/Rating: ([\d.]+)/);
  return ratingMatch ? parseFloat(ratingMatch[1]) : 0;
}

function updateBusinessType() {
  const selectedType = document.getElementById('businessType').value;

  // Update the URL
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('businessType', selectedType === 'all' ? '' : selectedType);
  window.location.href = currentUrl.toString();
}

function updateRatingsForBusinesses() {
  let promises = [];
  $('.card').each(function() {
    const card = $(this);
    const businessId = card.data('id');

    let request = $.get('/api/get-ratings', { business_id: businessId }, function(response) {
      // Debugging: Log the response
      console.log('Response for business ID ' + businessId + ':', response);

      // Check if response contains the averageRating property
      if (response && response.hasOwnProperty('averageRating')) {
        let averageRating = parseFloat(response.averageRating);
        if (!isNaN(averageRating)) {
          card.find('.average-rating').text(averageRating.toFixed(1) + ' / 5');
        } else {
          card.find('.average-rating').text('Rating unavailable');
        }
      } else {
        console.error('Average rating not found in response for business ID ' + businessId);
        card.find('.average-rating').text('Rating unavailable');
      }
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.error('Failed to fetch rating for business ID ' + businessId + ':', textStatus, errorThrown);
      card.find('.average-rating').text('Rating unavailable');
    });
    promises.push(request);
  });
  return Promise.all(promises);
}

// $(document).ready(function() {
//   if (window.location.pathname === '/discover') {
//     updateRatingsForBusinesses();
//   }
// });



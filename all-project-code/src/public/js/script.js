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
  const cards = document.querySelectorAll('div.card');
  cards.forEach(card => {
    card.addEventListener('click', function() {
      const businessId = this.getAttribute('data-id');
      window.location.href = `/business-profile/${businessId}`;
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
  const cardsContainer = document.querySelector('.row.row-cols-1.row-cols-md-2.g-4');
  let cards = document.querySelectorAll('.col');

  cards = Array.from(cards).sort((a, b) => {
    const ratingA = getRatingFromCard(a);
    const ratingB = getRatingFromCard(b);
    return sortType === 'ratingDesc' ? ratingB - ratingA : ratingA - ratingB;
  });

  cards.forEach(card => cardsContainer.appendChild(card));
}

function getRatingFromCard(cardElement) {
  const ratingText = cardElement.querySelector('.card-text').textContent;
  const ratingMatch = ratingText.match(/Rating: ([\d.]+)/);
  return ratingMatch ? parseFloat(ratingMatch[1]) : 0;
}

function updateBusinessType() {
  // Get the selected business type from the dropdown
  const selectedType = document.getElementById('businessType').value;

  // Update the URL
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('businessType', selectedType === 'all' ? '' : selectedType);
  window.location.href = currentUrl.toString();

  // Update the dropdown menu to reflect the selected business type
  const dropdown = document.getElementById('businessType');

  // Set the selected option in the dropdown
  const options = dropdown.options;
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === selectedType) {
      dropdown.selectedIndex = i;
      break;
    }
  }
}


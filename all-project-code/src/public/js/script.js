document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded event fired');
  // Add event listeners to all cards
  const cards = document.querySelectorAll('div.card.h-100');
  cards.forEach(card => {
    card.addEventListener('click', function() {
      // Use the data-id attribute to fetch more details or navigate
      const businessId = this.getAttribute('data-id');
      // Redirect to the business detail page, or use AJAX to fetch details
      window.location.href = `/business-profile/${businessId}`;
    });
  });
});

document.getElementById('dropdownToggle').addEventListener('click', function () {
    var dropdown = new bootstrap.Dropdown(document.getElementById('userDropdown'));
  });

document.querySelector('#rating').addEventListener('click', function (e) {
    if (e.target.nodeName === 'SPAN') {
        var currentSibling = e.target;
        var nextSibling = e.target;
        currentSibling.classList.add('active');
        while ((currentSibling = currentSibling.previousElementSibling)) {
            currentSibling.classList.add('active');
        }
        while ((nextSibling = nextSibling.nextElementSibling)) {
            nextSibling.classList.remove('active');
        }
    }
});

function countChars(obj){
  var maxLength = 200;
  var strLength = obj.value.length;
  var charRemain = (maxLength - strLength);
  
  if(charRemain < 0){
      document.getElementById("charNum").innerHTML = '<span style="color: red;">You have exceeded the limit of '+maxLength+' characters</span>';
  }else{
      document.getElementById("charNum").innerHTML = charRemain+' characters remaining';
  }
}

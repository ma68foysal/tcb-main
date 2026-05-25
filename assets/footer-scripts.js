// Footer scripts for The Conscious Bar
let sliderInitialized = false;
let sliderAdvanced = false;

function initializeAndAdvanceSlider() {
  const $slider = $('.top-products-slider');

  if (!sliderInitialized) {
    $slider.slick({
      slidesToShow: 2,
      arrows: true,
      dots: false,
      infinite: false,
      prevArrow:
        '<button type="button" class="slick-prev cus_arrow"><svg width="24" height="24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6"/></svg></button>',
      nextArrow:
        '<button type="button" class="slick-next cus_arrow"><svg width="24" height="24" fill="none" stroke="currentColor"><path d="M9 6l6 6-6 6"/></svg></button>',
      responsive: [{ breakpoint: 1150, settings: { slidesToShow: 1 } }],
    });

    sliderInitialized = true;
  }

  if (!sliderAdvanced) {
    setTimeout(() => {
      $slider.slick('setPosition');
      $slider.slick('slickNext');
      $('.navigation-promo__wrapper').css('opacity', '1');
      sliderAdvanced = true;
    }, 200);
  }
}

// Only trigger once when user clicks on .first_level_menu
$(document).on('click', '.first_level_menu, #header-sidebar-menu .text-with-icon', function () {
  initializeAndAdvanceSlider();
});

window.onload = function () {
  const productElements = document.querySelectorAll('#product-data-container .all_product-data');
  const inventoryData = {};

  productElements.forEach(function (el) {
    const productId = el.getAttribute('data-product-item-id');
    const inventoryQty = el.getAttribute('data-inventory-quantity');

    if (productId && inventoryQty !== null) {
      inventoryData[productId] = parseInt(inventoryQty, 10);
    }
  });

  // Store the entire object under one key
  localStorage.setItem('inventory_quantities', JSON.stringify(inventoryData));
};

// Open cart drawer automatically from checkout page
document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const openCart = urlParams.get('open_cart');

  if (openCart === 'true') {
    // Adjust this based on your theme's cart drawer trigger
    const cartTrigger = document.querySelector('[aria-controls="cart-drawer"]');

    if (cartTrigger) {
      cartTrigger.click();
    } else {
      console.warn('Cart drawer trigger not found.');
    }
  }
});

//# sourceMappingURL=footer-scripts.js.map
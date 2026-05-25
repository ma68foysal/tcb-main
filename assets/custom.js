window.theme = window.theme || {};

theme.initWhenVisible = function(options) {
  const threshold = options.threshold ? options.threshold : 0;

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (typeof options.callback === 'function') {
          options.callback();
          observer.unobserve(entry.target);
        }
      }
    });
  }, {rootMargin: `0px 0px ${threshold}px 0px`});

  observer.observe(options.element);
};

class ScrollingPromotion extends HTMLElement {
  constructor() {
    super();

    this.config = {
      moveTime: parseFloat(this.dataset.speed), // 100px going to move for
      space: 100, // 100px
    };

    this.promotion = this.querySelector('.promotion');

    theme.initWhenVisible({
      element: this,
      callback: this.init.bind(this),
      threshold: 600
    });
  }

  init() {
    if (this.childElementCount === 1) {
      this.promotion.classList.add('promotion--animated');

      for (let index = 0; index < 10; index++) {
        this.clone = this.promotion.cloneNode(true);
        this.clone.setAttribute('aria-hidden', true);
        this.appendChild(this.clone);

        const imageWrapper = this.clone.querySelector('.media-wrapper');
        if (imageWrapper) {
          imageWrapper.classList.remove('loading');
        }
      }

      const animationTimeFrame = (this.promotion.clientWidth / this.config.space) * this.config.moveTime;
      this.style.setProperty('--duration', `${animationTimeFrame}s`);

      // pause when out of view
      const observer = new IntersectionObserver((entries, _observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.scrollingPlay();
          } else {
            this.scrollingPause();
          }
        });
      }, {rootMargin: '0px 0px 50px 0px'});

      observer.observe(this);
    }
  }

  scrollingPlay() {
    console.log('play');
    // this.classList.remove('scrolling-promotion--paused');
  }

  scrollingPause() {
    console.log('paused');
    // this.classList.add('scrolling-promotion--paused');
  }
}
customElements.define('scrolling-promotion', ScrollingPromotion);

// PRODUCT CARD VIDEO ON HOVER
class CardVideo extends HTMLElement {
  constructor() {
    super();
    
    this.addEventListener("mouseover", this.mouseIn.bind(this));
    this.addEventListener("mouseleave", this.mouseLeave.bind(this));
    this.addEventListener("touchstart", this.mouseIn.bind(this));
    this.addEventListener("touchend", this.mouseLeave.bind(this));
  }

  mouseIn(){
    this.videos = this.querySelector('.product-card__figure').querySelectorAll("video");
    if(this.videos.length) {
      this.firstVideo = this.videos[0];
      this.secondVideo = this.videos[1];
      this.classList.add('hovered', 'mousein');
      this.classList.remove('mouseleave');   
      this.loadVideo(this.firstVideo); 
      this.resetVideo(this.secondVideo);
    }
  }
  
  mouseLeave(){
    if(this.videos.length) {
      this.classList.remove('mousein');
      this.classList.add('mouseleave');   
      this.loadVideo(this.secondVideo);   
      this.resetVideo(this.firstVideo);
    }
  }

  loadVideo(video) {
    if (!video) return;

    const promise = video.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          // Autoplay started
        })
        .catch((error) => {
          // Autoplay was prevented.
          video.muted = true;
          video.play();
        });
    }
  }

  resetVideo(video) {
    if (!video) return;

    const promise = video.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          // Autoplay started
          video.currentTime = 0;
        })
        .catch((error) => {
          // Autoplay was prevented.
          video.muted = true;
          video.play();
        });
    }
  }  
}

customElements.define("card-video", CardVideo);


// DISCOUNT ON QUANTITY
class DiscountQty extends HTMLElement {
  constructor() {
    super();

    this.buttons = this.querySelectorAll('.discount_button');
    this.qtyInput = this.querySelector('[name="quantity"]');

    this.quantitySelectorInput = document.querySelector('quantity-selector .quantity-selector__input');

    this.buttons.forEach(btn => {
      btn.addEventListener("click", this.init.bind(this));
    })
  }

  init(event) {
    this.buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    // this.qtyInput.value = event.target.dataset.value;
    const newValue = event.target.dataset.value;

    this.qtyInput.value = newValue;
    if (this.quantitySelectorInput) {
      this.quantitySelectorInput.value = newValue;

      this.quantitySelectorInput.dispatchEvent(new Event('change', { bubbles: true }));
      this.quantitySelectorInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

customElements.define("discount-qty", DiscountQty);


// UPDATE SUBSCRIPTION PRICE
class UpdateSubscriptionPrice extends HTMLElement {
  constructor() {
    super();    

    this.blocks = this.querySelectorAll('[data-block-type="@app"]');
    this.blocks.forEach(block => {
      block.addEventListener("click", this.init.bind(this));
    })
  }

  init() {
    setTimeout(() => {
      this.sellingPlanId = this.querySelector('input[name="selling_plan"]').value;
      
      if(this.sellingPlanId == '') {
        this.sellingPrice = document.querySelector(`#selling_plan_app_container #label_one_time_purchase input`).getAttribute('data-variant-price');
      } else {
        this.sellingPrice = document.querySelector(`#selling_plan_app_container input[data-selling-plan-id="${this.sellingPlanId}"]`).getAttribute('data-variant-price');
      }
      
      this.calcPrice(this.sellingPrice);
    }, 400)    
  }

  calcPrice(price){
    document.querySelectorAll('discount-qty .discount_button').forEach((btn, index) => {
      if(index !== 0) {
        const getPercentage = parseFloat(btn.getAttribute('data-percentage')) / 100;
        const calcItemPrice = (price - (price * getPercentage)).toFixed(2);
        btn.querySelector('span').innerHTML = `$${calcItemPrice} each`; 
      }
    })
  }
}

customElements.define("update-subsprice", UpdateSubscriptionPrice);

// PRODUCT LIST DROPDOWN
class ProductlistDropdown extends HTMLElement {
  constructor() {
    super();    

    this.button = this.querySelector('.button_product_list');
    this.items = this.querySelectorAll('.product_item_label');

    this.button.addEventListener("click", this.toggleDropdown.bind(this));   
    this.items.forEach(item => {
      item.addEventListener("click", this.toggleDropdown.bind(this));
    });
      
    document.body.addEventListener("click", this.close.bind(this));
  }

  toggleDropdown() {
    this.classList.toggle('open');
  }
  
  close(event) {
    if(event.target.matches('.button_product_list') || event.target.matches('.product_item_label')) return;
    this.classList.remove('open');
  }
}

customElements.define("productlist-dropdown", ProductlistDropdown);

// SCROLLING IMAGE
class MarqueeImage extends HTMLElement {
  constructor() {
    super();

    this.config = {
      moveTime: 1,
      space: 100,
    };

    this.promotion = this.querySelector('.promotion');
    this.promotionWrap = this.querySelector('.promotion_wrap');
    this.init();
  }

  init() {
    if (this.promotionWrap.childElementCount === 1) {
      for (let index = 0; index < 10; index++) {
        this.clone = this.promotion.cloneNode(true);
        this.clone.setAttribute('aria-hidden', true);
        this.promotionWrap.appendChild(this.clone);
      }

      const animationTimeFrame = (this.promotion.clientWidth / this.config.space) * this.config.moveTime;
      this.style.setProperty('--duration', `${animationTimeFrame}s`);
    }
  }
}

customElements.define('marquee-image', MarqueeImage);


//limited addition product
// $(document).ready(function () {
//   const LIMITED_VARIANT_ID = '44402510987455';
//   let maxQtyLeft = 10;

//   const $qtyInput = $('input[name="quantity"]');
//   const $variantInput = $('input[name="id"]');
//   const $plusBtn = $('button[data-action="plus"]');
//   const $minusBtn = $('button[data-action="minus"]');
//   const $addToCartBtn = $('.cus_atc [data-product-id="44402510987455"]');
//   const checkoutBtnSelector = '#cart-drawer [value="Checkout"]';

//   // Apply class if LimitOver exists
//   if (localStorage.getItem('LimitOver') === 'true') {
//     $('body').addClass('purchased10');
//     $addToCartBtn.prop('disabled', true);
//   }

//   if (localStorage.getItem('Added10') === 'true') {
//     $('body').addClass('added10');
//     $addToCartBtn.prop('disabled', true);
//   }

//   // Fetch current cart and update remaining limit
//   function fetchCartAndUpdateLimit(callback) {
//     fetch('/cart.js')
//       .then(res => res.json())
//       .then(cart => {
//         let inCart = 0;
//         cart.items.forEach(item => {
//           if (item.variant_id == LIMITED_VARIANT_ID) {
//             inCart += item.quantity;
//           }
//         });

//         maxQtyLeft = 10 - inCart;
//         if (maxQtyLeft < 0) maxQtyLeft = 0;

//         console.log('[Limit] Raspberry Puff already in cart:', inCart);
//         console.log('[Limit] Max qty user can add now:', maxQtyLeft);

//         callback && callback(inCart);
//       });
//   }

//   // Product Page Quantity Enforcement
//   function setupProductLimitEnforcement() {
//     if ($qtyInput.length > 0 && $variantInput.length > 0) {
//       function enforceLimit() {
//         const currentQty = parseInt($qtyInput.val()) || 1;
//         const variantId = $variantInput.val();

//         if (variantId === LIMITED_VARIANT_ID && currentQty > maxQtyLeft) {
//           $qtyInput.val(maxQtyLeft > 0 ? maxQtyLeft : 1);
//           $('#pp_alert').text(`You can only purchase ${maxQtyLeft} more unit(s) of Raspberry Puff.`);
//         } else {
//           $('#pp_alert').text('');
//         }
//       }

//       $plusBtn.on('click', () => setTimeout(enforceLimit, 50));
//       $minusBtn.on('click', () => setTimeout(() => {
//         const val = parseInt($qtyInput.val()) || 1;
//         if (val < 1) $qtyInput.val(1);
//       }, 50));
//       $qtyInput.on('input', enforceLimit);
//     }
//   }

//   // Cart Drawer Limit Check
//   function checkCartLimit() {
//     fetchCartAndUpdateLimit((inCart) => {
//       if (inCart >= 10) {
//         $('body').addClass('added10');
//         localStorage.setItem('Added10', 'true');
//         $addToCartBtn.prop('disabled', true);
//       } else {
//         $('body').removeClass('added10');
//         localStorage.setItem('Added10', 'false');
//         $addToCartBtn.prop('disabled', false);
//       }
//     });
//   }

//   fetchCartAndUpdateLimit(() => {
//     setupProductLimitEnforcement();
//     checkCartLimit();
//   });

//   $(document).on('click', 'button, a', () => setTimeout(checkCartLimit, 700));
//   $(document).on('input change', 'input.quantity-input', () => setTimeout(checkCartLimit, 700));

//   // Checkout Button Intercept
//   let isCheckingOut = false;

//   $(document).on('click', checkoutBtnSelector, function (e) {
//     if (isCheckingOut) return;

//     e.preventDefault();
//     const button = this;
//     isCheckingOut = true;

//     setTimeout(() => {
//       fetch('/cart.js')
//         .then(res => res.json())
//         .then(cart => {
//           let totalQty = 0;
//           cart.items.forEach(item => {
//             if (item.variant_id == LIMITED_VARIANT_ID) {
//               totalQty += item.quantity;
//             }
//           });

//           if (totalQty >= 10) {
//             localStorage.setItem('LimitOver', 'true');
//             $('body').addClass('added10');
//             console.log('[Cart] LimitOver set in localStorage');
//           } else {
//             localStorage.removeItem('LimitOver');
//             $('body').removeClass('added10');
//           }

//           button.click();
//         })
//         .catch(() => {
//           button.click();
//         })
//         .finally(() => {
//           isCheckingOut = false;
//         });
//     }, 300);
//   });

//   // Cart Drawer Quantity Input Limit (hard limit)
//   $(document).on('input change', 'input.quantity-input', function () {
//     const $input = $(this);
//     const currentVal = parseInt($input.val()) || 1;
//     const lineKey = $input.data('line-key') || '';

//     if (lineKey.startsWith(LIMITED_VARIANT_ID + ':')) {
//       if (currentVal > 10) {
//         $input.val(10);
//         alert('You can only purchase a maximum of 10 units of Raspberry Puff.');
//       } else if (currentVal < 1) {
//         $input.val(1);
//       }
//     }
//   });
// });

// Accessibility fix for third-party chat iframe
(function() {
  function addIframeTitles() {
    const chatIframe = document.getElementById('notch-chat-widget-frame');
    if (chatIframe && !chatIframe.hasAttribute('title')) {
      chatIframe.setAttribute('title', 'Chat Widget');
      chatIframe.setAttribute('aria-label', 'Customer Support Chat');
    }
  }

  // Try immediately
  addIframeTitles();
  
  // Also try after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addIframeTitles);
  }
  
  // And use a MutationObserver to catch dynamically added iframes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && (node.tagName === 'IFRAME' || node.querySelector('iframe'))) {
            addIframeTitles();
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Stop observing after 10 seconds to avoid memory leaks
  setTimeout(() => observer.disconnect(), 10000);
})();

//# sourceMappingURL=custom.js.map



// hide build a box long text from cart drawer
document.querySelectorAll('.badge').forEach(item => {

  // Find the TEXT NODE (ignore SVG)
  let textNode = Array.from(item.childNodes).find(n => n.nodeType === 3);

  if (!textNode) return;

  let fullText = textNode.nodeValue.trim();

  // Get the discount part like "(-$15.00)"
  let discountMatch = fullText.match(/\(-.*?\)/);
  let discount = discountMatch ? discountMatch[0] : "";

  // Remove the discount part from main text
  let mainOnly = fullText.replace(discount, "").trim();

  // Split by underscore
  let parts = mainOnly.split("_");

  // Keep only first 3 parts: BUILD_A_BOX_DISCOUNT
  let mainText = parts.slice(0, 3).join("_");

  // Final text
  let finalText = `${mainText} ${discount}`;

  // Replace only the text node (keeps SVG)
  textNode.nodeValue = " " + finalText;
});
// hide build a box long text from cart drawer

// (function() {
//   const selectors = [
//     "#root > div > div > div > div > div > div > div:nth-child(2) > div > div.false.as-pb-20 > div > div.as-fixed.as-bottom-0.as-left-0.as-right-0.as-z-50.as-bg-white.as-shadow-lg.as-px-4.as-py-2 > div > div > div.as-flex-1.as-mr-5.as-h-fit.as-progress-bar-content > div.as-relative.as-h-2.as-w-full.as-bg-gray-200.as-rounded-full.as-mt-4 > div:nth-child(2) > div.as-absolute.as-left-1\\/2.as-transform.-as-translate-x-1\\/2.as-bottom-full.as-mb-2.as-text-\\[11px\\].as-font-semibold.as-whitespace-nowrap.as-text-gray-600",
//     "#root > div > div > div > div > div > div > div:nth-child(2) > div > div.false.as-pb-20 > div > div.as-fixed.as-bottom-0.as-left-0.as-right-0.as-z-50.as-bg-white.as-shadow-lg.as-px-4.as-py-2 > div > div > div.as-flex-1.as-mr-5.as-h-fit.as-progress-bar-content > div.as-relative.as-h-2.as-w-full.as-bg-gray-200.as-rounded-full.as-mt-4 > div:nth-child(3) > div.as-absolute.as-left-1\\/2.as-transform.-as-translate-x-1\\/2.as-bottom-full.as-mb-2.as-text-\\[11px\\].as-font-semibold.as-whitespace-nowrap.as-text-gray-600",
//     "#root > div > div > div > div > div > div > div:nth-child(2) > div > div.false.as-pb-20 > div > div.as-fixed.as-bottom-0.as-left-0.as-right-0.as-z-50.as-bg-white.as-shadow-lg.as-px-4.as-py-2 > div > div > div.as-flex-1.as-mr-5.as-h-fit.as-progress-bar-content > div.as-relative.as-h-2.as-w-full.as-bg-gray-200.as-rounded-full.as-mt-4 > div:nth-child(4) > div.as-absolute.as-left-1\\/2.as-transform.-as-translate-x-1\\/2.as-bottom-full.as-mb-2.as-text-\\[11px\\].as-font-semibold.as-whitespace-nowrap.as-text-gray-600"
//   ];

//   const values = ['5%', '15%', '20%'];

//   function forceUpdate() {
//     selectors.forEach((sel, i) => {
//       const el = document.querySelector(sel);
//       if (el && el.textContent !== values[i]) {
//         el.textContent = values[i];
//       }
//     });
//   }

//   function init() {
//     forceUpdate();

//     // Watch for any DOM changes and re-apply
//     const observer = new MutationObserver(forceUpdate);
//     observer.observe(document.body, { childList: true, subtree: true, characterData: true });
//   }

//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', init);
//   } else {
//     init();
//   }
// })();
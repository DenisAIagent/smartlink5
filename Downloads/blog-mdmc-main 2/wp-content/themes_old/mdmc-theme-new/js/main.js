/**
 * Main JavaScript file for MDMC Music Ads Blog Theme
 */

(function($) {
  'use strict';

  // Variables
  var $window = $(window),
      $document = $(document),
      $body = $('body'),
      $siteHeader = $('.site-header'),
      $menuToggle = $('.menu-toggle'),
      $mainNavigation = $('.main-navigation'),
      $languageToggle = $('.language-toggle'),
      $languageDropdown = $('.language-dropdown');

  // Initialize
  function init() {
    bindEvents();
    initLanguageSwitcher();
    initStickyHeader();
    initLazyLoading();
    initScrollAnimations();
  }

  // Bind events
  function bindEvents() {
    $menuToggle.on('click', toggleMobileMenu);
    $languageToggle.on('click', toggleLanguageDropdown);
    $document.on('click', closeLanguageDropdown);
  }

  // Toggle mobile menu
  function toggleMobileMenu() {
    $menuToggle.attr('aria-expanded', function(i, attr) {
      return attr === 'true' ? 'false' : 'true';
    });
    $mainNavigation.toggleClass('toggled');
  }

  // Initialize language switcher
  function initLanguageSwitcher() {
    // Set current language based on HTML lang attribute or browser language
    var currentLang = $('html').attr('lang') || navigator.language.substring(0, 2);
    $('.language-dropdown a[data-lang="' + currentLang + '"]').addClass('active');
    
    // Handle language selection
    $('.language-dropdown a').on('click', function(e) {
      e.preventDefault();
      var lang = $(this).data('lang');
      
      // Send AJAX request to set language cookie
      $.ajax({
        url: mdmcData.ajax_url,
        type: 'POST',
        data: {
          action: 'mdmc_set_language',
          lang: lang
        },
        success: function(response) {
          if (response === 'success') {
            location.reload();
          }
        }
      });
    });
  }

  // Toggle language dropdown
  function toggleLanguageDropdown(e) {
    e.stopPropagation();
    $languageDropdown.toggleClass('active');
  }

  // Close language dropdown when clicking outside
  function closeLanguageDropdown(e) {
    if (!$(e.target).closest('.language-selector').length) {
      $languageDropdown.removeClass('active');
    }
  }

  // Initialize sticky header
  function initStickyHeader() {
    var headerHeight = $siteHeader.outerHeight(),
        scrollTop = $window.scrollTop(),
        isSticky = false;
    
    function checkSticky() {
      scrollTop = $window.scrollTop();
      
      if (scrollTop > headerHeight && !isSticky) {
        $siteHeader.addClass('is-sticky');
        $body.css('padding-top', headerHeight);
        isSticky = true;
      } else if (scrollTop <= headerHeight && isSticky) {
        $siteHeader.removeClass('is-sticky');
        $body.css('padding-top', 0);
        isSticky = false;
      }
    }
    
    $window.on('scroll', checkSticky);
    checkSticky();
  }

  // Initialize lazy loading for images
  function initLazyLoading() {
    var lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));
    
    if ('IntersectionObserver' in window) {
      var lazyImageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var lazyImage = entry.target;
            lazyImage.src = lazyImage.dataset.src;
            if (lazyImage.dataset.srcset) {
              lazyImage.srcset = lazyImage.dataset.srcset;
            }
            lazyImage.classList.remove('lazy');
            lazyImageObserver.unobserve(lazyImage);
          }
        });
      });
      
      lazyImages.forEach(function(lazyImage) {
        lazyImageObserver.observe(lazyImage);
      });
    } else {
      // Fallback for browsers without IntersectionObserver support
      var active = false;
      
      function lazyLoad() {
        if (active === false) {
          active = true;
          
          setTimeout(function() {
            lazyImages.forEach(function(lazyImage) {
              if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== 'none') {
                lazyImage.src = lazyImage.dataset.src;
                if (lazyImage.dataset.srcset) {
                  lazyImage.srcset = lazyImage.dataset.srcset;
                }
                lazyImage.classList.remove('lazy');
                
                lazyImages = lazyImages.filter(function(image) {
                  return image !== lazyImage;
                });
                
                if (lazyImages.length === 0) {
                  document.removeEventListener('scroll', lazyLoad);
                  window.removeEventListener('resize', lazyLoad);
                  window.removeEventListener('orientationchange', lazyLoad);
                }
              }
            });
            
            active = false;
          }, 200);
        }
      }
      
      document.addEventListener('scroll', lazyLoad);
      window.addEventListener('resize', lazyLoad);
      window.addEventListener('orientationchange', lazyLoad);
      lazyLoad();
    }
  }

  // Initialize scroll animations
  function initScrollAnimations() {
    var animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
      var animationObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            animationObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      animatedElements.forEach(function(element) {
        animationObserver.observe(element);
      });
    } else {
      // Fallback for browsers without IntersectionObserver support
      animatedElements.forEach(function(element) {
        element.classList.add('animated');
      });
    }
  }

  // Initialize when DOM is ready
  $(document).ready(init);

})(jQuery);

<?php
/**
 * MDMC Music Ads functions and definitions
 *
 * @package MDMC_Theme
 */

if ( ! defined( 'MDMC_VERSION' ) ) {
	// Replace the version number of the theme on each release.
	define( 'MDMC_VERSION', '1.0.0' );
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
function mdmc_setup() {
	/*
	 * Make theme available for translation.
	 * Translations can be filed in the /languages/ directory.
	 */
	load_theme_textdomain( 'mdmc-theme', get_template_directory() . '/languages' );

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	/*
	 * Let WordPress manage the document title.
	 * By adding theme support, we declare that this theme does not use a
	 * hard-coded <title> tag in the document head, and expect WordPress to
	 * provide it for us.
	 */
	add_theme_support( 'title-tag' );

	/*
	 * Enable support for Post Thumbnails on posts and pages.
	 *
	 * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
	 */
	add_theme_support( 'post-thumbnails' );

	// This theme uses wp_nav_menu() in one location.
	register_nav_menus(
		array(
			'menu-1' => esc_html__( 'Primary', 'mdmc-theme' ),
			'footer-menu' => esc_html__( 'Footer Menu', 'mdmc-theme' ),
		)
	);

	/*
	 * Switch default core markup for search form, comment form, and comments
	 * to output valid HTML5.
	 */
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);

	// Set up the WordPress core custom background feature.
	add_theme_support(
		'custom-background',
		apply_filters(
			'mdmc_custom_background_args',
			array(
				'default-color' => '0A0A0A',
				'default-image' => '',
			)
		)
	);

	// Add theme support for selective refresh for widgets.
	add_theme_support( 'customize-selective-refresh-widgets' );

	/**
	 * Add support for core custom logo.
	 *
	 * @link https://codex.wordpress.org/Theme_Logo
	 */
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 60,
			'width'       => 200,
			'flex-width'  => true,
			'flex-height' => true,
		)
	);
}
add_action( 'after_setup_theme', 'mdmc_setup' );

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *
 * @global int $content_width
 */
function mdmc_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'mdmc_content_width', 1200 );
}
add_action( 'after_setup_theme', 'mdmc_content_width', 0 );

/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */
function mdmc_widgets_init() {
	register_sidebar(
		array(
			'name'          => esc_html__( 'Sidebar', 'mdmc-theme' ),
			'id'            => 'sidebar-1',
			'description'   => esc_html__( 'Add widgets here.', 'mdmc-theme' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
	
	register_sidebar(
		array(
			'name'          => esc_html__( 'Footer 1', 'mdmc-theme' ),
			'id'            => 'footer-1',
			'description'   => esc_html__( 'Add widgets here.', 'mdmc-theme' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
	
	register_sidebar(
		array(
			'name'          => esc_html__( 'Footer 2', 'mdmc-theme' ),
			'id'            => 'footer-2',
			'description'   => esc_html__( 'Add widgets here.', 'mdmc-theme' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
	
	register_sidebar(
		array(
			'name'          => esc_html__( 'Footer 3', 'mdmc-theme' ),
			'id'            => 'footer-3',
			'description'   => esc_html__( 'Add widgets here.', 'mdmc-theme' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'mdmc_widgets_init' );

/**
 * Enqueue scripts and styles.
 */
function mdmc_scripts() {
        wp_enqueue_style( 'mdmc-google-fonts', 'https://fonts.googleapis.com/css2?family=Kadwa:wght@400;700&family=Roboto:wght@400;700&family=Montserrat:wght@400;700&display=swap', array(), null );
        wp_enqueue_style( 'mdmc-style', get_stylesheet_uri(), array( 'mdmc-google-fonts' ), MDMC_VERSION );
	wp_style_add_data( 'mdmc-style', 'rtl', 'replace' );

	wp_enqueue_script( 'mdmc-navigation', get_template_directory_uri() . '/js/navigation.js', array(), MDMC_VERSION, true );
	
	// Add custom JavaScript for language switching and other functionality
	wp_enqueue_script( 'mdmc-main', get_template_directory_uri() . '/js/main.js', array('jquery'), MDMC_VERSION, true );
	
	// Localize the script with language data
	$language_data = array(
		'current_lang' => mdmc_get_current_language(),
		'ajax_url' => admin_url( 'admin-ajax.php' ),
	);
	wp_localize_script( 'mdmc-main', 'mdmcData', $language_data );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'mdmc_scripts' );

/**
 * Add language cookie when language is switched
 */
function mdmc_set_language() {
	if ( isset( $_POST['lang'] ) ) {
		$lang = sanitize_text_field( $_POST['lang'] );
		if ( in_array( $lang, array( 'fr', 'en', 'es', 'pt' ) ) ) {
			setcookie( 'mdmc_language', $lang, time() + ( 86400 * 30 ), '/' ); // 30 days
			echo 'success';
		}
	}
	wp_die();
}
add_action( 'wp_ajax_mdmc_set_language', 'mdmc_set_language' );
add_action( 'wp_ajax_nopriv_mdmc_set_language', 'mdmc_set_language' );

/**
 * Add structured data for SEO
 */
function mdmc_add_structured_data() {
	if ( is_single() ) {
		$schema = array(
			'@context' => 'https://schema.org',
			'@type' => 'Article',
			'headline' => get_the_title(),
			'datePublished' => get_the_date( 'c' ),
			'dateModified' => get_the_modified_date( 'c' ),
			'author' => array(
				'@type' => 'Person',
				'name' => get_the_author()
			),
			'publisher' => array(
				'@type' => 'Organization',
				'name' => get_bloginfo( 'name' ),
				'logo' => array(
					'@type' => 'ImageObject',
					'url' => get_custom_logo_url()
				)
			),
			'description' => get_the_excerpt(),
			'mainEntityOfPage' => array(
				'@type' => 'WebPage',
				'@id' => get_permalink()
			)
		);
		
		if ( has_post_thumbnail() ) {
			$schema['image'] = array(
				'@type' => 'ImageObject',
				'url' => get_the_post_thumbnail_url( null, 'full' ),
				'width' => 1200,
				'height' => 630
			);
		}
		
		echo '<script type="application/ld+json">' . wp_json_encode( $schema ) . '</script>' . "\n";
	} elseif ( is_page() ) {
		$schema = array(
			'@context' => 'https://schema.org',
			'@type' => 'WebPage',
			'name' => get_the_title(),
			'description' => get_the_excerpt(),
			'publisher' => array(
				'@type' => 'Organization',
				'name' => get_bloginfo( 'name' ),
				'logo' => array(
					'@type' => 'ImageObject',
					'url' => get_custom_logo_url()
				)
			),
			'datePublished' => get_the_date( 'c' ),
			'dateModified' => get_the_modified_date( 'c' ),
			'mainEntityOfPage' => array(
				'@type' => 'WebPage',
				'@id' => get_permalink()
			)
		);
		
		echo '<script type="application/ld+json">' . wp_json_encode( $schema ) . '</script>' . "\n";
	}
}
add_action( 'wp_head', 'mdmc_add_structured_data' );

/**
 * Get custom logo URL
 */
function get_custom_logo_url() {
	$custom_logo_id = get_theme_mod( 'custom_logo' );
	$logo_url = '';
	
	if ( $custom_logo_id ) {
		$logo_url = wp_get_attachment_image_url( $custom_logo_id, 'full' );
	}
	
	return $logo_url ? $logo_url : get_template_directory_uri() . '/images/logo.png';
}

/**
 * Customize excerpt length
 */
function mdmc_excerpt_length( $length ) {
	return 20;
}
add_filter( 'excerpt_length', 'mdmc_excerpt_length' );

/**
 * Customize excerpt more
 */
function mdmc_excerpt_more( $more ) {
	return '...';
}
add_filter( 'excerpt_more', 'mdmc_excerpt_more' );

/**
 * Add custom body classes
 */
function mdmc_body_classes( $classes ) {
	// Add a class for the current language
	$classes[] = 'lang-' . mdmc_get_current_language();
	
	return $classes;
}
add_filter( 'body_class', 'mdmc_body_classes' );

/**
 * Create a JavaScript file with navigation functionality
 */
function mdmc_create_js_files() {
	// Create js directory if it doesn't exist
	if ( ! file_exists( get_template_directory() . '/js' ) ) {
		mkdir( get_template_directory() . '/js', 0755, true );
	}
	
	// Create navigation.js file
	$navigation_js = "/**
 * File navigation.js.
 *
 * Handles toggling the navigation menu for small screens and enables TAB key
 * navigation support for dropdown menus.
 */
( function() {
	const siteNavigation = document.getElementById( 'site-navigation' );

	// Return early if the navigation doesn't exist.
	if ( ! siteNavigation ) {
		return;
	}

	const button = siteNavigation.getElementsByTagName( 'button' )[ 0 ];

	// Return early if the button doesn't exist.
	if ( 'undefined' === typeof button ) {
		return;
	}

	const menu = siteNavigation.getElementsByTagName( 'ul' )[ 0 ];

	// Hide menu toggle button if menu is empty and return early.
	if ( 'undefined' === typeof menu ) {
		button.style.display = 'none';
		return;
	}

	if ( ! menu.classList.contains( 'nav-menu' ) ) {
		menu.classList.add( 'nav-menu' );
	}

	// Toggle the .toggled class and the aria-expanded value each time the button is clicked.
	button.addEventListener( 'click', function() {
		siteNavigation.classList.toggle( 'toggled' );

		if ( button.getAttribute( 'aria-expanded' ) === 'true' ) {
			button.setAttribute( 'aria-expanded', 'false' );
		} else {
			button.setAttribute( 'aria-expanded', 'true' );
		}
	} );

	// Remove the .toggled class and set aria-expanded to false when the user clicks outside the navigation.
	document.addEventListener( 'click', function( event ) {
		const isClickInside = siteNavigation.contains( event.target );

		if ( ! isClickInside ) {
			siteNavigation.classList.remove( 'toggled' );
			button.setAttribute( 'aria-expanded', 'false' );
		}
	} );

	// Get all the link elements within the menu.
	const links = menu.getElementsByTagName( 'a' );

	// Get all the link elements with children within the menu.
	const linksWithChildren = menu.querySelectorAll( '.menu-item-has-children > a, .page_item_has_children > a' );

	// Toggle focus each time a menu link is focused or blurred.
	for ( const link of links ) {
		link.addEventListener( 'focus', toggleFocus, true );
		link.addEventListener( 'blur', toggleFocus, true );
	}

	// Toggle focus each time a menu link with children receive a touch event.
	for ( const link of linksWithChildren ) {
		link.addEventListener( 'touchstart', toggleFocus, false );
	}

	/**
	 * Sets or removes .focus class on an element.
	 */
	function toggleFocus() {
		if ( event.type === 'focus' || event.type === 'blur' ) {
			let self = this;
			// Move up through the ancestors of the current link until we hit .nav-menu.
			while ( ! self.classList.contains( 'nav-menu' ) ) {
				// On li elements toggle the class .focus.
				if ( 'li' === self.tagName.toLowerCase() ) {
					self.classList.toggle( 'focus' );
				}
				self = self.parentNode;
			}
		}

		if ( event.type === 'touchstart' ) {
			const menuItem = this.parentNode;
			event.preventDefault();
			for ( const link of menuItem.parentNode.children ) {
				if ( menuItem !== link ) {
					link.classList.remove( 'focus' );
				}
			}
			menuItem.classList.toggle( 'focus' );
		}
	}
}() );
";
	
	file_put_contents( get_template_directory() . '/js/navigation.js', $navigation_js );
	
	// Create main.js file
	$main_js = "/**
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
    $('.language-dropdown a[data-lang=\"' + currentLang + '\"]').addClass('active');
    
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
";
	
	file_put_contents( get_template_directory() . '/js/main.js', $main_js );
}
add_action( 'after_switch_theme', 'mdmc_create_js_files' );

/**
 * Implement the Custom Header feature.
 */
require get_template_directory() . '/inc/template-tags.php';

<?php
/**
 * The header for our theme
 *
 * @package MDMC_Theme
 */

?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">

	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="page" class="site">
	<a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Skip to content', 'mdmc-theme' ); ?></a>

	<header id="masthead" class="site-header">
		<div class="container">
			<div class="site-header-inner">
				<div class="site-branding">
					<?php
					the_custom_logo();
					if ( is_front_page() && is_home() ) :
						?>
						<h1 class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></h1>
						<?php
					else :
						?>
						<p class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></p>
						<?php
					endif;
					$mdmc_description = get_bloginfo( 'description', 'display' );
					if ( $mdmc_description || is_customize_preview() ) :
						?>
						<p class="site-description"><?php echo $mdmc_description; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
					<?php endif; ?>
				</div><!-- .site-branding -->

				<nav id="site-navigation" class="main-navigation">
					<button class="menu-toggle" aria-controls="primary-menu" aria-expanded="false">
						<span class="menu-toggle-icon"></span>
						<span class="screen-reader-text"><?php esc_html_e( 'Menu', 'mdmc-theme' ); ?></span>
					</button>
					<?php
					wp_nav_menu(
						array(
							'theme_location' => 'menu-1',
							'menu_id'        => 'primary-menu',
							'menu_class'     => 'main-menu',
						)
					);
					?>
					
					<div class="language-selector">
						<div class="language-toggle">
							<span><?php echo strtoupper(mdmc_get_current_language()); ?></span>
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
						</div>
						<div class="language-dropdown">
							<a href="#" data-lang="fr">Français</a>
							<a href="#" data-lang="en">English</a>
							<a href="#" data-lang="es">Español</a>
							<a href="#" data-lang="pt">Português</a>
						</div>
					</div>
				</nav><!-- #site-navigation -->
			</div>
		</div>
	</header><!-- #masthead -->

<?php
/**
 * Custom template tags for this theme
 *
 * @package MDMC_Theme
 */

if ( ! function_exists( 'mdmc_posted_on' ) ) :
	/**
	 * Prints HTML with meta information for the current post-date/time.
	 */
	function mdmc_posted_on() {
		$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';
		if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
			$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
		}

		$time_string = sprintf(
			$time_string,
			esc_attr( get_the_date( DATE_W3C ) ),
			esc_html( get_the_date() ),
			esc_attr( get_the_modified_date( DATE_W3C ) ),
			esc_html( get_the_modified_date() )
		);

		$posted_on = sprintf(
			/* translators: %s: post date. */
			esc_html_x( 'Posted on %s', 'post date', 'mdmc-theme' ),
			'<a href="' . esc_url( get_permalink() ) . '" rel="bookmark">' . $time_string . '</a>'
		);

		echo '<span class="posted-on">' . $posted_on . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
endif;

if ( ! function_exists( 'mdmc_posted_by' ) ) :
	/**
	 * Prints HTML with meta information for the current author.
	 */
	function mdmc_posted_by() {
		$byline = sprintf(
			/* translators: %s: post author. */
			esc_html_x( 'by %s', 'post author', 'mdmc-theme' ),
			'<span class="author vcard"><a class="url fn n" href="' . esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ) . '">' . esc_html( get_the_author() ) . '</a></span>'
		);

		echo '<span class="byline"> ' . $byline . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
endif;

if ( ! function_exists( 'mdmc_entry_footer' ) ) :
	/**
	 * Prints HTML with meta information for the categories, tags and comments.
	 */
	function mdmc_entry_footer() {
		// Hide category and tag text for pages.
		if ( 'post' === get_post_type() ) {
			/* translators: used between list items, there is a space after the comma */
			$categories_list = get_the_category_list( esc_html__( ', ', 'mdmc-theme' ) );
			if ( $categories_list ) {
				/* translators: 1: list of categories. */
				printf( '<span class="cat-links">' . esc_html__( 'Posted in %1$s', 'mdmc-theme' ) . '</span>', $categories_list ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}

			/* translators: used between list items, there is a space after the comma */
			$tags_list = get_the_tag_list( '', esc_html_x( ', ', 'list item separator', 'mdmc-theme' ) );
			if ( $tags_list ) {
				/* translators: 1: list of tags. */
				printf( '<span class="tags-links">' . esc_html__( 'Tagged %1$s', 'mdmc-theme' ) . '</span>', $tags_list ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}
		}

		if ( ! is_single() && ! post_password_required() && ( comments_open() || get_comments_number() ) ) {
			echo '<span class="comments-link">';
			comments_popup_link(
				sprintf(
					wp_kses(
						/* translators: %s: post title */
						__( 'Leave a Comment<span class="screen-reader-text"> on %s</span>', 'mdmc-theme' ),
						array(
							'span' => array(
								'class' => array(),
							),
						)
					),
					wp_kses_post( get_the_title() )
				)
			);
			echo '</span>';
		}

		edit_post_link(
			sprintf(
				wp_kses(
					/* translators: %s: Name of current post. Only visible to screen readers */
					__( 'Edit <span class="screen-reader-text">%s</span>', 'mdmc-theme' ),
					array(
						'span' => array(
							'class' => array(),
						),
					)
				),
				wp_kses_post( get_the_title() )
			),
			'<span class="edit-link">',
			'</span>'
		);
	}
endif;

if ( ! function_exists( 'mdmc_post_thumbnail' ) ) :
	/**
	 * Displays an optional post thumbnail.
	 *
	 * Wraps the post thumbnail in an anchor element on index views, or a div
	 * element when on single views.
	 */
	function mdmc_post_thumbnail() {
		if ( post_password_required() || is_attachment() || ! has_post_thumbnail() ) {
			return;
		}

		if ( is_singular() ) :
			?>

			<div class="post-thumbnail">
				<?php the_post_thumbnail(); ?>
			</div><!-- .post-thumbnail -->

		<?php else : ?>

			<a class="post-thumbnail" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
				<?php
					the_post_thumbnail(
						'post-thumbnail',
						array(
							'alt' => the_title_attribute(
								array(
									'echo' => false,
								)
							),
						)
					);
				?>
			</a>

			<?php
		endif; // End is_singular().
	}
endif;

if ( ! function_exists( 'mdmc_get_translation' ) ) :
	/**
	 * Get translation for a specific key
	 */
	function mdmc_get_translation( $key, $lang = '' ) {
		if ( empty( $lang ) ) {
			$lang = mdmc_get_current_language();
		}
		
		$translations = array(
			'read_more' => array(
				'fr' => 'Lire la suite',
				'en' => 'Read more',
				'es' => 'Leer más',
				'pt' => 'Leia mais'
			),
			'search' => array(
				'fr' => 'Rechercher',
				'en' => 'Search',
				'es' => 'Buscar',
				'pt' => 'Pesquisar'
			),
			'search_placeholder' => array(
				'fr' => 'Rechercher...',
				'en' => 'Search...',
				'es' => 'Buscar...',
				'pt' => 'Pesquisar...'
			),
			'no_results' => array(
				'fr' => 'Aucun résultat trouvé',
				'en' => 'No results found',
				'es' => 'No se encontraron resultados',
				'pt' => 'Nenhum resultado encontrado'
			),
			'categories' => array(
				'fr' => 'Catégories',
				'en' => 'Categories',
				'es' => 'Categorías',
				'pt' => 'Categorias'
			),
			'tags' => array(
				'fr' => 'Tags',
				'en' => 'Tags',
				'es' => 'Etiquetas',
				'pt' => 'Tags'
			),
			'posted_on' => array(
				'fr' => 'Publié le',
				'en' => 'Posted on',
				'es' => 'Publicado el',
				'pt' => 'Publicado em'
			),
			'by' => array(
				'fr' => 'par',
				'en' => 'by',
				'es' => 'por',
				'pt' => 'por'
			),
			'latest_posts' => array(
				'fr' => 'Derniers articles',
				'en' => 'Latest posts',
				'es' => 'Últimos artículos',
				'pt' => 'Últimos artigos'
			),
			'simulator_title' => array(
				'fr' => 'Simulateur de coût publicitaire',
				'en' => 'Advertising Cost Simulator',
				'es' => 'Simulador de costos publicitarios',
				'pt' => 'Simulador de custo publicitário'
			),
			'simulator_description' => array(
				'fr' => 'Estimez le coût de vos campagnes publicitaires musicales en quelques clics.',
				'en' => 'Estimate the cost of your music advertising campaigns in a few clicks.',
				'es' => 'Estime el costo de sus campañas publicitarias musicales en pocos clics.',
				'pt' => 'Estime o custo de suas campanhas publicitárias musicais em poucos cliques.'
			),
			'simulator_button' => array(
				'fr' => 'Essayer le simulateur',
				'en' => 'Try the simulator',
				'es' => 'Probar el simulador',
				'pt' => 'Experimentar o simulador'
			),
			'footer_copyright' => array(
				'fr' => '© 2025 MDMC Music Ads. Tous droits réservés.',
				'en' => '© 2025 MDMC Music Ads. All rights reserved.',
				'es' => '© 2025 MDMC Music Ads. Todos los derechos reservados.',
				'pt' => '© 2025 MDMC Music Ads. Todos os direitos reservados.'
			),
			'error_404_title' => array(
				'fr' => 'Page non trouvée',
				'en' => 'Page not found',
				'es' => 'Página no encontrada',
				'pt' => 'Página não encontrada'
			),
			'error_404_text' => array(
				'fr' => 'La page que vous recherchez n\'existe pas ou a été déplacée.',
				'en' => 'The page you are looking for doesn\'t exist or has been moved.',
				'es' => 'La página que está buscando no existe o ha sido movida.',
				'pt' => 'A página que você está procurando não existe ou foi movida.'
			),
			'back_to_home' => array(
				'fr' => 'Retour à l\'accueil',
				'en' => 'Back to home',
				'es' => 'Volver al inicio',
				'pt' => 'Voltar para o início'
			)
		);
		
		if ( isset( $translations[$key][$lang] ) ) {
			return $translations[$key][$lang];
		}
		
		// Fallback to English
		if ( isset( $translations[$key]['en'] ) ) {
			return $translations[$key]['en'];
		}
		
		return $key;
	}
endif;

if ( ! function_exists( 'mdmc_get_current_language' ) ) :
	/**
	 * Get current language
	 */
	function mdmc_get_current_language() {
		$default_lang = 'fr';
		
		// Check if language is set in cookie
		if ( isset( $_COOKIE['mdmc_language'] ) ) {
			$lang = sanitize_text_field( $_COOKIE['mdmc_language'] );
			if ( in_array( $lang, array( 'fr', 'en', 'es', 'pt' ) ) ) {
				return $lang;
			}
		}
		
		// Check browser language
		if ( isset( $_SERVER['HTTP_ACCEPT_LANGUAGE'] ) ) {
			$browser_lang = substr( $_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2 );
			if ( in_array( $browser_lang, array( 'fr', 'en', 'es', 'pt' ) ) ) {
				return $browser_lang;
			}
		}
		
		return $default_lang;
	}
endif;

<?php
/**
 * The template for displaying all pages
 *
 * @package MDMC_Theme
 */

get_header();
?>

<main id="primary" class="site-main">
    <div class="container">
        <?php while ( have_posts() ) : the_post(); ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class('single-article'); ?>>
                <header class="entry-header">
                    <?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
                </header>
                
                <?php if ( has_post_thumbnail() ) : ?>
                    <div class="post-thumbnail">
                        <?php the_post_thumbnail('large'); ?>
                    </div>
                <?php endif; ?>
                
                <div class="entry-content">
                    <?php the_content(); ?>
                </div>
            </article>
            
            <?php
            // If comments are open or we have at least one comment, load up the comment template.
            if ( comments_open() || get_comments_number() ) :
                comments_template();
            endif;
            ?>
            
        <?php endwhile; ?>
    </div>
</main>

<?php
get_footer();

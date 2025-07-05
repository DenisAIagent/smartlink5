<?php
/**
 * The main template file
 *
 * @package MDMC_Theme
 */

get_header();
?>

<main id="primary" class="site-main">
    <div class="container">
        <?php if ( is_home() && ! is_front_page() ) : ?>
            <header class="page-header">
                <h1 class="page-title"><?php single_post_title(); ?></h1>
            </header>
        <?php endif; ?>

        <?php if ( have_posts() ) : ?>
            <div class="blog-grid">
                <?php while ( have_posts() ) : the_post(); ?>
                    <article id="post-<?php the_ID(); ?>" <?php post_class('blog-card'); ?>>
                        <?php if ( has_post_thumbnail() ) : ?>
                            <a href="<?php the_permalink(); ?>" class="post-thumbnail">
                                <?php the_post_thumbnail('medium', array('class' => 'card-image')); ?>
                            </a>
                        <?php endif; ?>
                        
                        <div class="entry-header">
                            <?php the_title( '<h2 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' ); ?>
                            
                            <div class="entry-meta">
                                <span class="posted-on">
                                    <?php echo mdmc_get_translation('posted_on'); ?> 
                                    <time class="entry-date published" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
                                        <?php echo esc_html( get_the_date() ); ?>
                                    </time>
                                </span>
                            </div>
                        </div>
                        
                        <div class="entry-summary">
                            <?php the_excerpt(); ?>
                        </div>
                        
                        <div class="entry-footer">
                            <a href="<?php the_permalink(); ?>" class="read-more"><?php echo mdmc_get_translation('read_more'); ?></a>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>
            
            <?php the_posts_navigation(); ?>
            
        <?php else : ?>
            <div class="no-results">
                <h2><?php echo mdmc_get_translation('no_results'); ?></h2>
                <p><?php esc_html_e( 'Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'mdmc-theme' ); ?></p>
                <?php get_search_form(); ?>
            </div>
        <?php endif; ?>
    </div>
</main>

<?php
get_footer();

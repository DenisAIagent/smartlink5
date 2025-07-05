<?php
/**
 * The template for displaying all single posts
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
                    
                    <div class="entry-meta">
                        <span class="posted-on">
                            <?php echo mdmc_get_translation('posted_on'); ?> 
                            <time class="entry-date published" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
                                <?php echo esc_html( get_the_date() ); ?>
                            </time>
                        </span>
                        
                        <span class="byline">
                            <?php echo mdmc_get_translation('by'); ?> 
                            <span class="author vcard">
                                <a class="url fn n" href="<?php echo esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ); ?>">
                                    <?php echo esc_html( get_the_author() ); ?>
                                </a>
                            </span>
                        </span>
                    </div>
                </header>
                
                <?php if ( has_post_thumbnail() ) : ?>
                    <div class="post-thumbnail">
                        <?php the_post_thumbnail('large'); ?>
                    </div>
                <?php endif; ?>
                
                <div class="entry-content">
                    <?php the_content(); ?>
                </div>
                
                <footer class="entry-footer">
                    <?php
                    // Display categories
                    $categories_list = get_the_category_list( esc_html__( ', ', 'mdmc-theme' ) );
                    if ( $categories_list ) {
                        echo '<span class="cat-links">' . mdmc_get_translation('categories') . ': ' . $categories_list . '</span>';
                    }
                    
                    // Display tags
                    $tags_list = get_the_tag_list( '', esc_html_x( ', ', 'list item separator', 'mdmc-theme' ) );
                    if ( $tags_list ) {
                        echo '<span class="tags-links">' . mdmc_get_translation('tags') . ': ' . $tags_list . '</span>';
                    }
                    ?>
                </footer>
            </article>
            
            <div class="post-navigation">
                <?php
                the_post_navigation(
                    array(
                        'prev_text' => '<span class="nav-subtitle">' . esc_html__( 'Previous:', 'mdmc-theme' ) . '</span> <span class="nav-title">%title</span>',
                        'next_text' => '<span class="nav-subtitle">' . esc_html__( 'Next:', 'mdmc-theme' ) . '</span> <span class="nav-title">%title</span>',
                    )
                );
                ?>
            </div>
            
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

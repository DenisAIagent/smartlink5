<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @package MDMC_Theme
 */

get_header();
?>

<main id="primary" class="site-main">
    <div class="container">
        <section class="error-404 not-found">
            <header class="page-header">
                <h1 class="page-title"><?php echo mdmc_get_translation('error_404_title'); ?></h1>
            </header>

            <div class="page-content">
                <p><?php echo mdmc_get_translation('error_404_text'); ?></p>

                <div class="error-actions">
                    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="btn btn-primary"><?php echo mdmc_get_translation('back_to_home'); ?></a>
                </div>

                <?php get_search_form(); ?>
            </div>
        </section>
    </div>
</main>

<?php
get_footer();

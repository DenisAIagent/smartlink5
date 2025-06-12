import { blogService } from './api.service';

export const getLatestPosts = async (limit = 3) => {
  try {
    const response = await blogService.getLatestPosts(limit);
    return response.data.map(post => ({
      id: post.id,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      date: new Date(post.date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      link: post.link,
      image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    throw error;
  }
}; 
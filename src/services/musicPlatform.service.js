import apiService from "./api.service";

const musicPlatformService = {
  async fetchLinksFromSourceUrl(sourceUrl) {
    console.log(`Frontend: Demande de récupération des liens pour : ${sourceUrl}`);
    try {
      // Appel à la nouvelle route backend qui utilise Odesli/Songlink
      const response = await apiService.post("/smartlinks/fetch-platform-links", { sourceUrl });
      
      console.log("Frontend: Réponse reçue du backend pour fetch-platform-links:", response);

      if (response && response.success && response.data) {
        // Vérification détaillée de la structure de la réponse
        console.log("Frontend: Structure de response.data:", Object.keys(response.data));
        console.log("Frontend: Contenu de response.data.links:", response.data.links);
        
        // La réponse du backend est attendue sous la forme:
        // { success: true, data: { title, artistName, thumbnailUrl, links: { Spotify: "url", "Apple Music": "url", ... } } }
        
        // Vérifier si links existe et n'est pas vide
        const links = response.data.links || {};
        const hasLinks = Object.keys(links).length > 0;
        
        console.log("Frontend: Nombre de liens trouvés:", Object.keys(links).length);
        
        if (hasLinks) {
          return {
            success: true,
            data: {
              title: response.data.title || "",
              artist: response.data.artistName || "",
              artwork: response.data.thumbnailUrl || "",
              linksByPlatform: links,
              isrc: sourceUrl.startsWith("ISRC:") ? sourceUrl.substring(5) : "" 
            }
          };
        } else {
          // Cas où links existe mais est vide
          console.log("Frontend: Aucun lien trouvé dans la réponse");
          return {
            success: false,
            error: "Aucun lien trouvé pour cette URL/ISRC.",
            data: null
          };
        }
      } else {
        // Gérer les cas où la réponse du backend n'est pas celle attendue ou indique un échec
        const errorMessage = response && response.message 
          ? response.message 
          : "Réponse invalide ou échec de la récupération des liens depuis le backend.";
        console.error("Frontend: Erreur ou réponse invalide du backend:", response);
        return {
          success: false,
          error: errorMessage,
          data: null
        };
      }
    } catch (error) {
      console.error("Frontend: Erreur lors de l'appel à /smartlinks/fetch-platform-links:", error);
      let errorMessage = "Erreur lors de la récupération des liens musicaux.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  }
};

export default musicPlatformService;


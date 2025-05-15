import apiService from "./api.service";

const musicPlatformService = {
  async fetchLinksFromSourceUrl(sourceUrl) {
    console.log(`Frontend: Demande de récupération des liens pour : ${sourceUrl}`);
    try {
      // Appel à la nouvelle route backend qui utilise Odesli/Songlink
      const response = await apiService.post("/smartlinks/fetch-platform-links", { sourceUrl });
      
      console.log("Frontend: Réponse reçue du backend pour fetch-platform-links:", response);

      if (response && response.success && response.data) {
        // La réponse du backend est attendue sous la forme:
        // { success: true, data: { title, artistName, thumbnailUrl, links: { Spotify: "url", "Apple Music": "url", ... } } }
        return {
          success: true,
          data: {
            title: response.data.title || "",
            artist: response.data.artistName || "", // S_assurer que le frontend attend `artist` et non `artistName` si besoin
            artwork: response.data.thumbnailUrl || "",
            linksByPlatform: response.data.links || {},
            // L_ISRC/UPC original n_est pas retourné par Odesli directement de cette manière,
            // mais le `sourceUrl` initial peut être conservé côté appelant si nécessaire.
            isrc: sourceUrl.startsWith("ISRC:") ? sourceUrl.substring(5) : "" 
          }
        };
      } else {
        // Gérer les cas où la réponse du backend n_est pas celle attendue ou indique un échec
        const errorMessage = response && response.message ? response.message : "Réponse invalide ou échec de la récupération des liens depuis le backend.";
        console.error("Frontend: Erreur ou réponse invalide du backend:", response);
        return {
          success: false,
          error: errorMessage,
          data: null
        };
      }
    } catch (error) {
      console.error("Frontend: Erreur lors de l_appel à /smartlinks/fetch-platform-links:", error);
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


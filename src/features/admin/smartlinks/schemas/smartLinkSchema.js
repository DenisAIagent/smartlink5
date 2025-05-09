import { z } from 'zod';

// Schéma pour un lien de plateforme individuel
const platformLinkSchema = z.object({
  platform: z.string().trim().min(1, { message: "La plateforme est requise." }),
  url: z.string().trim().url({ message: "URL invalide." })
});

// Schéma pour les IDs de suivi
const trackingIdsSchema = z.object({
  ga4Id: z.string().trim().optional().or(z.literal('')), // Google Analytics 4
  gtmId: z.string().trim().optional().or(z.literal('')), // Google Tag Manager
  metaPixelId: z.string().trim().optional().or(z.literal('')), // Meta (Facebook) Pixel
  tiktokPixelId: z.string().trim().optional().or(z.literal('')), // TikTok Pixel
  googleAdsId: z.string().trim().optional().or(z.literal('')) // Google Ads Tag ID
}).optional();

// Schéma principal pour le formulaire SmartLink
export const smartLinkSchema = z.object({
  trackTitle: z.string()
    .trim()
    .min(1, { message: "Le titre de la musique est requis." })
    .max(150, { message: "Le titre ne peut pas dépasser 150 caractères." }),
  artistId: z.string()
    .trim()
    .min(1, { message: "L'artiste est requis." }), // Sera un ID MongoDB, mais on le traite comme string ici
  coverImageUrl: z.string()
    .trim()
    .url({ message: "URL d'image de couverture invalide." })
    .min(1, { message: "L'URL de l'image de couverture est requise." }), // Rendu requis
  releaseDate: z.date({ invalid_type_error: "Date de sortie invalide." })
    .optional()
    .nullable(), // Permet null si pas de date
  description: z.string()
    .trim()
    .max(500, { message: "La description ne peut pas dépasser 500 caractères." })
    .optional()
    .or(z.literal('')), // Permet une chaîne vide
  platformLinks: z.array(platformLinkSchema)
    .min(1, { message: "Au moins un lien de plateforme est requis." }), // Rendre obligatoire au moins un lien
  trackingIds: trackingIdsSchema,
  isPublished: z.boolean().optional().default(false)
});

// Type TypeScript dérivé (si besoin)
// export type SmartLinkFormData = z.infer<typeof smartLinkSchema>;


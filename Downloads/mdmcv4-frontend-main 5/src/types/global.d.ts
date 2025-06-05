declare module '@/services/api.service' {
    const apiService: {
        getAllArtists: () => Promise<{
            success: boolean;
            data?: Array<{
                _id: string;
                name: string;
                slug: string;
                artistImageUrl?: string;
            }>;
            error?: string;
        }>;
        deleteArtist: (slug: string) => Promise<any>;
    };
    export default apiService;
}

declare module '../../../hooks/useConnectionError' {
    const useConnectionError: () => {
        isConnected: boolean;
        handleRetry: () => void;
    };
    export default useConnectionError;
}

declare module '../../../components/common/ConnectionError' {
    import { FC } from 'react';
    interface ConnectionErrorProps {
        onRetry: () => void;
    }
    const ConnectionError: FC<ConnectionErrorProps>;
    export default ConnectionError;
}

declare namespace JSX {
    interface Element {}
} 
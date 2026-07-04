import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router'
import type { UploadResponse } from '../../types/types';
import net from '../../net/net';
import { useState } from 'react';

export const Route = createFileRoute('/upload/')({
  beforeLoad: ({ context }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: UploadComponent,
})
function UploadComponent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // Konfiguracja mutacji TanStack Query
    const uploadMutation = useMutation<UploadResponse, Error, File>({
        mutationFn: net.uploadLargeFile,
        onSuccess: (data) => {
            console.log("Sukces! Plik na serwerze:", data);
            alert("Plik wgrany pomyślnie!");
            // Tutaj możesz np. zresetować input lub odświeżyć inną listę queryClient.invalidateQueries(...)
            setSelectedFile(null);
        },
        onError: (error) => {
            console.error("Błąd podczas wysyłania:", error);
            alert(`Wystąpił błąd: ${error.message}`);
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUploadClick = () => {
        if (!selectedFile) {
            alert("Wybierz najpierw plik!");
            return;
        }
        // Wyzwalamy mutację przekazując nasz plik
        uploadMutation.mutate(selectedFile);
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button
                onClick={handleUploadClick}
                disabled={uploadMutation.isPending || !selectedFile}
            >
                {uploadMutation.isPending ? "Wysyłanie..." : "Wyślij plik"}
            </button>

            {/* Opcjonalne wyświetlanie błędu w UI */}
            {uploadMutation.isError && (
                <p style={{ color: 'red' }}>Błąd: {uploadMutation.error.message}</p>
            )}
        </div>
    );

}

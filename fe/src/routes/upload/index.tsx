import { useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router'
import type { DirsI, UploadResponse } from '../../types/types';
import net from '../../net/net';
import { useRef, useState } from 'react';

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
  const [currentPath, setCurrentPath] = useState<string>("");
  const newDirRef = useRef<HTMLInputElement>(null);

  const {
    data: paths,
    isLoading,
    refetch,
    isRefetching
  } = useQuery<DirsI>({
    queryKey: ['files', currentPath],
    queryFn: () => net.fetchFiles(currentPath),
  });

  const queryClient = useQueryClient();

  const { mutate: deleteFile, isPending: isDeleting } = useMutation({
    mutationFn: (pathToDelete: string) => net.fetchDelete(pathToDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      refetch();
    },

    onError: (error) => {
      alert(`Nie udało się usunąć: ${error.message}`);
    }
  });

  const { mutate: createFolder, isPending: isCreating} = useMutation({
    mutationFn: (pathToCreate: string) => net.fetchCreateFolder(pathToCreate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });

      if (newDirRef.current) {
        newDirRef.current.value = "";
      }
      refetch();
    },

    onError: (error) => {
      alert(`Nie udało się stworzyć: ${error.message}`);
    }
  });





  const handleGoBack = () => {
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const handleUploadClick = () => {
      if (!selectedFile) {
          alert("Wybierz najpierw plik!");
          return;
      }
      uploadMutation.mutate({file:selectedFile,path:currentPath});
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const uploadMutation = useMutation<UploadResponse, Error, { file: File, path: string }>({

    mutationFn: ({ file, path }: { file: File; path: string }) => net.uploadLargeFile(file, path),
      onSuccess: (data) => {
          console.log("Sukces! Plik na serwerze:", data);
          setSelectedFile(null);
          refetch();
      },
      onError: (error) => {
          console.error("Błąd podczas wysyłania:", error);
          alert(`Wystąpił błąd: ${error.message}`);
      }
  });


  if (isLoading) {
    return <div>Ładowanie plików z serwera...</div>;
  }

  if (!paths ) {
    return <div>Brak danych lub błąd ładowania folderu.</div>;
  }
  return (
      <div>
          <input type="file" onChange={handleFileChange} />
          <button
              onClick={handleUploadClick}
              disabled={uploadMutation.isPending || !selectedFile}
          >
              {uploadMutation.isPending ? "Wysyłanie..." : "Wyślij plik"}
          </button>

          {uploadMutation.isError && (
              <p style={{ color: 'red' }}>Błąd: {uploadMutation.error.message}</p>
          )}
      <div style={{ padding: '20px' }}>

      <div>
          <input ref={newDirRef} placeholder='path to create' />
          <button
              onClick={()=> {
                const newDirName = newDirRef.current?.value?.trim()
                if (newDirName != ""){
                  createFolder(currentPath+"/"+newDirName)
                }
              }}
              disabled={isCreating}
          >
              {isCreating ? "Wysyłanie..." : "stworz"}
          </button>

      </div>





      <h3>Aktualna lokalizacja: <code>{currentPath || "/"}</code></h3>

      <div style={{ marginBottom: '10px', gap: '10px', display: 'flex' }}>
        <button disabled={!currentPath} onClick={handleGoBack}>
          ..
        </button>

        <button disabled={isRefetching} onClick={() => refetch()}>
          {isRefetching ? 'Odświeżam...' : 'Odśwież'}
        </button>
      </div>

      <ul>
        {paths?.dirs?.map((item: string, index: number) => {
        const parts = item.split(':');
        const type= parts[0];
        const name= parts[1];
        return (
          <li key={index}>
            {type=="FOLDER" ? <b onClick={()=>{setCurrentPath(currentPath+"/"+name); refetch()}}>{name}</b> : `${name}`}
            <button disabled={isDeleting} onClick={()=>{
              if (confirm(`Czy na pewno chcesz usunąć ${name}?`)) {
                    deleteFile(currentPath+"/"+name);
              }
            } }>X</button>
          </li>
          );
        })}
      </ul>

    </div>
  </div>
  );

}

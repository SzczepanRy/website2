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
    return <div className="upload-page"><p className="upload-status">Ładowanie plików z serwera...</p></div>;
  }

  if (!paths ) {
    return <div className="upload-page"><p className="upload-status">Brak danych lub błąd ładowania folderu.</p></div>;
  }
  return (
      <div className="upload-page">
          <header className="upload-header">
            <span className="upload-subtitle">Pliki</span>
            <h1 className="upload-title">Upload</h1>
          </header>

          <div className="upload-grid">
            <section className="upload-panel">
              <div className="upload-panel-header">
                <span className="upload-panel-label">Akcja</span>
                <h2 className="upload-panel-title">Wyślij plik</h2>
              </div>
              <div className="upload-panel-body">
                <div className="upload-field">
                  <span className="upload-field-label">Plik</span>
                  <input className="upload-file-input" type="file" onChange={handleFileChange} />
                </div>
                <button
                    className="upload-btn"
                    onClick={handleUploadClick}
                    disabled={uploadMutation.isPending || !selectedFile}
                >
                    {uploadMutation.isPending ? "Wysyłanie..." : "Wyślij plik"}
                </button>

                {uploadMutation.isError && (
                    <p className="upload-error">Błąd: {uploadMutation.error.message}</p>
                )}
              </div>
            </section>

            <section className="upload-panel">
              <div className="upload-panel-header">
                <span className="upload-panel-label">Akcja</span>
                <h2 className="upload-panel-title">Nowy folder</h2>
              </div>
              <div className="upload-panel-body">
                <div className="upload-field">
                  <span className="upload-field-label">Nazwa folderu</span>
                  <input ref={newDirRef} placeholder='path to create' />
                </div>
                <button
                    className="upload-btn"
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
            </section>
          </div>

          <section className="upload-browser">
            <div className="upload-browser-header">
              <div className="upload-location">
                <span className="upload-location-label">Aktualna lokalizacja</span>
                <code>{currentPath || "/"}</code>
              </div>

              <div className="upload-toolbar">
                <button className="upload-btn upload-btn--ghost" disabled={!currentPath} onClick={handleGoBack}>
                  ..
                </button>

                <button className="upload-btn upload-btn--ghost" disabled={isRefetching} onClick={() => refetch()}>
                  {isRefetching ? 'Odświeżam...' : 'Odśwież'}
                </button>
              </div>
            </div>

            <ul className="upload-file-list">
              {paths?.dirs?.map((item: string, index: number) => {
              const parts = item.split(':');
              const type= parts[0];
              const name= parts[1];
              return (
                <li className="upload-file-item" key={index}>
                  <span className="upload-file-name">
                    {type=="FOLDER" ?
                          <b className="upload-folder-name" onClick={()=>{setCurrentPath(currentPath+"/"+name);refetch()}}>{name}</b> :
                          <a className="upload-file-link" href={window.location.origin+ "/uploads"+currentPath+"/"+name +"?token=" +localStorage.getItem("access_token")}>{name}</a>
                    }
                  </span>
                  <span className="upload-file-actions">
                    <button className="upload-btn upload-btn--danger" disabled={isDeleting} onClick={()=>{
                      if (confirm(`Czy na pewno chcesz usunąć ${name}?`)) {
                            deleteFile(currentPath+"/"+name);
                      }
                    } }>X</button>
                  </span>
                </li>
                );
              })}
            </ul>
          </section>
      </div>
  );

}

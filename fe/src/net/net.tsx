import type { LoginFormI, RegisterFormI, UploadResponse } from "../types/types";

//const localUrl = "http://localhost:8080"
const localUrl = ""

const net = {
  async uploadLargeFile(file: File): Promise<UploadResponse> {
    if (!file) throw new Error("Brak pliku do wysłania.");

    // Tniemy plik na paczki po 5 MB (możesz zwiększyć do 10-20MB)
    const CHUNK_SIZE = 5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const accessToken = localStorage.getItem("access_token");

    // Lecimy pętlą po wszystkich kawałkach pliku
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        // Obliczamy gdzie zaczyna i kończy się dany kawałek
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);

        // Magia dzieje się tutaj: native method .slice() obiektu File
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("file", chunk);

        const headers = new Headers();
        if (accessToken) {
            headers.append("Authorization", `Bearer ${accessToken}`);
        }

        // Musimy powiedzieć backendowi (Go), który to kawałek, żeby umiał to potem skleić
        headers.append("X-File-Name", encodeURIComponent(file.name));
        headers.append("X-Chunk-Index", chunkIndex.toString());
        headers.append("X-Total-Chunks", totalChunks.toString());

        // Wysyłamy konkretny kawałek
        const response = await fetch("http://localhost:8080/api/upload-chunk", {
            method: "POST",
            headers: headers,
            body: formData
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`Wysypało się na paczce ${chunkIndex + 1}/${totalChunks}. Błąd: ${errorMsg}`);
        }

        // Tutaj mógłbyś w przyszłości raportować postęp (np. do stanu Reacta)
        console.log(`Wysłano paczkę ${chunkIndex + 1} z ${totalChunks}`);
    }

    // Jeśli pętla przeszła bez błędów, cały plik jest na serwerze
    return { message: "Plik 2GB pomyślnie wysłany w kawałkach!" };
  },

  async fetchLogin(data: LoginFormI): Promise<any> {
    const res = await fetch(localUrl + "/api/login", {
      method: "post",
      headers: {
        "content-type": "application/json"
        //"Authorization": `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Logowanie nie powiodło się");
    }

    const resdata = await res.json();

    if (resdata && resdata.access) {
      localStorage.setItem("access_token", resdata.access);
    }
    return resdata;
  },


  async fetchRegister(data: RegisterFormI): Promise<any> {
    const res = await fetch(localUrl + "/api/register", {
      method: "post",
      headers: {
        "content-type": "application/json"
        //"Authorization": `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data),
      //credentials: 'include',
    });
    return res.json();
  },

  async fetchRefresh(): Promise<any> {
    const res = await fetch(localUrl + "/api/refresh", {
      method: "post",
      headers: {
        "content-type": "application/json"
      },
      //credentials: 'include',
    });

    if (!res.ok) {
      throw new Error("Logowanie nie powiodło się");
    }

    const resdata = await res.json();

    if (resdata && resdata.access) {
      localStorage.setItem("access_token", resdata.access);
    }

    return resdata;
  },


}

export default net

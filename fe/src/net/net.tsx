import type { DirsI, LoginFormI, RegisterFormI, UploadResponse } from "../types/types";

//const localUrl = "http://localhost:8080"
const localUrl = ""

const net = {
  async uploadLargeFile(file: File , path :string): Promise<UploadResponse> {

    if (!file) throw new Error("Brak pliku do wysłania.");

    const CHUNK_SIZE = 5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const accessToken = localStorage.getItem("access_token");

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);

        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("file", chunk);

        const headers = new Headers();
        if (accessToken) {
            headers.append("Authorization", `Bearer ${accessToken}`);
        }

        headers.append("X-File-Name", encodeURIComponent(file.name));
        headers.append("X-Chunk-Index", chunkIndex.toString());
        headers.append("X-Total-Chunks", totalChunks.toString());
        headers.append("X-Target-Path", encodeURIComponent(path));

        const response = await fetch("/api/upload-chunk", {
            method: "POST",
            headers: headers,
            body: formData
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`Wysypało się na paczce ${chunkIndex + 1}/${totalChunks}. Błąd: ${errorMsg}`);
        }

        console.log(`Wysłano paczkę ${chunkIndex + 1} z ${totalChunks}`);
    }

    return { message: "Plik 2GB pomyślnie wysłany w kawałkach!" };
  },


  async fetchCreateFolder(path: string): Promise<any> {
    const res = await fetch(localUrl + "/api/folder", {
      method: "post",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('access_token')}`
      },
      body:JSON.stringify({path})
    });


    if (res.status == 403){
      const refres =  await this.fetchRefresh()
      if (!refres.ok) {
        throw new Error("pobieranie plików nie powiodło się");
      }
    }else if (!res.ok) {
      throw new Error("pobieranie plików nie powiodło się");
    }
  },





  async fetchDelete(path: string): Promise<any> {
    const res = await fetch(localUrl + "/api/delete", {
      method: "post",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('access_token')}`
      },
      body:JSON.stringify({path})
    });


    if (res.status == 403){
      const refres =  await this.fetchRefresh()
      if (!refres.ok) {
        throw new Error("pobieranie plików nie powiodło się");
      }
    }else if (!res.ok) {
      throw new Error("pobieranie plików nie powiodło się");
    }
  },



  async fetchFiles(dir: string): Promise<DirsI> {
    const res = await fetch(localUrl + "/api/files", {
      method: "post",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('access_token')}`
      },
      body:JSON.stringify({dir})
    });


    if (res.status == 403){
      const refres =  await this.fetchRefresh()
      if (!refres.ok) {
        throw new Error("pobieranie plików nie powiodło się");
      }
    }else if (!res.ok) {
      throw new Error("pobieranie plików nie powiodło się");
    }
    const resdata = await res.json();


    return resdata;
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

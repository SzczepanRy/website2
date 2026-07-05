package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"server/internal"
)


func HandleCreateFolder(w http.ResponseWriter, r *http.Request) {
	var data internal.FolderReq

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		Error(w, r, "could not parse json: ", http.StatusInternalServerError)
		return
	}

	dirPath := "./uploads" + data.Path
	err = os.MkdirAll(dirPath, 0755)
	if err != nil {
		Error(w, r, "could not create: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}



func HandleDeleteFiles(w http.ResponseWriter, r *http.Request) {
	var data internal.DeleteReq

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		Error(w, r, "could not parse json: ", http.StatusInternalServerError)
		return
	}

	dirPath := "./uploads" + data.Path

	err = os.RemoveAll(dirPath)
	if err != nil {
		Error(w, r, "could not delete: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}


func HandleGetFiles(w http.ResponseWriter, r *http.Request) {

	var data internal.FilesReq

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		Error(w, r, "could not parse json: ", http.StatusInternalServerError)
		return
	}
	dirPath := "./uploads" + data.Dir

	var res internal.FilesRes

	entries, err := os.ReadDir(dirPath)
	if err != nil {
		log.Fatal(err)
	}

	for _, entry := range entries {
		if entry.IsDir() {
			res.Dirs = append(res.Dirs, "FOLDER:"+entry.Name())
		} else {
			res.Dirs = append(res.Dirs, "FILE:"+entry.Name())
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		Error(w, r, " Błąd kodowania JSON :"+err.Error(), http.StatusInternalServerError)
		return
	}
}

func HandleUploadChunk(w http.ResponseWriter, r *http.Request) {
	encodedFileName := r.Header.Get("X-File-Name")
	chunkIndex := r.Header.Get("X-Chunk-Index")
	encodedPath := r.Header.Get("X-Target-Path")

	path, err := url.QueryUnescape(encodedPath)
	if err != nil {
		http.Error(w, "Błędna ścieżka", http.StatusBadRequest)
		return
	}

	// Dekodujemy nazwę pliku (bo na frontendzie zrobiliśmy encodeURIComponent)
	fileName, _ := url.QueryUnescape(encodedFileName)
	if fileName == "" {
		http.Error(w, "Brak nazwy pliku w nagłówku", http.StatusBadRequest)
		return
	}

	uploadDir := "./uploads" + path
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		http.Error(w, "Błąd tworzenia folderu", http.StatusInternalServerError)
		return
	}

	dstPath := filepath.Join(uploadDir, filepath.Base(fileName))

	// 2. Magia sklejania pliku (Zamiast os.Create)
	flags := os.O_CREATE | os.O_WRONLY | os.O_APPEND // Dopisuj na koniec
	if chunkIndex == "0" {
		// Jeśli to pierwsza paczka, usuń stary plik jeśli istniał i zacznij od nowa
		flags = os.O_CREATE | os.O_WRONLY | os.O_TRUNC
	}

	dst, err := os.OpenFile(dstPath, flags, 0644)
	if err != nil {
		log.Printf("Błąd otwarcia pliku na dysku: %v\n", err)
		http.Error(w, "Nie można zapisać pliku na serwerze", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	reader, err := r.MultipartReader()
	if err != nil {
		http.Error(w, "Niepoprawny format", http.StatusBadRequest)
		return
	}

	for {
		part, err := reader.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			http.Error(w, "Błąd przesyłania", http.StatusInternalServerError)
			return
		}

		if part.FormName() == "file" {
			// io.Copy teraz wrzuca dane na KONIEC pliku (bo mamy O_APPEND)
			_, err = io.Copy(dst, part)
			part.Close()

			if err != nil {
				log.Printf("Błąd podczas strumieniowania: %v\n", err)
				http.Error(w, "Przerwano przesyłanie", http.StatusInternalServerError)
				return
			}
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Paczka przyjęta pomyślnie"}`))
}

func HandleUpload(w http.ResponseWriter, r *http.Request) {

	encodedPath := r.Header.Get("X-Target-Path")

	path, err := url.QueryUnescape(encodedPath)
	if err != nil {
		http.Error(w, "Błędna ścieżka", http.StatusBadRequest)
		return
	}
	reader, err := r.MultipartReader()

	if err != nil {
		log.Printf("Błąd inicjalizacji MultipartReader: %v\n", err)
		Error(w, r, "Niepoprawny format multipart/form-data", http.StatusBadRequest)
		return
	}

	uploadDir := "./uploads" + path

	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		log.Printf("Błąd tworzenia folderu uploads: %v\n", err)
		Error(w, r, "Błąd wewnętrzny serwera", http.StatusInternalServerError)
		return
	}

	for {
		part, err := reader.NextPart()
		if err == io.EOF {
			break // Przeczytaliśmy całe żądanie, kończymy pętlę
		}
		if err != nil {
			log.Printf("Błąd pobierania kolejnej części pliku: %v\n", err)
			Error(w, r, "Błąd podczas przesyłania pliku", http.StatusInternalServerError)
			return
		}

		// Szukamy pola formularza, które na FE nazwaliśmy "file"
		if part.FormName() == "file" {
			filename := part.FileName()
			if filename == "" {
				Error(w, r, "Brak nazwy pliku", http.StatusBadRequest)
				return
			}

			// Bezpieczna ścieżka zapisu pliku na serwerze
			dstPath := filepath.Join(uploadDir, filepath.Base(filename))
			dst, err := os.Create(dstPath)
			if err != nil {
				log.Printf("Błąd tworzenia pliku na dysku: %v\n", err)
				Error(w, r, "Nie można zapisać pliku na serwerze", http.StatusInternalServerError)
				part.Close()
				return
			}

			// 4. STRUMIENIOWANIE: io.Copy kopiuje dane part (z sieci) bezpośrednio do dst (na dysk)
			// Zużycie RAMU w tym momencie to stałe ~32KB, niezależnie czy plik ma 10MB czy 10GB!
			_, err = io.Copy(dst, part)
			dst.Close()  // zamykamy plik na dysku zaraz po skończeniu kopiowania
			part.Close() // zamykamy strumień sieciowy dla tej części

			if err != nil {
				log.Printf("Błąd podczas strumieniowania danych na dysk: %v\n", err)
				Error(w, r, "Przerwano przesyłanie pliku", http.StatusInternalServerError)
				return
			}

		} else {
			part.Close()
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

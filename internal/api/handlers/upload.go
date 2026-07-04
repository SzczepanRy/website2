package handlers

import (
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
)

func HandleUploadChunk(w http.ResponseWriter, r *http.Request) {
	encodedFileName := r.Header.Get("X-File-Name")
	chunkIndex := r.Header.Get("X-Chunk-Index")

	// Dekodujemy nazwę pliku (bo na frontendzie zrobiliśmy encodeURIComponent)
	fileName, _ := url.QueryUnescape(encodedFileName)
	if fileName == "" {
		http.Error(w, "Brak nazwy pliku w nagłówku", http.StatusBadRequest)
		return
	}

	uploadDir := "./uploads"
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
	// 2. Inicjalizacja czytnika Multipart (strumieniowego)
	reader, err := r.MultipartReader()
	if err != nil {
		log.Printf("Błąd inicjalizacji MultipartReader: %v\n", err)
		Error(w, r, "Niepoprawny format multipart/form-data", http.StatusBadRequest)
		return
	}

	// Stworzenie folderu na pliki, jeśli jeszcze nie istnieje
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		log.Printf("Błąd tworzenia folderu uploads: %v\n", err)
		Error(w, r, "Błąd wewnętrzny serwera", http.StatusInternalServerError)
		return
	}

	// 3. Pętla przetwarzająca części żądania (pliki i inne pola formularza)
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

			// Jeśli aplikacja tego wymaga, tutaj możesz wywołać zapytanie do bazy:
			// h.db.Pool.Exec(r.Context(), "INSERT INTO user_files ...")
		} else {
			// Jeśli przesyłasz inne pola w formularzu obok pliku, musisz je zamknąć, by czytać dalej
			part.Close()
		}
	}

	// 5. Sukces – zwracamy ładny JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

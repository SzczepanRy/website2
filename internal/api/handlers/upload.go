package handlers

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
)

func HandleUpload(w http.ResponseWriter, r *http.Request) {
	reader, err := r.MultipartReader()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for {
		// Czytamy kolejną część żądania
		part, err := reader.NextPart()
		if err == io.EOF {
			break // Koniec pliku / żądania
		}
		if err != nil {
			http.Error(w, "Błąd czytania pliku", http.StatusInternalServerError)
			return
		}

		// Interesuje nas tylko pole z plikiem
		if part.FormName() == "file" {
			// Tworzymy docelowy plik na dysku serwera
			dst, err := os.Create(filepath.Join("./uploads", part.FileName()))
			if err != nil {
				http.Error(w, "Nie można zapisać pliku", http.StatusInternalServerError)
				return
			}
			defer dst.Close()

			// 3. KLUCZOWY MOMENT: io.Copy strumieniuje dane z sieci wprost na dysk!
			// Buforuje dane małymi kawałkami (np. po 32KB), zużycie RAM serwera wynosi niemal 0.
			_, err = io.Copy(dst, part)
			if err != nil {
				http.Error(w, "Błąd podczas zapisywania strumienia", http.StatusInternalServerError)
				return
			}
		}
	}

	w.WriteHeader(http.StatusOK)

}

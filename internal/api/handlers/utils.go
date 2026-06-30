package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"server/internal"
)

func Error(w http.ResponseWriter, r *http.Request, massage string, status int) {
	errRes := internal.ErrorRes{
		Status:  status,
		Message: massage,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(errRes.Status)
	err := json.NewEncoder(w).Encode(errRes)
	if err != nil {
		log.Printf("Błąd kodowania JSON: %v", err)
	}
}

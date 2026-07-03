package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"server/internal"
	"server/internal/services"
	"time"
)

func Refresh(w http.ResponseWriter, r *http.Request) {
	/*
		this will be changed when addding db
	*/

	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			http.Error(w, "Brak ciasteczka sesyjnego", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Błąd odświerzania cookie", http.StatusInternalServerError)
		return
	}

	// 2. Wartość ciasteczka znajduje się w polu .Value (jest to string)

	claim, err := services.VerifyToken(cookie.Value)

	if err != nil {
		http.Error(w, "Nie poprawny refresh_token", http.StatusInternalServerError)
		return
	}

	var res internal.RefreshRes
	res.Access, err = services.GenerateToken(claim.Login, time.Hour)
	if err != nil {
		http.Error(w, "błąd tworzenia access_token", http.StatusInternalServerError)
		return
	}

	refresh, err := services.GenerateToken(claim.Login, 24*time.Hour)
	if err != nil {
		http.Error(w, "błąd tworzenia refresh_token", http.StatusInternalServerError)
		return
	}

	services.SetRefreshCookie(w, refresh)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		Error(w, r, " Błąd kodowania JSON :"+err.Error(), http.StatusInternalServerError)
		return
	}

}

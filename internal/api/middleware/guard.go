package middleware

import (
	"net/http"
	"server/internal/api/handlers"
	"server/internal/services"
	"strings"
)

func AuthGuard(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			handlers.Error(w, r, "Brak nagłówka Authorization", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			handlers.Error(w, r, "Niepoprawny format nagłówka Authorization", http.StatusBadRequest)
			return
		}
		accessToken := parts[1]

		_, err := services.VerifyToken(accessToken)
		if err != nil {
			handlers.Error(w, r, "Invalid access token", http.StatusForbidden)
			return
		}

		next(w, r)
	}
}

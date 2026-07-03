package middleware

import (
	"encoding/json"
	"net/http"
	"server/internal"
	"server/internal/api/handlers"
	"server/internal/services"
	"strings"
)

func AuthGuard(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		var data internal.GuardRes

		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			handlers.Error(w, r, "could not parse json Auth middleware", http.StatusInternalServerError)
			return
		}
		access := strings.Split(data.Auth, " ")[2]

		_, err = services.VerifyToken(access) //nie potszeba tu claims

		if err != nil {
			handlers.Error(w, r, "invalid access token", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)

	})

}

package middleware

import (
	"log"
	"net/http"
)

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Zawsze dodaj nagłówki
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// 2. KLUCZOWE: Jeśli OPTIONS, odpowiedz i ZAKOŃCZ
		if r.Method == http.MethodOptions {
			log.Println("DEBUG: Middleware obsłużył OPTIONS")
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// 3. Jeśli nie OPTIONS, przekaż dalej
		next.ServeHTTP(w, r)
	})
}

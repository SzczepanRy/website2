package main

import (
	"log"
	"net/http"
	router "server/internal/api"
	"server/internal/api/middleware"

	"github.com/joho/godotenv"
)

func main() {

	log.Printf("init")
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("could not load env\n")
	}
	mux := router.NewRouter()
	CORSmux := middleware.CORSMiddleware(mux)

	log.Printf("server port 8080")

	// Złap błąd, jeśli port jest zajęty
	err = http.ListenAndServe(":8080", CORSmux)
	if err != nil {
		log.Fatal("Serwer nie mógł wystartować: ", err)
	}
}

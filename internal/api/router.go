package router

import (
	"log"
	"net/http"
	"regexp"
	"server/internal/api/handlers"
)

type Router struct {
	middleware []func(http.Handler) http.Handler
	apiRoutes  map[string]http.HandlerFunc
}

func NewRouter() *Router {
	r := &Router{
		apiRoutes: make(map[string]http.HandlerFunc),
	}
	r.setupRoutes()
	return r

}
func (mux *Router) setupRoutes() {
	mux.apiRoutes["/api/register"] = handlers.HandleRedgister
	mux.apiRoutes["/api/refresh"] = handlers.Refresh
	mux.apiRoutes["/api/login"] = handlers.HandleLogin
}

func (mux *Router) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	// mam zorbinmy auth mniddleware ale nei wime czy on jest wgl potrzebny

	if match, _ := regexp.MatchString("/api/.*", r.URL.Path); match {
		//api niem wim czy trzeba post jakoś inferować

		handler, exists := mux.apiRoutes[r.URL.Path]

		if !exists {
			log.Printf("Nie znaleziono ścieżki API: %s\n", r.URL.Path)
			handlers.Error(w, r, "Path Not Found", http.StatusNotFound)
			return
		}

		handler(w, r)
		return

	} else {
		// NONAPI
		switch r.Method {
		case "GET":
			if match, _ := regexp.MatchString("/assets/.*", r.URL.Path); match {
				http.ServeFile(w, r, "./fe/dist/"+r.URL.Path)
			} else {
				switch r.URL.Path {
				case "/":
					http.ServeFile(w, r, "./fe/dist/index.html")
				}

			}
		default:
			log.Printf("unknown method \n")
			handlers.Error(w, r, "unknown method", http.StatusNotFound)
		}

	}

}

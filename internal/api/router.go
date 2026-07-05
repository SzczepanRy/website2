package router

import (
	"log"
	"net/http"
	"regexp"
	"server/internal/api/handlers"
	"server/internal/api/middleware"
)

type Router struct {
	middleware []func(http.Handler) http.Handler
	apiRoutes  map[string]http.HandlerFunc
	hCtx       *handlers.HandlerCtx
}

func NewRouter(hCtx *handlers.HandlerCtx) *Router {
	r := &Router{
		apiRoutes: make(map[string]http.HandlerFunc),
		hCtx:      hCtx,
	}
	r.setupRoutes()
	return r
}

func (mux *Router) setupRoutes() {
	mux.apiRoutes["/api/register"] = mux.hCtx.HandleRedgister
	mux.apiRoutes["/api/refresh"] = mux.hCtx.HandleRefresh
	mux.apiRoutes["/api/login"] = mux.hCtx.HandleLogin

	mux.apiRoutes["/api/upload"] = middleware.AuthGuard(handlers.HandleUpload)
	mux.apiRoutes["/api/upload-chunk"] = middleware.AuthGuard(handlers.HandleUploadChunk)
	mux.apiRoutes["/api/files"] = middleware.AuthGuard(handlers.HandleGetFiles)
	mux.apiRoutes["/api/delete"] = middleware.AuthGuard(handlers.HandleDeleteFiles)
	mux.apiRoutes["/api/folder"] = middleware.AuthGuard(handlers.HandleCreateFolder)

}

func (mux *Router) ServeHTTP(w http.ResponseWriter, r *http.Request) {


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

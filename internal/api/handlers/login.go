package handlers

import (
	"encoding/json"
	"net/http"
	"server/internal"
	"server/internal/api/database"
	"server/internal/services"
	"time"
)

type HandlerCtx struct {
	db *database.Database
}

func NewContextHandler(db *database.Database) *HandlerCtx {
	return &HandlerCtx{db: db}

}

func (h *HandlerCtx) HandleRedgister(w http.ResponseWriter, r *http.Request) {

	var data internal.RedgisterReq

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		Error(w, r, "could not parse json", http.StatusInternalServerError)
	}

	_, err = h.db.Getuser(r.Context(), data.Login)
	if err == nil {
		Error(w, r, "login taken", http.StatusInternalServerError)
	}

	passwordhash := services.NewPasswoedHash(data.Password)

	err = h.db.Adduser(r.Context(), data.Login, data.Email, passwordhash)
	if err != nil {
		Error(w, r, "Error wiriing to db"+err.Error(), http.StatusInternalServerError)
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	var res internal.RedgisterRes
	res.Status = 200
	res.Message = "redgister succesfull"
	err = json.NewEncoder(w).Encode(res)

	if err != nil {
		Error(w, r, " Błąd kodowania JSON :"+err.Error(), http.StatusInternalServerError)
	}
}

func (h *HandlerCtx) HandleRefresh(w http.ResponseWriter, r *http.Request) {
	//to sie tera dzinie zachowuje bo nie da je wylogować na fe XD
	// bo ciastko httponly

	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		if err == http.ErrNoCookie {
			// Przeglądarka nie przesłała takiego ciasteczka
			Error(w, r, "Brak ciasteczka refresh_token", http.StatusUnauthorized)
			return
		}
		// Inny błąd serwera
		Error(w, r, "Błąd odczytu ciasteczka: "+err.Error(), http.StatusBadRequest)
		return
	}

	rawRefreshToken := cookie.Value

	data, err := services.VerifyToken(rawRefreshToken)

	if err != nil {
		Error(w, r, "Nie zgodny refresh token: "+err.Error(), http.StatusBadRequest)
		return
	}

	var res internal.RefreshRes

	res.Access, err = services.GenerateToken(data.Login, time.Hour)
	if err != nil {
		Error(w, r, "Error generating access token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	reftoken, err := services.GenerateToken(data.Login, 24*time.Hour)
	if err != nil {
		Error(w, r, "Error generating refresh token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = h.db.UpdateRefresh(r.Context(), reftoken, data.Login)
	if err != nil {
		Error(w, r, "DB Error : "+err.Error(), http.StatusInternalServerError)
		return
	}

	services.SetRefreshCookie(w, reftoken)

	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(http.StatusOK)

	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		Error(w, r, " Błąd kodowania JSON :"+err.Error(), http.StatusInternalServerError)
		return
	}

}

func (h *HandlerCtx) HandleLogin(w http.ResponseWriter, r *http.Request) {

	var data internal.LoginReq

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		Error(w, r, "could not parse json: ", http.StatusInternalServerError)
	}

	user, err := h.db.Getuser(r.Context(), data.Login)
	if err != nil {
		Error(w, r, "Error reading db: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = services.VerifyPasswordHash(user.HashedPassword, data.Password)
	if err != nil {
		Error(w, r, "innvalid refresh_token: "+err.Error(), http.StatusInternalServerError)
		return
	}


	var res internal.LoginRes
	res.Access, err = services.GenerateToken(data.Login, time.Hour)
	if err != nil {
		Error(w, r, "Error generating access token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	reftoken, err := services.GenerateToken(data.Login, 24*time.Hour)
	if err != nil {
		Error(w, r, "Error generating refresh token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = h.db.UpdateRefresh(r.Context() , reftoken , data.Login)
	if err != nil {
		Error(w, r, "Error saving refresh token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	services.SetRefreshCookie(w, reftoken)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	res.Status = 200
	res.Message = "login succesfull"

	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		Error(w, r, " Błąd kodowania JSON :"+err.Error(), http.StatusInternalServerError)
		return
	}

}

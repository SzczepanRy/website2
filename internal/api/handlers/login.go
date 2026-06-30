package handlers

import (
	"encoding/json"
	"net/http"
	"server/internal"
	"server/internal/services"
)

func HandleRedgister(w http.ResponseWriter, r *http.Request) {
	// this will be changed
	var data internal.RedgisterReq

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		Error(w, r, "could not parse json", http.StatusInternalServerError)
	}

	err = services.Adduser(&data)

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

func HandleLogin(w http.ResponseWriter, r *http.Request) {

	//##########################
	// this will be changed
	//##########################

	var data internal.LoginReq

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		Error(w, r, "could not parse json", http.StatusInternalServerError)
	}

	err = services.Getuser(&data)

	if err != nil {
		Error(w, r, "Error wiriing to db"+err.Error(), http.StatusInternalServerError)
	}

	//#############################
	// generating token in cookie header reps
	//#############################

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	var res internal.LoginRes
	res.Access = "testAccesss"
	res.Refresh = "testRefresh"
	res.Status = 200
	res.Message = "login succesfull"

	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		Error(w, r, " Błąd kodowania JSON :"+err.Error(), http.StatusInternalServerError)
	}

}

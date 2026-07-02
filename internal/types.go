package internal

import "github.com/golang-jwt/jwt/v5"

type ErrorRes struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

type LoginRes struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Access  string `json:"accesss"`
}

type LoginReq struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type RedgisterReq struct {
	Login    string `json:"login"`
	Email    string `json:"email"`
	Password string `json:"password"`
}


type RefreshReq struct {
}
type RefreshRes struct {
	Access  string `json:"accesss"`
}



type RedgisterRes struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

// /////////////auth
type CustomClaims struct {
	Login string `json:"login"`
	jwt.RegisteredClaims
}

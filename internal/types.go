package internal

import (
	"database/sql"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type ErrorRes struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

type LoginRes struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Access  string `json:"access"`
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
	Access string `json:"access"`
}

type RedgisterRes struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

// /////////////auth

type GuardRes struct {
	Auth string `json:"Authorization"`
}

type CustomClaims struct {
	Login string `json:"login"`
	jwt.RegisteredClaims
}

/////////////////DB

type User struct {
	Login          string
	Email          string
	HashedPassword string
	RefreshToken   sql.NullString
	TokenExpiresAt sql.NullTime
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

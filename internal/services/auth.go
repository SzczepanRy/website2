package services

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"server/internal"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(login string, exp time.Duration) (string, error) {
	claims := internal.CustomClaims{
		Login: login,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(exp)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "go-server",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(os.Getenv("TOKEN_SECRET")))
	if err != nil {
		return "", err
	}
	return tokenString, nil

}

func VerifyToken(tokenString string) (*internal.CustomClaims, error) {

	token, err := jwt.ParseWithClaims(tokenString, &internal.CustomClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(os.Getenv("TOKEN_SECRET")), nil
	})

	if err != nil {
		return nil, err
	}

	// Extract and validate claims
	if claims, ok := token.Claims.(*internal.CustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func SetRefreshCookie(w http.ResponseWriter, refreshToken string) {
	cookie := &http.Cookie{
		Name:    "refresh_token",
		Value:   refreshToken,
		Expires: time.Now().Add(7 * 24 * time.Hour),

		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",

		/*

			// 1. Uniemożliwia dostęp do ciasteczka przez JavaScript (ochrona przed XSS)
			HttpOnly: true,

			// 2. Ciasteczko zostanie wysłane TYLKO przez szyfrowane połączenie HTTPS
			// (Na localhost możesz zostawić true, nowoczesne przeglądarki na to pozwalają)
			Secure:   true,

			// 3. Ogranicza wysyłanie ciasteczka w zapytaniach międzywitrynowych (ochrona przed CSRF)
			SameSite: http.SameSiteStrictMode,

			// 4. Bardzo ważne! Ciasteczko będzie wysyłane TYLKO do endpointu odświeżania.
			// Żaden inny kontroler (np. /api/users) go nie otrzyma.
			Path:     "/api/refresh",
		*/
	}

	// Zapisanie ciasteczka w nagłówku odpowiedzi (Set-Cookie)
	http.SetCookie(w, cookie)
}

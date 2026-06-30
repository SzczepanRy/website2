package services

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"server/internal"
	"strings"
)

func Adduser(user *internal.RedgisterReq) error {

	if user.Email == "" || user.Login == "" || user.Password == "" {
		return errors.New("Wszystkie pola są wymagane")
	}

	userLine := fmt.Sprintf("%s;%s;%s\n", user.Login, user.Email, user.Password)

	// Jeśli plik nie istnieje, zostanie stworzony (O_CREATE)
	// Otwieramy tylko do zapisu (O_WRONLY)
	file, err := os.OpenFile("./db.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}

	defer file.Close()

	_, err = file.WriteString(userLine)
	if err != nil {
		return err
	}

	return nil
}
func Getuser(user *internal.LoginReq) error {

	if user.Login == "" || user.Password == "" {
		return errors.New("Wszystkie pola są wymagane")
	}

	file, err := os.Open("db.txt")
	if err != nil {

		if os.IsNotExist(err) {
			return errors.New("Nie znaleziono użytkownika")
		}

		return errors.New("Błąd serwera przy otwieraniu pliku")
	}

	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()

		// Rozdzielamy linijkę po średniku
		parts := strings.Split(line, ";")

		// Upewniamy się, że linijka jest poprawna (ma 3 elementy)
		if len(parts) >= 3 {
			if parts[0] == user.Login && parts[2] == user.Password {
				return nil
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return errors.New("Błąd podczas czytania pliku")
	}

	return errors.New("Nie znaleziono użytkownika o podanym loginie lub złe hasło")
}

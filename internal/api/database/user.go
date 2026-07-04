package database

import (
	"context"
	"errors"
	"fmt"
	"log"
	"server/internal"
	"time"

	"github.com/jackc/pgx/v5"
)

func (db *Database) Adduser(ctx context.Context, login string, email string, passwordHash string) error {
	insertQuery := `
		INSERT INTO users (login, email, password_hash)
		VALUES ($1, $2, $3)
		ON CONFLICT (login) DO NOTHING;`

	result, err := db.Pool.Exec(ctx, insertQuery, login, email, passwordHash)
	if err != nil {
		log.Printf("Błąd podczas dodawania użytkownika do bazy: %v\n", err)
		return fmt.Errorf("błąd rejestracji: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("użytkownik o loginie '%s' już istnieje", login)
	}

	return nil
}

func (db *Database) Getuser(ctx context.Context, login string) (*internal.User, error) {

	selectQuery := `
		SELECT  login, email,password_hash, refresh_token, token_expires_at, created_at, updated_at
		FROM users
		WHERE login = $1;`

	// tu hashujemy hasło które przyszło

	var u internal.User
	err := db.Pool.QueryRow(ctx, selectQuery, login).Scan(
		&u.Login,
		&u.Email,
		&u.HashedPassword,
		&u.RefreshToken,
		&u.TokenExpiresAt,
		&u.CreatedAt,
		&u.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("użytkownik nie istnieje")
		}
		log.Printf("Błąd bazy danych przy Getuser: %v\n", err)
		return nil, err
	}
	return &u, nil

}

func (db *Database) UpdateRefresh(ctx context.Context, newRefToken string, login string) error {

	tokenExpiresAt := time.Now().Add(7 * 24 * time.Hour)
	updateQuery := `
        UPDATE users
        SET refresh_token = $1,
            token_expires_at = $2
        WHERE login = $3;`

	_, err := db.Pool.Exec(ctx, updateQuery, newRefToken, tokenExpiresAt, login)
	if err != nil {
		log.Printf("Błąd podczas aktualizacji tokenu: %v\n", err)
		return errors.New("Błąd podczas aktualizacji tokenu : " + err.Error())

	}
	return nil

}

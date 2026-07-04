package database

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Database struct {
	Pool *pgxpool.Pool
}

func NewDB() *Database {
	ctx := context.Background()

	pool, err := pgxpool.New(ctx, os.Getenv("DB_URI"))
	if err != nil {
		log.Fatalf("Nie można utworzyć puli połączeń: %v\n", err)
	}

	database := &Database{
		Pool: pool,
	}

	return database

}

func (db *Database) setupDb() {
}

func (db *Database) Close(){
	db.Pool.Close()
}

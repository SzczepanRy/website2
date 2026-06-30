BINARY_NAME=server
MAIN_PATH=./cmd/server/main.go

.PHONY: all build-linux build-windows clean

all: build-linux build-windows

build-linux:
	@echo "--- Budowanie na Linux ---"
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bin/$(BINARY_NAME)_linux $(MAIN_PATH)
	npm run build --prefix fe

build-windows:
	@echo "--- Budowanie na Windows ---"
	GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -o bin/$(BINARY_NAME).exe $(MAIN_PATH)
	npm run build --prefix fe

clean:
	@echo "--- Czyszczenie ---"
	rm -rf bin/*

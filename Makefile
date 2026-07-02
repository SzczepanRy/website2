BBINARY_NAME=server
MAIN_PATH=./cmd/server/main.go

# Detect OS
ifeq ($(OS),Windows_NT)
    # Windows specific commands
    RM_CMD = if exist bin del /q /s bin\*
    # On Windows, we use 'set' and chain with &&, ensuring a space before the next command
    SET_LINUX = set GOOS=linux&& set GOARCH=amd64&& set CGO_ENABLED=0&&
    SET_WINDOWS = set GOOS=windows&& set GOARCH=amd64&& set CGO_ENABLED=0&&
else
    # Linux/macOS specific commands
    RM_CMD = rm -rf bin/*
    SET_LINUX = GOOS=linux GOARCH=amd64 CGO_ENABLED=0
    SET_WINDOWS = GOOS=windows GOARCH=amd64 CGO_ENABLED=0
endif

.PHONY: all build-linux build-windows clean

all: build-linux build-windows

build-linux:
	@echo "--- Budowanie na Linux ---"
	$(SET_LINUX) go build -o bin/$(BINARY_NAME)_linux $(MAIN_PATH)
	npm run build --prefix fe

build-windows:
	@echo "--- Budowanie na Windows ---"
	$(SET_WINDOWS) go build -o bin/$(BINARY_NAME).exe $(MAIN_PATH)
	npm run build --prefix fe

clean:
	@echo "--- Czyszczenie ---"
	$(RM_CMD)

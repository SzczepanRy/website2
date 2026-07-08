BINARY_NAME=server
MAIN_PATH=./cmd/server/main.go

# Detect OS
ifeq ($(OS),Windows_NT)
    # Windows specific commands
    RM_CMD = if exist bin del /q /s bin\*
    SET_LINUX = set GOOS=linux&& set GOARCH=amd64&& set CGO_ENABLED=0&&
    SET_PI = set GOOS=linux&& set GOARCH=arm64&& set CGO_ENABLED=0&&
    SET_WINDOWS = set GOOS=windows&& set GOARCH=amd64&& set CGO_ENABLED=0&&
else
    # Linux/macOS specific commands
    RM_CMD = rm -rf bin/*
    SET_LINUX = GOOS=linux GOARCH=amd64 CGO_ENABLED=0
    SET_PI = GOOS=linux GOARCH=arm64 CGO_ENABLED=0
    SET_WINDOWS = GOOS=windows GOARCH=amd64 CGO_ENABLED=0
endif

.PHONY: all build-linux build-pi build-windows clean

all: build-linux build-pi build-windows

build-linux:
	@echo "--- Budowanie na standardowy Linux (Intel/AMD) ---"
	$(SET_LINUX) go build -o bin/$(BINARY_NAME)_linux $(MAIN_PATH)
	npm run build --prefix fe

build-pi:
	@echo "--- Budowanie na Raspberry Pi (Linux ARM64) ---"
	$(SET_PI) go build -o bin/$(BINARY_NAME)_pi_arm64 $(MAIN_PATH)
	npm run build --prefix fe

build-windows:
	@echo "--- Budowanie na Windows ---"
	$(SET_WINDOWS) go build -o bin/$(BINARY_NAME).exe $(MAIN_PATH)
	npm run build --prefix fe

clean:
	@echo "--- Czyszczenie ---"
	$(RM_CMD)

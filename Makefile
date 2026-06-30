BINARY_NAME=server
MAIN_PATH=./cmd/server/main.go
# Determine if we are on Windows for command adjustment
ifeq ($(OS),Windows_NT)
    SET_ENV = set GOOS=$(1)&& set GOARCH=amd64&& set CGO_ENABLED=0&&
    RM_CMD = del /q bin\*
else
    SET_ENV = GOOS=$(1) GOARCH=amd64 CGO_ENABLED=0
    RM_CMD = rm -rf bin/*
endif

.PHONY: all build-linux build-windows clean

all: build-linux build-windows

build-linux:
	@echo "--- Budowanie na Linux ---"
	$(call SET_ENV,linux) go build -o bin/$(BINARY_NAME)_linux $(MAIN_PATH)
	npm run build --prefix fe

build-windows:
	@echo "--- Budowanie na Windows ---"
	$(call SET_ENV,windows) go build -o bin/$(BINARY_NAME).exe $(MAIN_PATH)
	npm run build --prefix fe

clean:
	@echo "--- Czyszczenie ---"
	$(RM_CMD)

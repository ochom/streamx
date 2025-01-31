tidy:
	cd ./api && go mod tidy && cd ..

dev:
	cd ./api && air

lint:
	@echo "Linting ..."
	@cd ./api && golangci-lint run --timeout 5m
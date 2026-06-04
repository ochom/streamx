tidy:
	cd ./core && bun install \
	&& cd ..

dev:
	cd ./core && bun dev \
	&& cd ..

build:
	cd ./core && bun run build \
	&& cd ..

lint:
	@echo "Linting ..."
	@cd ./core && bun lint \
	&& cd ..

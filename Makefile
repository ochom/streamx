tidy:
	cd ./core && bun install \
	&& cd ..

dev:
	cd ./core && bun dev \
	&& cd ..

lint:
	@echo "Linting ..."
	@cd ./core && bun lint \
	&& cd ..

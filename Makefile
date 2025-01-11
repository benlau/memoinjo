MEMOINJO_CORE_PATH=${PWD}/packages/memoinjo-core
ASSETS_PATH=${MEMOINJO_CORE_PATH}/lib/bower_components


.PHONY: install
install:
	npm install

.PHONY: pack
pack:
	mkdir -p dist
	(cd target/memoinjo-chrome && zip -r ../../dist/memoinjo-chrome.zip .)
	(cd target/memoinjo-firefox && zip -r ../../dist/memoinjo-firefox.zip .)

.PHONY: build
build:
	npm run build

.PHONY: clean
clean:
	rm -rf dist

.PHONY: format
format:
	npm run format

.PHONY: test
test:
	npm run test

.PHONY: lint
lint:
	npm run lint
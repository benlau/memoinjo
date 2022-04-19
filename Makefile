
MEMOINJO_CORE_PATH=${PWD}/packages/memoinjo-core
ASSETS_PATH=${MEMOINJO_CORE_PATH}/lib/bower_components


.PHONY: install
install:
	npm install
	bower install

.PHONY: pack
pack:
	mkdir -p dist
	(cd target/memoinjo-chrome && zip -r ../../dist/memoinjo-chrome.zip .)
	(cd target/memoinjo-firefox && zip -r ../../dist/memoinjo-firefox.zip .)

.PHONY: bootstrap
bootstrap: bootstrap-memoinjo-core bootstrap-memoinjo-firefox bootstrap-memoinjo-chrome

.PHONY: bootstrap-memoinjo-core
bootstrap-memoinjo-core:
	mkdir -p ${ASSETS_PATH}
	cp bower_components/bootstrap/dist/css/bootstrap.min.css ${ASSETS_PATH}
	cp bower_components/jquery/dist/jquery.min.js ${ASSETS_PATH}
	mkdir -p ${ASSETS_PATH}/fontawesome/webfonts
	mkdir -p ${ASSETS_PATH}/fontawesome/css
	cp bower_components/Font-Awesome/css/all.min.css ${ASSETS_PATH}/fontawesome/css
	cp -R bower_components/Font-Awesome/webfonts/. ${ASSETS_PATH}/fontawesome/webfonts

.PHONY: bootstrap-memoinjo-firefox
bootstrap-memoinjo-firefox:
	mkdir -p target/memoinjo-firefox/memoinjo
	cp -R ${MEMOINJO_CORE_PATH}/. target/memoinjo-firefox/memoinjo

.PHONE: bootstrap-memoinjo-chrome
bootstrap-memoinjo-chrome:
	ln -sfn ${MEMOINJO_CORE_PATH} ${PWD}/target/memoinjo-chrome/memoinjo

clean:
	rm -f target/memoinjo-chrome/memoinjo

ASSETS_PATH=extension/memoinjo/lib/bower_components

.PHONY: copy-assets
copy-assets:
	mkdir -p ${ASSETS_PATH}
	cp bower_components/bootstrap/dist/css/bootstrap.min.css ${ASSETS_PATH}
	cp bower_components/jquery/dist/jquery.min.js ${ASSETS_PATH}

.PHONY: install
install:
	npm install
	bower install
	make copy-assets

.PHONY: pack
pack:
	mkdir -p dist
	(cd extension/memoinjo && zip -r ../../dist/memoinjo.zip .)
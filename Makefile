PWD := $(PWD)
CMAKE_C_COMPILER := $(shell which clang)
CMAKE_BUILD_TYPE := Debug
CMAKE_BUILD_FOLDER := $(PWD)/build/cmake-build-$(CMAKE_BUILD_TYPE)

configure:
	mkdir -pv $(CMAKE_BUILD_FOLDER) && \
	cd $(CMAKE_BUILD_FOLDER) && \
	cmake \
		-DCMAKE_C_COMPILER=$(CMAKE_C_COMPILER) \
		-DCMAKE_BUILD_TYPE=$(CMAKE_BUILD_TYPE) \
		$(PWD)

build: configure
	cd $(CMAKE_BUILD_FOLDER) && \
	make

test: build
	$(CMAKE_BUILD_FOLDER)/el_test

valgrind: build
	valgrind \
		--leak-check=full \
		--track-origins=yes \
		$(CMAKE_BUILD_FOLDER)/el_test

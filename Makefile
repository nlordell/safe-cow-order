SRC := $(shell find src/ -type f -name '*.js')
OPT := --no-remote --import-map=vendor/import_map.json

target/safe-cow-order: target/safe-cow-order.js
	deno compile $(OPT) --output $@ $^

target/safe-cow-order.%: target/safe-cow-order.js
	deno compile $(OPT) --output $@ --target $(*:.exe= ) $^

target/safe-cow-order.js: $(SRC)
	mkdir -p target/
	deno bundle $(OPT) src/index.js $@

.PHONY: vendor
vendor:
	deno vendor --force src/index.js

.PHONY: xcompile
xcompile: target/safe-cow-order.x86_64-unknown-linux-gnu target/safe-cow-order.x86_64-pc-windows-msvc.exe target/safe-cow-order.x86_64-apple-darwin target/safe-cow-order.aarch64-apple-darwin

.PHONY: clean
clean:
	rm -r target/

DIST_NAME = anthonylisp

SCRIPT_FILES = \
	src/parse.ts \
	src/LispEnvironment.ts \
	src/index.ts \
	src/lispAtom.ts \
	src/LispCell.ts \
	src/LispRuntime.ts \
	src/demo.ts \
	test/test.ts

EXTRA_SCRIPTS =

include ./Makefile.microproject

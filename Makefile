SHELL=/bin/bash
PYTHON=python3.11
PYTHON_ENV=env

.PHONY: clean doc dist build test ci-test lint isort shell freeze

# python env ##################################################################
$(PYTHON_ENV): pyproject.toml
	rm -rf $(PYTHON_ENV) && \
	$(PYTHON) -m venv $(PYTHON_ENV) && \
	. $(PYTHON_ENV)/bin/activate && \
	pip install pip --upgrade && \
	pip install -e .[dev]

clean:
	rm -rf $(PYTHON_ENV)

shell: | $(PYTHON_ENV)
	. $(PYTHON_ENV)/bin/activate && \
	rlpython

freeze: | $(PYTHON_ENV)
	. $(PYTHON_ENV)/bin/activate && \
	pip freeze

# tests #######################################################################
server: $(PYTHON_ENV)
	. $(PYTHON_ENV)/bin/activate && \
	python ./test-server.py $(args)

build:
	docker compose build $(args)

test:
	docker compose run tools tox $(args)

ci-test:
	docker compose run tools tox -e lint,py38,py39,py310,py311 $(args)

gifs:
	rm doc/*.gif
	docker compose run imagemagick /app/scripts/convert-videos-to-gifs.sh

# packaging ###################################################################
dist: | $(PYTHON_ENV)
	. $(PYTHON_ENV)/bin/activate && \
	rm -rf dist *.egg-info && \
	$(PYTHON) -m build

_release: dist
	. $(PYTHON_ENV)/bin/activate && \
	twine upload --config-file ~/.pypirc.fscherf dist/*

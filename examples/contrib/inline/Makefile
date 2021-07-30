# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
SHELL=/bin/bash
TAG := dev

.PHONY: help
help: ## Print this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


.PHONY: build
build: ## build things
	cd ../../../functions/contrib/ts/inline && docker build . --file=build/inline.Dockerfile --tag gcr.io/kpt-fn-contrib/inline:dev

.PHONY: render
render: ## Render all examples
	kpt fn render hello-world --image-pull-policy=ifNotPresent --truncate-output=false --results-dir=hello-world/.results
	cat hello-world/.results/results.yaml
	kpt fn render validate --image-pull-policy=ifNotPresent --truncate-output=false --results-dir=validate/.results
	cat validate/.results/results.yaml

.PHONY: test
test: build render ## Run all e2e tests

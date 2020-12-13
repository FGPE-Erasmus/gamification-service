variables ?= .env
args = $(filter-out $@,$(MAKECMDGOALS))


include $(variables)
export $(shell sed 's/=.*//' $(variables))


#build:
#	docker build \
#    -f ./docker/Dockerfile \
#    -t $(APP_NAME) \
#    --build-arg NODE_ENV=$(NODE_ENV) \
#    --build-arg PORT=$(APP_PORT) \
#    .

run:
	docker run -d -i \
    --env-file $(variables) \
    --name $(APP_NAME) \
    -p $(APP_PORT):$(APP_PORT) \
    $(APP_NAME)

up: build run

stop:
	docker-compose stop || true; docker-compose down || true
	docker-compose stop || true; docker-compose down || true

test: stop
	docker-compose -f docker-compose.test.yml up -d --build
	/bin/sh -c "npm run test:e2e && npm run test:graphql"
	docker-compose -f docker-compose.test.yml down

# DEVELOPMENT TASKS
install:
	npm install $(args) --save
	docker exec -it $(APP_NAME) npm install $(args) --save

uninstall:
	npm uninstall $(args) --save
	docker exec -it $(APP_NAME) npm uninstall $(args) --save

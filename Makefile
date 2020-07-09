variables ?= .env
args = $(filter-out $@,$(MAKECMDGOALS))


include $(variables)
export $(shell sed 's/=.*//' $(variables))


build:
	docker build \
    -f ./docker/Dockerfile \
    -t $(APP_NAME) \
    --build-arg NODE_ENV=$(NODE_ENV) \
    --build-arg PORT=$(APP_PORT) \
    .

run:
	docker run -d -i \
    --env-file $(variables) \
    --name $(APP_NAME) \
    -p $(APP_PORT):$(APP_PORT) \
    $(APP_NAME)

up: build run

stop:
	docker stop $(DB_HOST) || true; docker rm $(DB_HOST) || true
	docker stop $(APP_NAME) || true; docker rm $(APP_NAME) || true

test: stop build
	docker run -d -i \
    --name $(DB_HOST) \
    -e "DB_INITDB_DATABASE=$(DB_NAME)" \
    -e "DB_INITDB_ROOT_USERNAME=$(DB_USERNAME)" \
    -e "DB_INITDB_ROOT_PASSWORD=$(DB_PASSWORD)" \
    -p $(DB_PORT):$(DB_PORT) \
    -v "$(PWD)/docker/init-mongo.sh:/docker-entrypoint-initdb.d/init-mongo.sh" \
    mongo:latest
ifeq ($(NODE_ENV),development)
	docker run -i -t \
    --env-file $(variables) \
    --name $(APP_NAME) \
    --link $(DB_HOST):$(DB_HOST) \
    $(APP_NAME) \
    /bin/sh -c "npm run test && npm run test:e2e && npm run test:graphql"
else
	docker run -d -i \
    --env-file $(variables) \
    --name $(APP_NAME) \
    --link $(DB_HOST):$(DB_HOST) \
    $(APP_NAME) \
    /bin/sh -c "npm run test && npm run test:e2e && npm run test:graphql"
endif


# DEVELOPMENT TASKS
install:
	npm install $(args) --save
	docker exec -it $(APP_NAME) npm install $(args) --save

uninstall:
	npm uninstall $(args) --save
	docker exec -it $(APP_NAME) npm uninstall $(args) --save

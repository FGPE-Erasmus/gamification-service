#!/bin/bash

mongoimport --uri "mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH}&authMechanism=SCRAM-SHA-1" --db "${DB_NAME}" --collection ActionHook --file /mongo-seeder/test-data-actionhook.json
mongoimport --uri "mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH}&authMechanism=SCRAM-SHA-1" --db "${DB_NAME}" --collection Challenge --file /mongo-seeder/test-data-challenge.json
mongoimport --uri "mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH}&authMechanism=SCRAM-SHA-1" --db "${DB_NAME}" --collection ChallengeStatus --file /mongo-seeder/test-data-challengestatus.json
mongoimport --uri "mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH}&authMechanism=SCRAM-SHA-1" --db "${DB_NAME}" --collection Game --file /mongo-seeder/test-data-game.json
mongoimport --uri "mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH}&authMechanism=SCRAM-SHA-1" --db "${DB_NAME}" --collection Group --file /mongo-seeder/test-data-group.json
mongoimport --uri "mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH}&authMechanism=SCRAM-SHA-1" --db "${DB_NAME}" --collection Leaderboard --file /mongo-seeder/test-data-leaderboard.json
mongoimport --uri "mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH}&authMechanism=SCRAM-SHA-1" --db "${DB_NAME}" --collection Player --file /mongo-seeder/test-data-player.json
mongoimport --uri "mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH}&authMechanism=SCRAM-SHA-1" --db "${DB_NAME}" --collection PlayerReward --file /mongo-seeder/test-data-playerreward.json
mongoimport --uri "mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH}&authMechanism=SCRAM-SHA-1" --db "${DB_NAME}" --collection Reward --file /mongo-seeder/test-data-reward.json
mongoimport --uri "mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH}&authMechanism=SCRAM-SHA-1" --db "${DB_NAME}" --collection ScheduledHook --file /mongo-seeder/test-data-scheduledhook.json
mongoimport --uri "mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH}&authMechanism=SCRAM-SHA-1" --db "${DB_NAME}" --collection Submission --file /mongo-seeder/test-data-submission.json

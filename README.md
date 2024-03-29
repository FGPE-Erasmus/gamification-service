# FGPE Gamification Service

This is a Gamification Service for educational contexts. It consumes a JSON object adhering to GEdIL schema and uses it to provide the student with a gamified experience leveraging on the activities of the course.

## Getting Started

Docker + Make + Node.js + TypeScript + NestJS + Mongoose + TypeGraphQL + Jest + TSLint + EasyGraphQL Tester

### Requirements

```
$ Git --version
>= v2.19

$ Docker --version
>= v19.03.12

$ Docker Compose --version
>= v1.24.1

$ Make --version
>= v4.2.1

$ node --version
>= v14

$ NPM --version
>= v6.4.5

```

### How to run with Docker

```
From the terminal, enter the folder where you want to keep the project and perform the following steps:

$ git clone https://github.com/FGPE-Erasmus/gamification-service.git
$ cd gamification-service
$ cp .env.sample .env
$ docker-compose up
```

### How to run without Docker

```
From the terminal, enter the folder where you want to keep the project and perform the following steps:

$ git clone https://github.com/FGPE-Erasmus/gamification-service.git
$ cd gamification-service
$ cp .env.sample .env
$ npm install
$ npm run start:dev
```

### Run tests

```
$ cd gamification-service
$ cp .env.sample .env
$ make test
```

### Run tests on CI/CD pipeline

```
$ cd gamification-service
$ make variables=".env.test" test
```

### Static Analysis

```
$ cd gamification-service
$ npm run lint
```

### Code Coverage

```
$ cd gamification-service
$ npm run test:cov
```

### Admin Login

 - username: `admin`
 - password: `4dm1nS.`

## Built With

* [Docker](https://docker.com/)
* [Make](https://www.gnu.org/software/make/manual/html_node/Simple-Makefile.html/)
* [Node.js](https://nodejs.org/)
* [TypeScript](https://sass-lang.com/)
* [NestJS](https://nestjs.com/)
* [Express](https://expressjs.com)
* [Mongoose](https://mongoosejs.com/)
* [TypeGraphQL](https://typegraphql.ml/)
* [Jest](https://jestjs.io/)
* [EasyGraphQL Tester](https://easygraphql.com/docs/easygraphql-tester/overview/)
* [NPM](https://yarnpkg.com/)
* [TSLint](https://palantir.github.io/tslint/)
* [Husky](https://github.com/typicode/husky)
* [Lint Staged](https://github.com/okonet/lint-staged)


## Author

* **José Carlos Paiva** - [GitHub](https://github.com/josepaiva94)
* **Alicja Haraszczuk** - [GitHub](https://github.com/hvsio)

## Acknowledgments

<table cellspacing="0" cellpadding="0" border=0>
<tr border=0>
<td border=0>

This software has been developed as a part of the Framework for Gamified Programming Education ([https://fgpe.usz.edu.pl/](https://fgpe.usz.edu.pl/)) and FGPE Plus: Learning tools interoperability for gamified programming education ([https://fgpeplus.usz.edu.pl/](https://fgpeplus.usz.edu.pl/)) projects which were co-funded by the Erasmus+ Programme of the European Union.

</td>
<td border=0>

![Framework for Gamified Programming Education project](docs/logo_FGPE.jpg) ![Erasmus+](docs/logo_erasmus.jpg)

</td>
</tr>
</table>

## License

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

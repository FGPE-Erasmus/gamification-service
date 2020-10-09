import * as fs from 'fs';
import * as path from 'path';
import { name as fakeName, internet as fakeInternet } from 'faker';
import * as EasyGraphQLTester from 'easygraphql-tester';

describe('UsersModule (Queries and Mutations)', () => {
  let tester: any;

  beforeAll(() => {
    const schema: any = fs.readFileSync(path.join(__dirname, '../../src', 'schema.gql'), 'utf8');
    tester = new EasyGraphQLTester(schema);
  });

  it('Should pass if the mutation is valid', done => {
    const name: string = fakeName.findName();
    const username: string = fakeInternet.userName();
    const email: string = fakeInternet.email();

    const mutation = `
      mutation saveUser($user: UserInput!) {
        saveUser(userInput: $user) {
          name
          username
          email
        }
      }
    `;
    tester.test(true, mutation, {
      user: {
        name,
        username,
        email,
      },
    });
    done();
  });

  it('Valid Users query', done => {
    const query = `
      query users {
        users {
          items {
            id
            username
            email
            name
            roles
          }
          total
        }
      }
    `;
    tester.test(true, query);
    done();
  });
});

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
    const email: string = fakeInternet.email();

    const mutation = `
      mutation saveUser($user: CreateUserInput!) {
        saveUser(userInput: $user) {
          name
          email
        }
      }
    `;
    tester.test(true, mutation, {
      user: {
        name,
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
            name
            email
          }
          total
        }
      }
    `;
    tester.test(true, query);
    done();
  });
});

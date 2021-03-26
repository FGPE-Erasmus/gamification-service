import { Role } from '../../src/common/enums/role.enum';
import { UserInfo } from '../../src/keycloak/interfaces/user-info.interface';

export const LOGGED_IN_TEACHER: UserInfo = {
  sub: '28b9a394-3d43-4d3a-8bb3-ea50f89461b8',
  emailVerified: true,
  preferredUsername: 'teacher_fgpe',
  family_name: 'FGPE',
  given_nme: 'Teacher',
  email: 'teacher@fgpe.usz.edu.pl',
};

export const LOGGED_IN_STUDENT: UserInfo = {
  sub: '1b335cd6-b6fb-44c9-bddd-4acf549587b2',
  emailVerified: true,
  preferredUsername: 'student_fgpe',
  family_name: 'FGPE',
  given_nme: 'Student',
  email: 'student@fgpe.usz.edu.pl',
};

export const LOGGED_IN_STUDENT_ALT: UserInfo = {
  sub: '9e5352bf-e396-46b0-bf87-9150061ad14b',
  emailVerified: true,
  preferredUsername: 'userone',
  family_name: 'User',
  given_nme: 'One',
  email: 'userone@gmail.com',
};

export const USERS = [
  {
    id: '28b9a394-3d43-4d3a-8bb3-ea50f89461b8',
    emailVerified: true,
    username: 'teacher_fgpe',
    firstName: 'Teacher',
    lastName: 'FGPE',
    email: 'teacher@fgpe.usz.edu.pl',
  },
  {
    id: '1b335cd6-b6fb-44c9-bddd-4acf549587b2',
    emailVerified: true,
    username: 'student_fgpe',
    firstName: 'Student',
    lastName: 'FGPE',
    email: 'student@fgpe.usz.edu.pl',
  },
  {
    id: '9e5352bf-e396-46b0-bf87-9150061ad14b',
    emailVerified: true,
    username: 'userone',
    firstName: 'User',
    lastName: 'One',
    email: 'userone@gmail.com',
  },
  {
    id: '61e37d1b-50d8-49e1-88f3-a3e83d7b0d59',
    emailVerified: true,
    username: 'usertwo',
    firstName: 'User',
    lastName: 'Two',
    email: 'usertwo@gmail.com',
  },
  {
    id: 'a11e8d97-bf28-4531-9411-aa72faba86a7',
    emailVerified: true,
    username: 'userthree',
    firstName: 'User',
    lastName: 'Three',
    email: 'userthree@gmail.com',
  },
];
export const USERS_BY_ROLE = {
  [Role.TEACHER]: [USERS[0]],
  [Role.STUDENT]: USERS.slice(1),
};

export const GAMES_WORKFLOW = [
  '5fd4b3b2c5dc26001e0fe36c', // teacher imported a GEdIL archive;
  '5fd4b657c5dc26001e0fe37a', // prev + teacher assigns an instructor to a game;
  '5fd4b6c3c5dc26001e0fe388', // prev + teacher creates two groups;
  '5fd4b768c5dc26001e0fe398', // prev + teacher adds four players into the game;
  '5fd4bb2bc5dc26001e0fe3b4', // prev + teacher auto-assigns four enrolled players to two groups;
  '5fd4bc74c5dc26001e0fe3d0', // prev + challenge unlocked after student submits a correct solution to each exercise of the preceding challenge
];

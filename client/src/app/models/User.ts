interface IUser {
  _id?: string,
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  password: string;
  avatarUrl?: string;
  roles?: string[];
  reading?: { epubUrl: string, bookmark: string };
}

export class User implements IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  password: string;
  avatarUrl?: string;
  roles?: string[];
  reading?: { epubUrl: string, bookmark: string };

  constructor(credentials: IUser) {
    this.firstName = credentials.firstName;
    this.lastName = credentials.lastName;
    this.email = credentials.email;
    this.password = credentials.password;
  }
}

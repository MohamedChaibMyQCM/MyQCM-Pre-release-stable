import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";

export class JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

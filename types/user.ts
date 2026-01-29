import { UserRole } from "@prisma/client";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  isActive: boolean;
  image?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

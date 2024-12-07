import { Role } from "@prisma/client"

export interface UserToken {
  userId: string
}

export interface UserResponse {
  id: string
  name: string
  email: string
  role: Role
} 
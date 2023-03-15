import { PrismaClient } from "@prisma/client"
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

const prisma = new PrismaClient()

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userExists = await prisma.user
          .findUnique({
            where: {
              id: user.id,
            },
          })
          .catch((e) => {
            console.log(e.message)
          })

        if (!userExists) {
          const newUser = await prisma.user
            .create({
              data: {
                id: user.id,
                image: user.image,
              },
            })
            .catch((e) => {
              console.log(e.message)
            })
        }

        token.id = user.id
      }

      return token
    },
    async session({ session, token, user }) {
      session.user.id = token.id

      return session
    },
  },
}

export default NextAuth(authOptions)

import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
    EmailProvider({
      server: process.env.EMAIL_SERVER || {
        host: "localhost",
        port: 1025,
        auth: {
          user: "",
          pass: "",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@churnsentinel.com",
      ...(process.env.NODE_ENV === "development" && !process.env.EMAIL_SERVER
        ? {
            sendVerificationRequest: async ({ identifier, url }) => {
              console.log("\n========================================");
              console.log("Magic Link for:", identifier);
              console.log("URL:", url);
              console.log("========================================\n");
            },
          }
        : {}),
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;

        // Get user's workspace
        const membership = await db.workspaceMember.findFirst({
          where: { userId: token.sub },
          include: { workspace: true },
        });

        if (membership) {
          session.user.workspaceId = membership.workspaceId;
          session.user.workspaceName = membership.workspace.name;
          session.user.role = membership.role;
        }
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
      }

      // Refresh workspace info on update
      if (trigger === "update" && token.sub) {
        const membership = await db.workspaceMember.findFirst({
          where: { userId: token.sub },
        });
        if (membership) {
          token.workspaceId = membership.workspaceId;
        }
      }

      return token;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create workspace for new users
      if (user.id && user.email) {
        const workspace = await db.workspace.create({
          data: {
            name: `${user.name || user.email.split("@")[0]}'s Workspace`,
            members: {
              create: {
                userId: user.id,
                role: "owner",
              },
            },
            alertSettings: {
              create: {},
            },
          },
        });
        console.log(`Created workspace ${workspace.id} for user ${user.id}`);
      }
    },
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireWorkspace() {
  const session = await requireAuth();
  if (!session.user.workspaceId) {
    throw new Error("No workspace found");
  }
  return session;
}

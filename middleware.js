export { default } from "next-auth/middleware"

export const config = { matcher: ["/messages(.*)","/profile","/settings","/listings/new", "/matches"] }


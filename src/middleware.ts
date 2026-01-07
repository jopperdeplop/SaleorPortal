import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isSetupPage = req.nextUrl.pathname === "/dashboard/setup-2fa";
    
    // 1. Force Login
    if (!isLoggedIn && req.nextUrl.pathname !== "/login") {
        const newUrl = new URL("/login", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }

    // 2. Force 2FA Setup
    if (isLoggedIn && !req.auth?.user?.twoFactorEnabled && !isSetupPage) {
        const setupUrl = new URL("/dashboard/setup-2fa", req.nextUrl.origin);
        return Response.redirect(setupUrl);
    }
})

export const config = {
    matcher: ['/dashboard/:path*'],
}

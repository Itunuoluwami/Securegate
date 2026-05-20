
 SecureGate — Reflection & Engineering Analysis

Adebisi Adetutu Itunuoluwa
Design to MVP Bootcamp
Vercel: https://securegate-hd5p.vercel.app/
GitHub Repo: https://github.com/Itunuoluwami/Securegate.git
What I built: I built a standalone authentication and security app built to demonstrate production-ready identity and access management.
What surprised me: I was surprised that deploying my app on Vercel is actually more complex than I thought it was. I had to spend time debugging and rewriting some codes to finally get it to deploy.


1. Murphy's law 
Murphy's Law force me to add protection in the API key configuration code: 

 lib/mail.ts:17-20 — Placeholder API key detection in Resend
if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_1234")) {
  console.log("[MAIL MOCK] Using Resend Mock (API Key is placeholder)");
 return { success: true, mocked: true };
What could have gone wrong: 
A developer can copy .env.example without setting a real Resend key or just writes a dummy placeholder like re_1234. Without the check, the code would call the Resend API with a fake key, and send a 401/403 error, throw an unhandled exception, and block every new signup and password reset because email sending crashed. 

2. The Law of Leaky Abstractions
NextAuth leaks the api key in the .env file 
Resend API key re_SDXcTuhF_8TKMpkHRN1Jdz8qZojja9Fuj and NextAuth secret yeX7NAQwNTzu63AmhI2wMZ/igo+77DyL9EKhBpPIg94= 
These keys  leaked when I pushed my first commit to git hub without writing the gitignore code. When I discovered I had to do a git filter to filter out the keys from the commit in github 

3. YAGNI
Adding social login, multifactor auth or audit logs are not required for the tasks as at now. Adding it to the project at this time would result in overengineering  because I don’t need it now. The AGENTS.md file already explicitly states that none of these should be added for now.

How to add it later: 
A.  Social login —  I will add it to the NextAuth's providers: [...] array in lib/auth.ts:17  since it is already designed to append providers. 
B. Audit Log -  I will add a standalone AuditLog Prisma model later to take userId, action, ip, timestamp, metadata. 


4. Kerchkhoff's Principle
Salt is a random piece of data added to a password before hashing. It determines the number of work to be done before breaking a password hash. Bcrypt automatically uses salt for passwords to protect the passwords against attacks. It also helps to prevent the case of having the same hash for two users who use the same password. The salt helps to distinguish between the two passwords. 
If passwords are hashed in SH456 an attacker could easily know two users who have the same password, a SH456 hashed password is faster to attack but bcrypt is intentionally slow.
const hashedPassword = await bcrypt.hash(password, 12);
Verification — lib/auth.ts:47-50:
const isValid = await bcrypt.compare(credentials.password, user.password);


5. Postel's Law
The forgot password endpoint returns success so as not to hint an attacker if the email actually exists or not. If it is changed, it is possible for an attacker to want to find out what the email is just so that he has access to the password reset link. The law that governs this decision is the Postel’s law. 
app/api/auth/forgot-password/route.ts:43-48:
const successMessage = "If an account with this email exists, a verification link has been sent to the user's email.";
// Zero Leakage: If user doesn't exist, return a generic success message
if (!user) {
  return NextResponse.json({ message: successMessage }, { status: 200 });
}
6. The Boy Scout Rule
A place in my codebase where I applied the Boy Scout Rule was in the .env file where the Resend API key was using a place holder "re_placeholder". To clean it up, I introduced a real Resend API key to replace the place holder so that emails are sent to actual email rather than falling back into the console.

7. Gall's Law
Gall’s law states that a complex system that works evolved from a simple system that worked. This means that building a product is progressive and building in phases would prevent tangling of the code and having to debug multiple issues at the same time. 

10 Law of Least Surprise 
The user sees "Invalid email or password". It is the same message regardless of whether the email exists or the password is wrong. I chose that password so as not to reveal anything to the attacker, but more importantly. it tells the user exactly what they expect. 

11. Murphy's Law
The middleware authorizes the token. The NextAuth decrypts the JWT from the nextauth session token cookie using the NEXTAUTH_SECRET.  If the token decrypts and isn't expired, it means the token is truthy and it will be authorised. 
If the user deletes the cookie, the middleware returns false. 

 Middleware intercepts — middleware.ts:4-22:
// withAuth wraps the middleware
authorized: ({ token }) => !!token,  // token is null → false
pages: { signIn: "/login" },          // redirect target
matcher: ["/dashboard/:path*"]        // only runs on /dashboard/*
 NextAuth internally at middleware.ts:1 — withAuth from next-auth/middleware decrypts the next-auth.session-token JWT using NEXTAUTH_SECRET. No cookie → no JWT → token is null.
Fallback if middleware skipped — app/dashboard/page.tsx:10-13:
const session = await getServerSession(authOptions);
if (!session) {
  redirect("/login");

12. Kerckhoff's Law
If  my NEXTAUTH_SECRET was accidentally committed to Github, it exposes the keys used to sign all session JWTs. 
How to recover: Rotate NEXTAUTH_SECRET in .env.local, Vercel/cloud env vars, and any other deployment. Another way to recover from this is to purge the secret from git history by installing git-filter- repo 

13. Conway's Law
Conway’s Law states that software systems reflect the communication structure of the organization that builds them.  
My folder structure:
api
dashboard
forgot password
login
reset password
sign up
verify email
I have organised my folder based on features. 


14. Tecnical Debt
The mail.ts issue where Email verification and password reset emails  are called synchronously. 
Looking at 
signup/route.ts:61:
await sendVerificationEmail(user.email, verificationToken.token);
This was done this way to avoid leakages and also because I used the Resent test API key. 

15. Synthesis Question
Engineering principles that would still apply if i’m to integrate flutterwave are: 
 Gall's Law - Build simple working system first, evolve
 YAGNI - Don't build what you don't need
 Boy Scout Rule - Leave code cleaner than you found it
 Principle of Least Surprise - Behavior should be predictable
 Postel's Law / Zero Leakage - Be conservative in what you send (don't leak info)
Rate limiting- prevent brute-force
Email verification and error messages become more critical. 

16. What I now know about authentication, security and engineering principles that I did not know before
I have learnt how to integrate the Resend API. I learnt not to push my NEXT_AUTH and SECURITY_KEYS to my github repo by using gitignore. When I mistakenly pushed this, I learnt tht using git filter counld help purge the secret keys from the github repo so that anyone doesnt have access to it. 
Using the engineering principles have also enlightened me on how to handle error messages, how to structure my folder and how not to over engineer features that will not be useful. 
Additionally, I have learnt how to build in phases rather than just pushing all my propmt to the AI agent at once. 







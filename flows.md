Create account flow:
1. User enter fullname and email
2. Check if user already exist using email (we will use this to identify to whether if we need to document this user or not)
3. Send OTP to email
4. This will send a secret key for creating a new session
5. Create a new user document if this user is a new user
6. Return the users accountId  that will be used to complete the login
7. Verify OTP and authenticate to login
# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - link "🌾Farmers Market" [ref=e5]:
      - /url: /
    - heading "Welcome Back" [level=1] [ref=e6]
    - paragraph [ref=e7]: Sign in to your account to continue
  - generic [ref=e8]:
    - generic [ref=e9]:
      - generic [ref=e10]:
        - text: Email Address
        - textbox "Email Address" [ref=e11]:
          - /placeholder: you@example.com
          - text: ana.romana@email.com
      - generic [ref=e12]:
        - text: Password
        - textbox "Password" [ref=e13]:
          - /placeholder: ••••••••
          - text: FarmLife2024!
      - generic [ref=e14]:
        - generic [ref=e15]:
          - checkbox "Remember me" [ref=e16]
          - text: Remember me
        - link "Forgot password?" [ref=e17]:
          - /url: /auth/forgot-password
      - button "Sign In" [ref=e18]
    - generic [ref=e20]: New to Farmers Market?
    - link "Create an Account" [ref=e22]:
      - /url: /signup
  - link "← Back to Home" [ref=e24]:
    - /url: /
```
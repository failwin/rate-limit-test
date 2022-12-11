### Assessment

A bank wants to reduce brute force attacks by adding rate limiting on the login page. However, they also want to see how many requests have been made by each IP in the last 60 seconds.

What you need to provide:
1. An expressjs/nestjs project where it has a route POST /login
2. The /login route needs to have a rate limiter (do not use existing modules) - max 5 req in a 10 minutes timeframe.
   a. If the user made more than 5 req within 10 minutes, return status code 429

BONUS: Print in the console every 60 seconds how many requests have been made by each IP in the last 60 seconds

Please do not use an existing rate limiter module.

### Installation

```bash
$ npm install
```

### Running the app

```bash
$ npm run start

Make POST to http://localhost:3000/login
```

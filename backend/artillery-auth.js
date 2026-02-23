module.exports = {
  setUserAuth: (context, events, done) => {
    const userId = context.vars.$scenarioId;
    context.vars.username = `loadtest_${userId}`;
    context.vars.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NjAwMDAwMDAwMDAwMDAwMDAwMDMiLCJ1c2VybmFtZSI6InJvaGFuX3RlY2giLCJpYXQiOjE3NzE3NDIwNTUsImV4cCI6MTc3MTc0NTY1NX0.87mIheFOlp3gGIxxYTIoPRPD2KPGlzB-1qg9dhgWBHo"; // Your actual token logic here
    return done();
  }
};

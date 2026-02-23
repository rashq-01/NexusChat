module.exports = {
  authenticate: function (context, events, done) {
    const username = "loadtest_" + Math.floor(Math.random() * 100000);

    // ⭐ MUST be this exact structure
    context.socketio = {
      auth: {
        username: username
      }
    };

    return done();
  }
};
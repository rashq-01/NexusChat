const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // Server-side logging (important for NexusChat)
    console.error({
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
    });

    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "Internal Server Error" : err.message
    });
};

module.exports = {errorHandler};
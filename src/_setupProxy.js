import proxy from 'http-proxy-middleware';

module.exports = function(app) {
    const headers  = {
        "Content-Type": "application/json",
    }
    app.use(proxy("/process/", { target: "https://localhost:8080/",changeOrigin: true,secure: false,headers: headers}));
};
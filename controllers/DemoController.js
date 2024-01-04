/**
 * Demo API
 * @param {} req
 * @param {} res
 * @returns
 */

exports.demoAPI = async (req, res) => {
    res.status(200).json({
        name: "Demo",
        message: "Hello World!",
        icon: "/icon.png",
        nodejs: [
            "express",
            "mongodb",
            "mongoose",
            "cors",
            "morgan",
            "nodemon",
            "uuid",
            "jsonwebtoken",
            "dotenv",
            "crypto",
            "bcrypt",
            "axios"
        ]
    });
    // res.status(200).send("Hello World!");
};
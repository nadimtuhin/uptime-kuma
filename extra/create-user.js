console.log("== Uptime Kuma Create Additional User Tool ==");

const { passwordStrength } = require("check-password-strength");
const Database = require("../server/database");
const passwordHash = require("../server/password-hash");
const { R } = require("redbean-node");
const readline = require("readline");
const User = require("../server/model/user");
const args = require("args-parser")(process.argv);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const main = async () => {
    console.log("Connecting the database");
    Database.init(args);
    await Database.connect(false, false, true);

    try {
        // No need to actually create user for testing, just make sure no connection problem. It is ok for now.
        if (!process.env.TEST_BACKEND) {
            while (true) {
                let username = await question("Username: ");
                if (!username) {
                    console.log('Username is required');
                    continue;
                }

                let password = await question("Password: ");
                let confirmPassword = await question("Confirm Password: ");
                if (password !== confirmPassword) {
                    console.log("Passwords do not match, please try again.");
                    continue;
                }

                if (passwordStrength(password).value === "Too weak") {
                    throw new Error("Password is too weak. It should contain alphabetic and numeric characters. It must be at least 6 characters in length.");
                }

                let user = R.dispense("user");
                user.username = username;
                user.password = passwordHash.generate(password);
                await R.store(user);
                break;
            }
            console.log("User created successfully.");
        }
    } catch (e) {
        console.error("Error: " + e.message);
    }

    await Database.close();
    rl.close();

    console.log("Finished.");
};

/**
 * Ask question of user
 * @param {string} question Question to ask
 * @returns {Promise<string>} Users response
 */
function question(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

if (!process.env.TEST_BACKEND) {
    main();
}

module.exports = {
    main,
};

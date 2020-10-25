const User = require("../models/user")
const shortId = require('shortid')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const Blog = require("../models/blog")
const { errorHandler } = require('../helpers/dbErrorHandler');
const _ = require('lodash')
const { OAuth2Client } = require('google-auth-library')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.preSignup = (req, res) => {
    const { email, name, password } = req.body;
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is already existed'
            })
        }

        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '1d' })

        const emailData = {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: `SEOBLOG activation account link`,
            html: `
            <h4>Please use the following link to activate your account</h4>
            <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
            <hr/>
            <p>This email contain sensitive information</p>
            <p>http</p>
            `
        }

        sgMail.send(emailData)
            .then(sent => {
                return res.json({
                    message: `Email has been sent to ${email}, please follow the instruction`
                })
            }).catch(err => {
                console.log(err);
            })
    })

}

// exports.signup = (req, res) => {
//     User.findOne({ email: req.body.email }).exec((err, user) => {
//         if (user) {
//             return res.status(400).json({ error: 'Email is already taken.' })
//         }

//         const { name, email, password } = req.body
//         let username = shortId.generate()
//         let profile = `${process.env.CLIENT_URL}/profile/${username}`

//         let newUser = new User({ name, email, password, profile, username });
//         newUser.save((err, success) => {
//             if (err)
//                 return res.status(422).json({ error: err })
//             res.json({
//                 message: "Sign up success. Please sign in!"
//             })
//             // res.json({
//             //     user: success
//             // })
//         })
//     })
// }

exports.signup = (req, res) => {
    const token = req.body.token;
    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    error: 'Expired link. Signup again'
                });
            }

            const { name, email, password } = jwt.decode(token);

            let username = shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;

            const user = new User({ name, email, password, profile, username });
            user.save((err, user) => {
                if (err) {
                    return res.status(401).json({
                        error: errorHandler(err)
                    });
                }
                return res.json({
                    message: 'Singup success! Please signin'
                });
            });
        });
    } else {
        return res.json({
            message: 'Something went wrong. Try again'
        });
    }
};

exports.signin = (req, res) => {
    const { email, password } = req.body;
    // check if user exist
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist. Please signup.'
            });
        }
        // authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and password do not match.'
            });
        }
        // generate a token and send to client
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { expiresIn: '1d' });
        const { _id, username, name, email, role } = user;
        return res.json({
            token,
            user: { _id, username, name, email, role }
        });
    });
};


exports.signin = async (req, res) => {
    const { email, password } = req.body

    await User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(422).json({ error: "User is not existed" })
        }

        if (!user.authenticate(password)) {
            return res.status(422).json({ error: "Email and password do not match" })
        }
        //gernerate token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '10s' })
        res.cookie('token', token, { expiresIn: '10s' })
        const { _id, username, name, email, role } = user
        return res.json({
            token,
            user: { _id, username, name, email, role }
        })
    })
}

exports.signout = (req, res) => {
    res.clearCookie('token')
    res.json({ message: "Sign out success" })
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
});


exports.authMiddleware = async (req, res, next) => {
    const authUserId = req.user._id
    await User.findById({ _id: authUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(422).json({ error: "User not found" })
        }
        req.profile = user
        next()
    })
}

exports.audminMiddleware = async (req, res, next) => {
    const adminUserId = req.user._id
    await User.findById({ _id: adminUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(422).json({ error: "User not found" })
        }

        if (user.role !== 1) {
            return res.status(422).json({ error: "Admin resources. Access denied" })
        }
        req.profile = user
        next()
    })
}

exports.canUpdateDeleteBlog = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: err
            })
        }

        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString()
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'You are not authorized'
            })
        }
        next()
    })
}


exports.forgotPassword = (req, res) => {
    const { email } = req.body

    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User is not existed'
            })
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' })

        const emailData = {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: `SEOBLOG password reset link`,
            html: `
            <h4>Please use the following link to reset your password</h4>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr/>
            <p>This email contain sensitive information</p>
            <p>http</p>
            `
        }

        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.json({ error: errorHandler(err) })
            } else {
                sgMail.send(emailData).then(sent => {
                    return res.json({
                        message: `Email has been sent to ${email}. Follow the instruction to reset your password'`
                    })
                }).catch(err => {
                    return res.json({
                        error: errorHandler(err)
                    })
                })
            }
        })
    })

}


exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    error: 'Expired link. Try again'
                });
            }
            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(401).json({
                        error: 'Something went wrong. Try later'
                    });
                }
                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                };

                user = _.extend(user, updatedFields);

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json({
                        message: `Great! Now you can login with your new password`
                    });
                });
            });
        });
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
    const idToken = req.body.tokenId;
    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then(response => {
        // console.log(response)
        const { email_verified, name, email, jti } = response.payload;
        if (email_verified) {
            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    // console.log(user)
                    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                    res.cookie('token', token, { expiresIn: '1d' });
                    const { _id, email, name, role, username } = user;
                    return res.json({ token, user: { _id, email, name, role, username } });
                } else {
                    let username = shortId.generate();
                    let profile = `${process.env.CLIENT_URL}/profile/${username}`;
                    let password = jti;
                    user = new User({ name, email, profile, username, password });
                    user.save((err, data) => {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }
                        const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                        res.cookie('token', token, { expiresIn: '1d' });
                        const { _id, email, name, role, username } = data;
                        return res.json({ token, user: { _id, email, name, role, username } });
                    });
                }
            });
        } else {
            return res.status(400).json({
                error: 'Google login failed. Try again.'
            });
        }
    });
};








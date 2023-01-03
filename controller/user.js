// Require Main Modules..
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Require Post Schema from Model..
const User = require('../models/user');


/**
 * User Registration
 * User Login
 */


exports.userRegistrationDefault = async (req, res, next) => {
    const errors = validationResult(req);
    // Check Input validation Error with Error Handler..
    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    try {
        const bodyData = req.body;
        let query;
        let token;

        
        query = {username: bodyData.email}
        

        const userExists = await User.findOne(query).lean();

        if (userExists) {
            res.status(200).json({
                message: `A user with this ${bodyData.email} no already registered!`,
                success: false
            });
        } else {
            const password = bodyData.password;
            const hashedPass = bcrypt.hashSync(password, 8);
            const registrationData = {...bodyData, ...{password: hashedPass}}
            const user = new User(registrationData);

            const newUser = await user.save();

            token = jwt.sign({
                    username: newUser.username,
                    userId: newUser._id
                },
                process.env.JWT_PRIVATE_KEY, {
                    expiresIn: '7d'
                }
            );

            res.status(200).json({
                message: 'Login Success',
                success: true,
                token: token,
                expiredIn: 604800
            })
        }

    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}


// Login User..
exports.userLoginDefault = async (req, res, next) => {

    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(email, password);
        let loadedUser;
        let token;
        const user = await User.findOne({email: email})

        if (!user) {
            res.status(200).json({
                message: 'A User with this phone or email no could not be found!',
                success: false
            });
        } else if (user.hasAccess === false) {
            res.status(200).json({
                message: 'Ban! Your account has been banned',
                success: false
            });
        } else {
            loadedUser = user;
            const isEqual = await bcrypt.compareSync(password, user.password);
            if (!isEqual) {
                res.status(200).json({
                    message: 'You entered a wrong password!',
                    success: false
                });
            } else {
                token = jwt.sign({
                        username: loadedUser.username,
                        userId: loadedUser._id
                    },
                    process.env.JWT_PRIVATE_KEY, {
                        expiresIn: '7d'
                    }
                );
                res.status(200).json({
                    success: true,
                    message: 'Welcome back. Login Success',
                    token: token,
                    expiredIn: 604800
                })
            }

        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}

exports.getLoginUserInfo = async (req, res, next) => {
    try {
        const loginUserId = req.userData.userId;
        const selectString = req.query.select;

        let user;

        if (selectString) {
            user = User.findById(loginUserId).select(selectString)
        } else {
            user = User.findById(loginUserId).select('-password')
        }
        const data = await user;

        res.status(200).json({
            data: data,
            message: 'Successfully Get user info.'
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.getUserLists = async (req, res, next) => {
    try {

        const paginate = req.body.paginate;
        const filter = req.body.filter;

        const select = req.query.select;
        let query;

        if (filter) {
            query = User.find(filter);
        } else {
            query = User.find();
        }

        if (paginate) {
            query.skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1)).limit(Number(paginate.pageSize))
        }

        const count = await User.countDocuments(filter ? filter : {});
        const data = await query.sort({createdAt: -1}).select(select ? select : '');


        res.status(200).json({
            count: count,
            data: data
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getUserByUserId = async (req, res, next) => {

    try {

        const userId = req.params.userId;
        const user = await User.findOne({_id: userId})
        .populate({ path: 'carts -_id', populate: { path: 'product', select: 'productName sku productSlug categorySlug price discountType discountAmount  quantity images' } })
        .populate(
            {
                path: 'wishlists -_id',
                populate: {
                    path: 'product',
                    select: 'productName sku productSlug categorySlug brandSlug price discountType discountAmount  quantity images'
                }
            })

        res.status(200).json({
            data: user,

        });
    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}



exports.getUserList = async (req, res, next) => {
    try {

        const user = await User.find().select('_id name email');
        res.status(200).json({
            data: user
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.fbLogin = async (req, res, next) => {

    try {
        const bodyData = req.body;
        const user = new User(bodyData);
        let token;

        const userExists = await User.findOne({ name: bodyData.name}).lean();

        if (userExists) {
            // When User Already Exists
            token = jwt.sign({
                    username: userExists.username,
                    userId: userExists._id
                },
                process.env.JWT_PRIVATE_KEY, {
                    expiresIn: '7d'
                }
            );

            res.status(200).json({
                message: 'Login Success',
                success: true,
                token: token,
                expiredIn: 604800
            })
            console.log('User Already Exists', token);
        } else {
            // When User Not Exists
            const newUser = await user.save();

            token = jwt.sign({
                    username: newUser.username,
                    userId: newUser._id
                },
                process.env.JWT_PRIVATE_KEY, {
                    expiresIn: '7d'
                }
            );

            res.status(200).json({
                message: 'Login Success',
                success: true,
                token: token,
                expiredIn: 604800
            })
        }

    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}





// test api...
exports.test = async (req, res, next) => {
    console.log(req.body);
    return res.status(200).json({
        message: 'test',
        data: req.body
    })
}


const { body } = require('express-validator');

const userValidationRules = () => {
    return [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('first_name').trim().notEmpty(),
        body('last_name').trim().notEmpty(),
        body('role').isIn(['admin', 'camper'])
    ];
};

const camperValidationRules = () => {
    return [
        body('title').trim().notEmpty(),
        body('description').trim().notEmpty(),
        body('about').trim().notEmpty(),
        body('main_video_url').isURL().optional({ nullable: true })
    ];
};

module.exports = {
    userValidationRules,
    camperValidationRules
}; 
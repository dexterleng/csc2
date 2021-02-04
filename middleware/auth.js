module.exports = (premiumOnly = false) => (req, res, next) => {
    if (!res.locals.user) {
        return res.status(401).send({
            'message': 'You are not authorized to access this resource.'
        });
    }

    if (premiumOnly) {
        if (!res.locals.user.type) {
            return res.status(401).send({
                'message': 'You are not authorized to access this resource.'
            });
        }

        if (res.locals.user.type !== 'premium') {
            return res.status(401).send({
                'message': 'You are not authorized to access this resource.'
            });
        }
    }

    next();
}

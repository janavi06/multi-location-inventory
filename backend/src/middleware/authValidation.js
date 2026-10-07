const validateRegister = (req, res, next) => {
    const {
        name,
        email,
        password,
        locationId
    } = req.body;

    if (typeof name !== 'string') {
        return res.status(400).json({
            message: "Name must be a string"
        })
    }

    if (name.trim() === "") {
        return res.status(400).json({
            message: "Name cannot be empty"
        })
    }

    if (typeof email !== 'string') {
        return res.status(400).json({
            message: "Email must be a string"
        })
    }

    if (email.trim() === "") {
        return res.status(400).json({
            message: "Email cannot be empty"
        })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            message: "Invalid email format"
        })
    }

    if (typeof password !== "string") {
        return res.status(400).json({
            message: "Password must be a string"
        });
    }

     if (password.trim() === "") {
        return res.status(400).json({
            message: "Password cannot be empty"
        })
    }

    if (password.length < 8){
        return res.status(400).json({
            message: "Password must be atleast 8 characters"
        })
    }

    if (
    locationId !== undefined &&
    !(Number.isInteger(locationId) && locationId > 0)
) {
    return res.status(400).json({
        message: "locationId must be a positive integer"
    });
}

next();




};


const validateLogin = (req, res, next) => {

    const { email, password } = req.body;

    if (!typeof email !== "string"){
        return res.status(400).json({
            message: "Email must be string"
        })
    }

    if (email.trim() === "") {
    return res.status(400).json({
        message: "Email cannot be empty"
    });
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
        message: "Invalid email format"
    });
}

if (typeof password !== "string") {
    return res.status(400).json({
        message: "Password must be a string"
    });
}

if (password.trim() === "") {
    return res.status(400).json({
        message: "Password cannot be empty"
    });
}

next();

};

export { validateRegister,validateLogin }
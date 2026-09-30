
const valdiateId = (req,res,next) => {

    const id = Number(req.params.id);

    if (!(Number.isInteger(id) && id > 0)){
        return res.status(400).json({
            message: "id must be a positive integer"
        })
    }
    next();
}

export {valdiateId};
import { getUsers, getUserById, updateUser } from "../services/userService.js";
import asyncHandler from "../utils/asyncHandler.js";


const getUsersController = asyncHandler(async (req, res) => {

    const users = await getUsers();

    return res.status(200).json(users);

});

const getUserByIdController = asyncHandler (async (req,res) => {
    const{id} = req.params;

    const user = await getUserById(id);

    return res.status(200).json(user);
});

const updateUserController = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
        name,
        role,
        locationId,
        isActive
    } = req.body;

    const user = await updateUser(
        id,
        name,
        role,
        locationId,
        isActive
    );

    return res.status(200).json(user);
});

export {
    getUsersController,
    getUserByIdController,
    updateUserController
};
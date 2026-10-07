import { createOrder, getOrderById,
    getOrders, cancelOrder,confirmOrder

 } from "../services/orderService.js";

const createOrderController = async (req, res) => {
    const {locationId, items} = req.body;

    const order = await createOrder(locationId, items);

    res.status(201).json(order);
};

const getOrderByIdController = async (req, res) => {
    const { id } = req.params;

    const order = await getOrderById(
        id,
        req.user.locationId,
        req.user.role
    );

    res.status(200).json(order);
};

const getOrdersController = async (req, res) => {
    const orders = await getOrders(
        req.user.locationId,
        req.user.role
    );

    res.status(200).json(orders);
};

const cancelOrderController = async (req, res) => {
    const {id} = req.params;

    const result = await cancelOrder(id, 
        req.user.locationId,
        req.user.role
    );

    res.status(200).json(result);
   
};

const confirmOrderControler = async (req,res) => {
    
    const {id} = req.params;

    const order = await confirmOrder(
        id,
        req.user.locationId,
        req.user.role
    );

    return res.status(200).json(order);
}

export {createOrderController,
    getOrderByIdController,
    getOrdersController,
    cancelOrderController,
    confirmOrderControler

};
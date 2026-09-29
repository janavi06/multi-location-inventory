import { createOrder, getOrderById,
    getOrders, cancelOrder,

 } from "../services/orderService.js";

const createOrderController = async (req, res) => {
    const {locationId, items} = req.body;

    const order = await createOrder(locationId, items);

    res.status(201).json(order);
};

const getOrderByIdController = async (req,res) => {
    const {id} = req.params;
    
    const order = await getOrderById(id);

    res.status(200).jon(order);
}

const getOrdersController = async (req,res) => {
    const orders = await getOrders();

    res.status(200).json(orders);
}

const cancelOrderController = async (req, res) => {
    const {id} = req.params;

    const result = await cancelOrder(id);

    res.status(200).json(result);
   
}

export {createOrderController,
    getOrderByIdController,
    getOrdersController,
    cancelOrderController,

};
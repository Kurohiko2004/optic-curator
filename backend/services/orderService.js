const db = require('../models/index.js');
const { getPagination, getPagingData } = require('../utils/paginationUtil.js');


/**
 * Xử lý giao dịch Đặt Hàng từ Giỏ hàng.
 * @param {number} userId 
 * @param {object} orderDetails Gồm: recipientName, phoneNumber, shippingAddress, paymentMethod
 * @returns {object} Order đã được tạo thành công
 */
const createOrderFromCart = async (userId, orderDetails) => {
    console.time("insert");
    const t = await db.sequelize.transaction();

    try {
        // 1. Lấy thông tin giỏ hàng của User
        const cart = await db.Cart.findOne({
            where: { userId },
            include: [
                {
                    model: db.CartItem,
                    as: 'cartItems',
                    include: [{ model: db.Glasses, as: 'glasses' }]
                }
            ],
            transaction: t
        });

        if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
            let error = new Error('Giỏ hàng trống');
            error.statusCode = 400;
            throw error;
        }

        // 2. Tính lại tổng tiền và tái kiểm tra tồn kho
        let totalPrice = 0;
        for (const item of cart.cartItems) {
            const currentStock = item.glasses.stock;
            if (item.quantity > currentStock) {
                let error = new Error(`Kính "${item.glasses.name}" chỉ còn ${currentStock} cái trong kho, không đủ đáp ứng.`);
                error.statusCode = 400;
                throw error;
            }
            totalPrice += parseFloat(item.glasses.price) * item.quantity;
        }

        // 3. Tạo bản ghi Đơn Hàng (Order)
        const order = await db.Order.create({
            userId: userId,
            totalPrice: totalPrice,
            status: 'PENDING',
            paymentMethod: orderDetails.paymentMethod || 'COD',
            paymentStatus: 'PENDING',
            recipientName: orderDetails.recipientName,
            phoneNumber: orderDetails.phoneNumber,
            shippingAddress: orderDetails.shippingAddress
        }, { transaction: t });

        // 4. Tạo chi tiết đơn hàng (OrderItems) và khấu trừ kho (deduct stock)
        for (const item of cart.cartItems) {
            await db.OrderItem.create({
                orderId: order.id,
                glassesId: item.glassesId,
                quantity: item.quantity,
                priceAtPurchase: item.glasses.price // Lưu lại giá trị lúc mua để khỏi bị ảnh hưởng nếu sản phẩm đổi giá sau này
            }, { transaction: t });

            // Khấu trừ hàng tồn kho
            item.glasses.stock -= item.quantity;
            await item.glasses.save({ transaction: t });
        }

        // 5. Làm rỗng giỏ hàng (Clear Cart)
        // Chúng ta xóa đi tất cả CartItem thuộc cái cart này
        await db.CartItem.destroy({
            where: { cartId: cart.id },
            transaction: t
        });

        // Nếu mọi thứ trơn tru, Commit Database (chính thức ghi vào DB)
        await t.commit();

        console.timeEnd("insert");
        return order;

    } catch (error) {
        // Có bất kỳ lỗi gì: Hết hàng, Lỗi mất mạng khi query DB,... -> Rollback!
        await t.rollback();
        throw error;
    }
};

const getUserOrders = async (userId, page, items) => {
    const { limit, offset, currentPage } = getPagination(page, items);

    const dbResult = await db.Order.findAndCountAll({
        where: { userId },
        include: [
            {
                model: db.OrderItem,
                as: 'orderItems',
                include: [
                    {
                        model: db.Glasses,
                        as: 'glasses',
                        attributes: ['id', 'name', 'image']
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
    });

    return getPagingData(dbResult, currentPage, limit);
};

module.exports = {
    createOrderFromCart,
    getUserOrders
};

// __mocks__/razorpay.ts
const orders = {
  create: jest.fn().mockResolvedValue({
    id: 'order_123',
    amount: 50000,
    currency: 'INR',
    receipt: 'receipt#1',
    status: 'created',
  }),
};

const Razorpay = jest.fn().mockImplementation(() => ({
  orders,
}));

export = Razorpay;

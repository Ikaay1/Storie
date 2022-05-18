import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import StripeCheckout from "react-stripe-checkout";
import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiOutlineLeft,
  AiOutlineShopping,
} from "react-icons/ai";
import { TiDeleteOutline } from "react-icons/ti";
import toast from "react-hot-toast";

import { useStateContext } from "../context/StateContext";
import { urlFor } from "../lib/client";
import getStripe from "../lib/getStripe";

const Cart = () => {
  const cartRef = useRef();
  const router = useRouter();
  const {
    totalPrice,
    totalQuantities,
    cartItems,
    setShowCart,
    toggleCartItemQuanitity,
    onRemove,
    cart,
    price,
    quantities,
    setCart,
    setPrice,
    setQuantities,
  } = useStateContext();
  const [stripeToken, setStripeToken] = useState(null);
  const [loading, setLoading] = useState(null);
  console.log(cart);
  const onToken = (token) => {
    price && setStripeToken(token);
  };

  let q;
  let p;
  let c;
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
      localStorage.setItem("price", JSON.stringify(totalPrice));
      localStorage.setItem("quantities", JSON.stringify(totalQuantities));
      console.log("not first");
    } else {
      console.log("first");
    }
  }, [cartItems, totalPrice, totalQuantities]);

  useEffect(() => {
    if (isMounted.current) {
      c = JSON.parse(localStorage.getItem("cart"));
      q = JSON.parse(localStorage.getItem("quantities"));
      p = JSON.parse(localStorage.getItem("price"));
      setCart(c);
      setPrice(p);
      setQuantities(q);
    } else {
      isMounted.current = true;
      console.log("first2");
    }
  }, [cartItems, totalPrice, totalQuantities]);

  useEffect(() => {
    const makeRequest = () => {
      axios
        .post("/api/stripe", {
          tokenId: stripeToken?.id,
          amount: price * 100,
        })
        .then((res) => {
          setLoading(false);
          router.push("/success");
        })
        .catch((err) => {
          console.log(err);
        });
      setLoading(true);
    };
    stripeToken && makeRequest();
  }, [stripeToken]);

  if (loading) {
    return (
      <div className="process">
        <h2>Processing your request...</h2>
      </div>
    );
  }

  return (
    <div className="cart-wrapper" ref={cartRef}>
      <div className="cart-container">
        <button
          type="button"
          className="cart-heading"
          onClick={() => setShowCart(false)}
        >
          <AiOutlineLeft />
          <span className="heading">Your Cart</span>
          <span className="cart-num-items">({quantities} items)</span>
        </button>

        {cart.length < 1 && (
          <div className="empty-cart">
            <AiOutlineShopping size={150} />
            <h3>Your shopping bag is empty</h3>
            <Link href="/">
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="btn"
              >
                Continue Shopping
              </button>
            </Link>
          </div>
        )}

        <div className="product-container">
          {cart.length >= 1 &&
            cart.map((item) => (
              <div className="product" key={item._id}>
                <img
                  src={urlFor(item?.image[0])}
                  className="cart-product-image"
                />
                <div className="item-desc">
                  <div className="flex top">
                    <h5>{item.name}</h5>
                    <h4>${item.price}</h4>
                  </div>
                  <div className="flex bottom">
                    <div>
                      <p className="quantity-desc">
                        <span
                          className="minus"
                          onClick={() =>
                            toggleCartItemQuanitity(item._id, "dec")
                          }
                        >
                          <AiOutlineMinus />
                        </span>
                        <span className="num">{item.quantity}</span>
                        <span
                          className="plus"
                          onClick={() =>
                            toggleCartItemQuanitity(item._id, "inc")
                          }
                        >
                          <AiOutlinePlus />
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => onRemove(item)}
                    >
                      <TiDeleteOutline />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {cart.length >= 1 && (
          <div className="cart-bottom">
            <div className="total">
              <h3>Subtotal:</h3>
              <h3>${price}</h3>
            </div>
            <div className="btn-container">
              <StripeCheckout
                name="Storie"
                image="/favicon.ico"
                billingAddress
                shippingAddress
                description={`Your total is $${price}`}
                amount={price * 100}
                token={onToken}
                stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
              >
                <button type="button" className="btn">
                  Pay with Stripe
                </button>
              </StripeCheckout>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

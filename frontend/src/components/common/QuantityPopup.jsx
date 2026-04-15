import React, { useEffect, useState } from 'react';

const QuantityPopup = ({
  isOpen,
  initialQuantity = 1,
  max = 99,
  onConfirm,
  onCancel,
  title = 'Quantity',
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity);
    }
  }, [isOpen, initialQuantity]);

  if (!isOpen) {
    return null;
  }

  const changeQuantity = (value) => {
    const next = Number(value);
    if (Number.isNaN(next)) {
      return;
    }
    setQuantity(Math.max(1, Math.min(max, next)));
  };

  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => setQuantity((prev) => Math.min(max, prev + 1));

  return (
    <div className="popup-overlay" onClick={onCancel}>
      <div className="popup-card glass-morphism" onClick={(e) => e.stopPropagation()}>
        <h3 className="popup-title">{title}</h3>
        <p className="popup-description">Choose the quantity to add to your cart.</p>
        <div className="quantity-control">
          <button type="button" className="quantity-button" onClick={handleDecrease}>
            -
          </button>
          <input
            type="number"
            min="1"
            max={max}
            value={quantity}
            onChange={(e) => changeQuantity(e.target.value)}
          />
          <button type="button" className="quantity-button" onClick={handleIncrease}>
            +
          </button>
        </div>
        <div className="popup-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="button-primary" onClick={() => onConfirm(quantity)}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantityPopup;

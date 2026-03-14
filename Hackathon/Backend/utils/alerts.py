import logging

# Configure logger
logger = logging.getLogger("low_stock_alert")
logger.setLevel(logging.INFO)

# Create console handler with a specific format
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(message)s') # Keep it simple for the colored output
ch.setFormatter(formatter)
logger.addHandler(ch)

async def send_low_stock_alert(product_name: str, sku: str, current_qty: float, reorder_level: float):
    """
    Simulates sending a low stock alert email.
    Uses ANSI escape codes for colored terminal output.
    """
    # ANSI escape code for red text: \033[91m, reset: \033[0m
    # ANSI escape code for yellow text: \033[93m
    # ANSI escape code for bold: \033[1m
    
    alert_msg = f"\033[91m\033[1m[ALERT] Low Stock Warning for {product_name} ({sku})! Current: {current_qty}, Threshold: {reorder_level}\033[0m"
    email_payload = (
        f"\033[93m"
        f"--- MOCK EMAIL PAYLOAD ---\n"
        f"To: Inventory Manager <manager@example.com>\n"
        f"Subject: Low Stock Action Required: {product_name}\n"
        f"Body: The stock for {product_name} ({sku}) has dropped to {current_qty}, which is at or below the reorder level of {reorder_level}.\n"
        f"Please initiate a restock operation immediately.\n"
        f"--------------------------\033[0m"
    )
    
    logger.info(alert_msg)
    logger.info(email_payload)

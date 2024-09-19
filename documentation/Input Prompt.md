# Product Requirements Document (PRD)

## 1. Introduction

### 1.1 Purpose

The purpose of this document is to outline the requirements for developing a web-based Inventory Management and Fulfillment Application for an e-commerce store that operates on Shopify. This PRD provides detailed specifications to guide the development team in building a system that efficiently manages inventory and streamlines the order fulfillment process.

### 1.2 Overview

The application aims to connect seamlessly with the Shopify store to:

- Pull all unfulfilled orders.
- Determine which orders can be fulfilled based on available inventory.
- Facilitate the fulfillment process with barcode scanning and shipping label generation via Sendle API.
- Manage inventory through barcode scanning and manual entry.
- Update Shopify orders upon fulfillment and adjust inventory accordingly.

---

## 2. Objectives and Goals

- **Efficient Order Management:** Automate the process of sorting unfulfilled orders based on inventory availability.
- **Streamlined Fulfillment:** Simplify the fulfillment process using barcode scanning and automate shipping label generation.
- **Robust Inventory Management:** Provide tools for easy inventory updates through scanning and manual entry.
- **Integration with Existing Systems:** Seamlessly integrate with Shopify and Sendle APIs.
- **User-Friendly Interface:** Offer an intuitive web application that enhances productivity.

---

## 3. Functional Requirements

### 3.1 User Authentication and Authorization

- **Login System:** Secure login for authorized personnel.
- **User Roles:** Differentiate access levels if necessary (e.g., admin, warehouse staff).

### 3.2 Dashboard

- **Overview:** Display summary metrics such as total unfulfilled orders, orders that can/cannot be fulfilled, and current inventory levels.

### 3.3 Order Management

### 3.3.1 Unfulfilled Orders Tab

- **Order Listing:** Display all unfulfilled orders sorted by date from oldest to newest.
- **Order Details:** Show order number, customer name, order date, and items ordered.

### 3.3.2 Orders That Can Be Fulfilled Tab

- **Fulfillable Orders:** List orders that can be fulfilled based on current inventory.
- **Fulfill Button:** Next to each order, provide a "Fulfill" button.
- **Order Processing Logic:**
    - Iterate through unfulfilled orders in the order they were received.
    - For each order, check if sufficient inventory is available.
    - If yes, add to the "Orders That Can Be Fulfilled" list and decrement the inventory accordingly.
    - Continue the process for subsequent orders.

### 3.3.3 Orders That Cannot Be Fulfilled Tab

- **Unfulfillable Orders:** List orders that cannot be fulfilled due to insufficient inventory.
- **Export Functionality:**
    - Provide an "Export" button to download a CSV file.
    - CSV should include:
        - Barcode number
        - Product name
        - Size
        - Color
        - Total quantity needed per SKU from all unfulfillable orders.

### 3.4 Order Fulfillment Process

- **Fulfillment Modal:** When the "Fulfill" button is clicked:
    - Open a modal window displaying the items in the order.
    - Allow barcode scanning for each item.
    - After scanning an item:
        - Check off the item with a green checkmark.
        - Validate the scanned barcode against the order details.
        - Display error messages if:
            - An item is scanned more times than ordered.
            - A wrong item is scanned.
    - Enable the "Fulfill Order" button only after all items are correctly scanned.
- **Shipping Label Generation:**
    - Upon clicking "Fulfill Order," use the Sendle API to create a shipping label.
    - Display or provide an option to print the shipping label.
- **Shopify Order Update:**
    - Mark the order as fulfilled in Shopify via API.
    - Add the tracking number to the Shopify order.
- **Inventory Adjustment:**
    - Decrement the inventory quantities based on the items in the fulfilled order.

### 3.5 Inventory Management

### 3.5.1 Inventory Intake

- **Barcode Scanning:** Allow users to add inventory by scanning barcodes of received items.
- **Manual Entry:** Provide an option to manually enter:
    - Barcode number
    - Quantity to add
- **Bulk Addition:** Support bulk addition of multiple SKUs and quantities.

### 3.5.2 Inventory Overview

- **Inventory Listing:** Display a list of all inventory items.
- **Filtering and Searching:**
    - Filter inventory by product name, size, color, and quantity.
    - Search functionality for quick lookup.
- **Inventory Details:** Show barcode number, product name, size, color, and available quantity.

### 3.6 Error Handling

- **User Notifications:**
    - Provide clear error messages for any issues during scanning, fulfillment, or inventory updates.
- **System Logging:**
    - Log errors for debugging purposes.
    - Capture API call failures, scanning errors, and inventory discrepancies.
- **Retry Mechanisms:**
    - Implement retries for transient errors, especially with API calls.

### 3.7 Integration with APIs

### 3.7.1 Shopify API Integration

- **Order Retrieval:** Fetch unfulfilled orders.
- **Order Updates:** Update order status to fulfilled and add tracking information.

### 3.7.2 Sendle API Integration

- **Shipping Label Creation:** Generate shipping labels upon order fulfillment.
- **Error Handling:** Manage API rate limits and handle any API errors gracefully.

---

## 4. Non-functional Requirements

### 4.1 Performance

- **Responsiveness:** The application should load pages within 2 seconds.
- **Scalability:** Design the system to handle growth in orders and inventory size.

### 4.2 Security

- **Data Protection:** Secure all data in transit and at rest.
- **Authentication:** Implement secure authentication mechanisms.
- **Authorization:** Ensure users have access only to permitted features.

### 4.3 Usability

- **User Interface:** Design an intuitive and user-friendly interface.
- **Accessibility:** Follow accessibility best practices to accommodate all users.

### 4.4 Reliability

- **Uptime:** Ensure high availability of the application.
- **Error Recovery:** The system should recover gracefully from failures.

---

## 5. System Architecture

### 5.1 High-Level Overview

- **Frontend:** Web application built with modern JavaScript frameworks (e.g., React, Angular, or Vue.js).
- **Backend:** RESTful API built with Node.js, Python (Django/Flask), or similar.
- **Database:** PostgreSQL for data storage.
- **Hosting:** Deployed on AWS EC2 instances.
- **APIs:**
    - Shopify API for order management.
    - Sendle API for shipping label generation.

---

## 6. Technical Requirements

### 6.1 Technologies

- **Frontend:** HTML5, CSS3, JavaScript, and a frontend framework.
- **Backend:** Server-side language (e.g., Node.js, Python) and framework.
- **Database:** PostgreSQL.
- **Hosting:** AWS EC2, with potential use of AWS RDS for the database.
- **Barcode Scanning:** integrate with hardware scanners.

### 6.2 APIs and SDKs

- **Shopify API:**
    - Use latest stable version.
    - Authentication via API keys or OAuth as required.
- **Sendle API:**
    - Follow Sendle's integration guidelines.
    - Handle API keys securely.

---

## 7. User Interface Requirements

### 7.1 General Layout

- **Navigation Menu:** Accessible tabs for Unfulfilled Orders, Orders That Can Be Fulfilled, Orders That Cannot Be Fulfilled, and Inventory Management.
- **Consistent Design:** Maintain a consistent look and feel across all pages.

### 7.2 Responsive Design

- **Device Compatibility:** Optimize for desktop browsers

---

## 8. API Integration Details

### 8.1 Shopify API

- **Endpoints Needed:**
    - Retrieve unfulfilled orders
    - Update order status
- **Rate Limits:** Be aware of Shopify's API call limits and implement throttling if necessary.

### 8.2 Sendle API

- **Endpoints Needed:**
    - Create shipping label: As per Sendle's documentation.
- **Authentication:** Securely store and use API credentials.
- **Error Handling:** Implement handling for common API errors.

---

## 10. Inventory Management Details

### 10.1 Inventory Adjustment Rules

- **Receiving Inventory:**
    - Increment inventory counts upon scanning or manual entry.
- **Fulfilling Orders:**
    - Decrement inventory counts only after successful fulfillment and Shopify update.
- **Inventory Discrepancies:**
    - Provide reports or alerts if inventory levels fall below a certain threshold.

### 10.2 SKU Management

- **Unique Identification:** Ensure each SKU/barcode is uniquely identified in the system.
- **Product Attributes:** Store and display attributes like size, color, and product name and allow user to create product attributes for each sku.

---

## 11. Order Fulfillment Process Details

### 11.1 Barcode Scanning

- **Hardware Compatibility:** Ensure compatibility with commonly used barcode scanners.

### 11.2 Fulfillment Validation

- **Item Matching:** Validate that scanned barcodes match the items in the order.
- **Quantity Control:** Prevent scanning more items than ordered.
- **Error Messages:**
    - Display "Item not in order" if an unlisted item is scanned.
    - Display "Quantity exceeded" if an item is scanned more times than ordered.

### 11.3 Shipping Label Workflow

- **Label Display:** Show the generated label immediately after creation.
- **Printing Options:** Provide options to print or download the label.
- **Label Storage:** Optionally, store the label URL or file for future reference.

---

## 12. Constraints and Assumptions

- **Internet Connectivity:** Assumes constant internet connectivity for API interactions.
- **API Limitations:** Must operate within the rate limits and terms of Shopify and Sendle APIs.
- **Single Shopify Store:** The application is intended for a single Shopify store integration.

---

## 13. Acceptance Criteria

- **Functional Completion:** All features described are implemented and operational.
- **Performance Metrics:** Application meets the specified performance requirements.
- **Security Standards:** Application passes security audits and vulnerability assessments.
- **Documentation:** Complete user manuals and technical documentation are provided.

---

## 14. Additional Considerations

### 14.1 Testing

- **Unit Tests:** Write unit tests for critical components.
- **Integration Tests:** Ensure all system components work together seamlessly.

### 14.3 Maintenance and Support

- **Documentation:** Provide technical documentation for future maintenance.

---

## 15. Appendices

### 15.1 Glossary

- **SKU:** Stock Keeping Unit, a unique identifier for each distinct product.
- **API:** Application Programming Interface, a set of protocols for building software.
- **EC2:** Elastic Compute Cloud, an AWS service providing scalable computing capacity.
- **PostgreSQL:** An open-source relational database management system.

---
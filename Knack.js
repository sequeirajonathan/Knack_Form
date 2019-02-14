//Import API Keys
import apiConfig from '../../apikeys';

// Lazy Load
LazyLoad.js(['https://code.jquery.com/jquery-3.3.1.slim.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.js', 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.0/js/bootstrap.min.js', 'https://cdn.jsdelivr.net/npm/javascript-obfuscator/dist/index.browser.js'], function() {
    console.log("JS Loaded")
});

LazyLoad.css(['https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css'], function() {
    console.log("CSS Loaded")
});
// END Lazy Load

// Knack API Keys
const KEYS = {
    KNACK_API_ID: Knack.application_id,
    KNACK_API_KEY: apiConfig.KNACK_API_KEY
};

// Authorization NET Keys
let AuthorizeNetKeys;

// Variable that stores Product Object which includes an array of products and details
let productObjData;

// Variable that stores Shipping Object which includes an array of shipping options
let shippingObjData;

// Re-direction Logic
let orderWindow;


// Records
let orderSubmitRecord; // Order Details
let customerSubmitRecord; // Customer Details
let finalRecordOrder; // Final Details

//Record Variables

// First 12 digits of credit card
let CC12;

// Expiration date of credit card
let CCExpiration;

// Last 3 numbers on the back of card
let CVV;

// Billing / Shipping Country
let country;

// Billing Address Object
let billingAddress;

// Shipping Address Object
let shippingAddress;

// Payment Portal Record ID
let paymentID;

// Array of objects used to add line items to final payment
let lineItemArray = [];

// Connection Filters
let cc4Object;
let paymentObject;
let orderObjectFinal;
let lineItemObject;
let APIObject;

// CC4 Data Variables
let CC4Data;
let CC4;
let CC16;

// Authorize Variables
let authorizeTransactionObjJSON;
let authorizeTransactionObj;

// Object used for AJAX PUT data
let paymentDataUpdate;


//Local Storage Variables
let localStorageAccess = {
    localOrderSubmitRecord: {
        orderDate: localStorage.getItem("orderDate"),
        orderTime: localStorage.getItem("orderTime"),
        orderID: localStorage.getItem("orderID"),
        orderCampaign: localStorage.getItem("orderCampaign"),
        orderPhoneNumber: localStorage.getItem("orderPhoneNumber"),
        orderRecordID: localStorage.getItem("recordID")
    },
    localCustomerSubmitRecord: {
        customerFullName: localStorage.getItem("fullName"),
        customerFirstName: localStorage.getItem("firstName"),
        customerLastName: localStorage.getItem("lastName"),
        customerPhoneNumber: localStorage.getItem("phoneNumber"),
        customerID: localStorage.getItem("customerID"),
        customerRecordID: localStorage.getItem("customerRecordID")
    },
    localPaymentPortalRecord: {
        CC12: localStorage.getItem("CC12"),
        CCExpiration: localStorage.getItem("CCExpiration"),
        CVV: localStorage.getItem("CVV"),
        paymentID: localStorage.getItem("paymentID"),
        country: localStorage.getItem("country"),
        billingStreet: localStorage.getItem("billingStreet"),
        billingStreet2: localStorage.getItem("billingStreet2"),
        billingCity: localStorage.getItem("billingCity"),
        billingState: localStorage.getItem("billingState"),
        billingZip: localStorage.getItem("billingZip"),
        shippingStreet: localStorage.getItem("shippingStreet"),
        shippingStreet2: localStorage.getItem("shippingStreet2"),
        shippingCity: localStorage.getItem("shippingCity"),
        shippingState: localStorage.getItem("shippingState"),
        shippingZip: localStorage.getItem("shippingZip")
    },
    localAPIKeys: {
        AUTH_ID: localStorage.getItem("AUTH_ID"),
        AUTH_KEY: localStorage.getItem("AUTH_KEY")
    }
};
// End Global Variables

// Functions 
const setFilter = (objectURL, field_, value) => {
    return objectURL += "?filters=" + encodeURIComponent(JSON.stringify({
        field: field_,
        operator: "is",
        value: value
    }));
}

// Add Purchase Order
$(document).on("knack-scene-render.scene_221", function(event, scene) {
    // First Page URL variables including Query String Data

    // Stores URL in a variable
    orderWindow = window.location.href;

    // Checks if URL OrderWindow is empty
    if (orderWindow !== null || orderWindow !== undefined) {
        history.pushState(orderWindow, null, "https://upsell24.knack.com/order-form#orders/");
    }

    // Query Selectors for read only fields
    let disabledScene_221 = {
        orderDate: document.querySelector("input#view_383-field_258"),
        orderTime: document.querySelector("input#view_383-field_258-time"),
        orderID: document.querySelector("input#field_339"),
        orderCampaign: document.querySelector("input#field_294"),
        orderPhoneNumber: document.querySelector("input#field_296")
    };

    // Read Only Fields
    disabledScene_221.orderDate.readOnly = true;
    disabledScene_221.orderTime.readOnly = true;
    disabledScene_221.orderID.readOnly = true;
    disabledScene_221.orderCampaign.readOnly = true;
    disabledScene_221.orderPhoneNumber.readOnly = true;

    // Re-populates field with first 3 characters of campaign name
    disabledScene_221.orderCampaign.value = disabledScene_221.orderCampaign.value.slice(0, 3);

    // Checks if record on load exists if it does then record is deleted so that agent may continue
    $.ajax({
        type: "GET",
        url: setFilter("https://api.knack.com/v1/objects/object_38/records", "field_339", disabledScene_221.orderID.value),
        dataType: "JSON",
        headers: {
            "X-Knack-Application-Id": KEYS.KNACK_API_ID,
            "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
        },
        success: checkID => {
            if (checkID.records.length < 1 || checkID.records.length === undefined) {
                console.log("Record ID not Found");
                return;
            } else {
                if (confirm('We noticed this record already exists in the database press "OK" to reset data and continue')) {
                    for (let i = 0; i < checkID.records.length; i++) {
                        if (
                            disabledScene_221.orderID.value === checkID.records[i].field_339_raw
                        ) {
                            $.ajax({
                                type: "DELETE",
                                url: "https://api.knack.com/v1/objects/object_38/records/" + checkID.records[i].id,
                                dataType: "JSON",
                                headers: {
                                    "X-Knack-Application-Id": KEYS.KNACK_API_ID,
                                    "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
                                },
                                success: data => {
                                    alert("Record Reset");
                                    $("button.kn-button.is-primary:contains('Next')").removeClass("is-secondary").addClass("is-primary");
                                },
                                error: error => {
                                    console.log("Error Deleting Order Record");
                                }
                            });
                        } else {
                            console.log("Record ID not Found");
                        }
                    }
                } else {
                    $("button.kn-button.is-primary:contains('Next')").removeClass("is-primary").addClass("is-secondary disabled").attr('disabled', 'disabled');
                    alert("Please go back to script if wrong option was chosen, click link on agent script to restart form");
                }
            }
        },
        error: error => {
            alert("Error, order data is not available. " + error);
        }
    });
});


// End Add Purchase Order

// Purchase Order Submit Records
$(document).on("knack-form-submit.view_383", function(event, view, orderRecord) {
    // Collects data from form and makes them global variables to use in another form section
    orderSubmitRecord = {
        orderDate: orderRecord.field_258_raw.date,
        orderTime: orderRecord.field_258_raw.hours + " : " + orderRecord.field_258_raw.minutes + " : " + orderRecord.field_258_raw.am_pm,
        orderID: orderRecord.field_339_raw,
        orderCampaign: orderRecord.field_294_raw,
        orderPhoneNumber: orderRecord.field_296_raw,
        recordID: orderRecord.id
    };

    // Set Local Storage
    localStorage.setItem("orderDate", orderSubmitRecord.orderDate);
    localStorage.setItem("orderTime", orderSubmitRecord.orderTime);
    localStorage.setItem("orderID", orderSubmitRecord.orderID);
    localStorage.setItem("orderCampaign", orderSubmitRecord.orderCampaign);
    localStorage.setItem("orderPhoneNumber", orderSubmitRecord.orderPhoneNumber);
    localStorage.setItem("orderRecordID", orderSubmitRecord.recordID);
});
// End Purchase Order Submit Records

// Add Customer Details
$(document).on("knack-scene-render.scene_130", function(event, scene) {
    // Order Connection Filter
    APIObject = {
        APIObjUrl: "https://api.knack.com/v1/objects/object_45/records",
        APIObjRequestFilters: [{
            field: "field_336",
            operator: "is",
            value: orderSubmitRecord.orderCampaign
        }]
    };

    // Unicode URL Query String
    APIObject.APIObjUrl += "?filters=" + encodeURIComponent(JSON.stringify(APIObject.APIObjRequestFilters));

    $.ajax({
        type: "GET",
        url: APIObject.APIObjUrl,
        async: true,
        dataType: "JSON",
        headers: {
            "X-Knack-Application-Id": KEYS.KNACK_API_ID,
            "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
        },
        success: API_KEYS => {
            AuthorizeNetKeys = {
                AUTH_ID: API_KEYS.records[0].field_337_raw,
                AUTH_KEY: API_KEYS.records[0].field_338_raw
            };

            localStorage.setItem("AUTH_ID", API_KEYS.records[0].field_337_raw);
            localStorage.setItem("AUTH_KEY", API_KEYS.records[0].field_338_raw);
        }
    });

    // Checks if orderSubmitRecord is available
    if ($.isEmptyObject(orderSubmitRecord) || orderSubmitRecord === undefined || orderSubmitRecord === null) {
        orderSubmitRecord = localStorageAccess.localOrderSubmitRecord;
    }

    // Checks if record on load exists if it does then record is deleted so that agent may continue
    $.ajax({
        type: "GET",
        url: setFilter("https://api.knack.com/v1/objects/object_43/records", "field_315", orderSubmitRecord.orderID),
        dataType: "JSON",
        headers: {
            "X-Knack-Application-Id": KEYS.KNACK_API_ID,
            "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
        },
        success: checkID => {
            // console.log(checkID);
            if (checkID.records.length < 1 || checkID.records.length === undefined) {
                console.log("Record ID not Found");
                return;
            } else {
                for (let i = 0; i < checkID.records.length; i++) {
                    if (orderSubmitRecord.orderID === checkID.records[i].field_315_raw) {
                        $.ajax({
                            type: "DELETE",
                            url: "https://api.knack.com/v1/objects/object_43/records/" + checkID.records[i].id,
                            dataType: "JSON",
                            headers: {
                                "X-Knack-Application-Id": KEYS.KNACK_API_ID,
                                "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
                            },
                            success: data => {
                                console.log("Customer Record Deleted");
                            },
                            error: error => {
                                console.log("Error Deleting Customer Record");
                            }
                        });
                    } else {
                        console.log("Customer Record ID not Found");
                    }
                }
            }
        },
        error: error => {
            alert("Error, order data is not available. " + error);
        }
    });

    // Line Item Connection Filter
    lineItemObject = {
        lineItemObjUrl: "https://api.knack.com/v1/objects/object_35/records",
        lineItemObjRequestFilters: [{
            field: "field_289",
            operator: "is",
            value: orderSubmitRecord.orderID
        }]
    };

    // Unicode URL Query String
    lineItemObject.lineItemObjUrl += "?filters=" + encodeURIComponent(JSON.stringify(lineItemObject.lineItemObjRequestFilters));

    $.ajax({
        type: "GET",
        url: lineItemObject.lineItemObjUrl,
        async: true,
        dataType: "JSON",
        headers: {
            "X-Knack-Application-Id": KEYS.KNACK_API_ID,
            "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
        },
        success: checkLineItems => {
            // console.log(checkLineItems);
            if (checkLineItems.records.length < 1 || checkLineItems.records.length === undefined) {
                console.log("Line Item Record ID not Found");
                return;
            } else {
                for (let i = 0; i < checkLineItems.records.length; i++) {
                    if (orderSubmitRecord.orderID === checkLineItems.records[i].field_289_raw) {
                        $.ajax({
                            type: "DELETE",
                            url: "https://api.knack.com/v1/objects/object_35/records/" + checkLineItems.records[i].id,
                            dataType: "JSON",
                            headers: {
                                "X-Knack-Application-Id": KEYS.KNACK_API_ID,
                                "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
                            },
                            success: data => {
                                console.log("Line Item Deleted");
                            },
                            error: error => {
                                console.log("No Line Items to Delete");
                            }
                        });
                    } else {
                        console.log("No Line Items to Delete");
                    }
                }
            }
        }
    });

    let chosenConnection = document.querySelectorAll("#view_376-field_319");

    for (let i = 0; i < chosenConnection[0].children.length; i++) {
        if (chosenConnection[0].children[i].innerText === `${orderSubmitRecord.orderID}`) {
            chosenConnection[0].children[i].setAttribute("selected", "selected");
        }
    }

    customerPhoneNumber = document.querySelector("input#field_317");
    customerID = document.querySelector("input#field_315");
    customerID.readOnly = true;
    customerPhoneNumber.readOnly = true;
    customerID.value = orderSubmitRecord.orderID;
    customerPhoneNumber.value = orderSubmitRecord.orderPhoneNumber;
});

//  Customer Details Submit Records
$(document).on("knack-form-submit.view_376", function(event, view, customerRecord) {
    customerSubmitRecord = {
        customerFullName: customerRecord.field_316,
        customerFirstName: customerRecord.field_316_raw.first,
        customerLastName: customerRecord.field_316_raw.last,
        customerPhoneNumber: customerRecord.field_317_raw,
        customerEmail: customerRecord.field_318,
        customerID: customerRecord.field_315_raw,
        customerRecordID: customerRecord.id
    };

    // Set Local Storage
    localStorage.setItem("fullName", customerSubmitRecord.customerFullName);
    localStorage.setItem("firstName", customerSubmitRecord.customerFirstName);
    localStorage.setItem("lastName", customerSubmitRecord.customerLastName);
    localStorage.setItem("phoneNumber", customerSubmitRecord.customerPhoneNumber);
    localStorage.setItem("customerID", customerSubmitRecord.customerID);
    localStorage.setItem("customerRecordID", customerSubmitRecord.customerRecordID);

    if ($.isEmptyObject(orderSubmitRecord) || orderSubmitRecord === undefined || orderSubmitRecord === null) {
        orderSubmitRecord = localStorageAccess.localOrderSubmitRecord;
    }

    // use data from inserted record
    let recordInput = {
        field_326: orderSubmitRecord.recordID
    };

    // Inserts Record ID to Orders Tables
    $.ajax({
        url: "https://api.knack.com/v1/pages/scene_221/views/view_383/records/" +
            orderSubmitRecord.recordID,
        type: "PUT",
        headers: {
            "X-Knack-Application-ID": KEYS.KNACK_API_ID,
            "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY,
            "content-type": "application/json"
        },
        data: JSON.stringify(recordInput),
        success: function(response) {
            // console.log(response);
        }
    });
});

// Line Items
$(document).on("knack-scene-render.scene_179", function(event, scene) {
    // Checks if orderSubmitRecord is available
    if ($.isEmptyObject(orderSubmitRecord) || orderSubmitRecord === undefined || orderSubmitRecord === null) {
        orderSubmitRecord = localStorageAccess.localOrderSubmitRecord;
    }

    let cartWindow = window.location.href;
    // Filters line item details to only show line items related to the order ID
    $("input[name='keyword']").attr("value", orderSubmitRecord.orderID);

    // When page loads a click is triggered on the filter search button
    $("a.kn-button.search").trigger("click");


    let lineItemToOrder = document.querySelectorAll("div#kn-input-field_311.kn-input.kn-input-connection.control");

    for (let i = 0; i < lineItemToOrder[0].children[1].children[3].children[0].children.length; i++) {
        if (lineItemToOrder[0].children[1].children[3].children[0].children[i].innerText === `${orderSubmitRecord.orderID}`) {
            lineItemToOrder[0].children[1].children[3].children[0].children[i].setAttribute("selected", "selected");
        }
    }


    let shippingFilter = document.querySelectorAll("div#kn-input-field_362.kn-input.kn-input-connection.control");
    for (let i = 0; i < shippingFilter[0].children[1].children[3].children[0].children.length; i++) {
        if (shippingFilter[0].children[1].children[3].children[0].children[i].innerText === `${orderSubmitRecord.orderID}`) {
            shippingFilter[0].children[1].children[3].children[0].children[i].setAttribute("selected", "selected");
        }
    }


    let couponFilter = document.querySelectorAll("div#kn-input-field_330.kn-input.kn-input-connection.control");

    for (let i = 0; i < couponFilter[0].children[1].children[3].children[0].children.length; i++) {
        if (couponFilter[0].children[1].children[3].children[0].children[i].innerText === `${orderSubmitRecord.orderID}`) {
            couponFilter[0].children[1].children[3].children[0].children[i].setAttribute("selected", "selected");
        }
    }

    // Query Selectors for read only fields
    let disabledScene_179 = {
        lineItemOrderID: document.querySelector("input#field_289.input"),
        productDescription: document.querySelector("input#field_340.input"),
        shippingSKU: document.querySelector("input#field_351.input"),
        shippingDescription: document.querySelector("input#field_353.input"),
        shippingPrice: document.querySelector("input#field_354.input")
    };

    disabledScene_179.lineItemOrderID.readOnly = true;
    disabledScene_179.lineItemOrderID.value = orderSubmitRecord.orderID;
    disabledScene_179.productDescription.readOnly = true;
    disabledScene_179.shippingSKU.readOnly = true;
    disabledScene_179.shippingDescription.readOnly = true;
    disabledScene_179.shippingPrice.readOnly = true;
    //let lineItemID = document.querySelector("input#field_302.input");
    //lineItemID.readOnly = true;

    // CSS Styling to change button attributes
    $("button.kn-button.is-primary:contains('Add Product')").attr("style", "background-color: #EBEBEB !important; color: #07467c !important");
    $("button.kn-button.is-primary:contains('Add Discount')").attr("style", "background-color: #EBEBEB !important; color: #07467c !important");
    $("button.kn-button.is-primary:contains('Add Shipping')").attr("style", "background-color: #EBEBEB !important; color: #07467c !important");
    document.querySelector(".kn-menu .kn-button").classList.add("is-primary");
    document.querySelector(".kn-menu .kn-button").style.minWidth = "140px";

    // QTY Range
    document.querySelector("input#field_245");
    document.querySelector("input#field_245").setAttribute("type", "number");
    document.querySelector("input#field_245").setAttribute("min", "1");
    document.querySelector("input#field_245").setAttribute("max", "99");

    // Form Error Handling
    let $selectProduct = $("#js-select-product");
    let error_product = $selectProduct.data("error");

    $("button.kn-button.is-primary:contains('Add Product')").on("click", function(event) {
        event.preventDefault();

        $.ajax({
            type: "GET",
            url: `https://api.knack.com/v1/objects/object_35/records`,
            dataType: "JSON",
            async: false,
            headers: {
                "X-Knack-Application-Id": KEYS.KNACK_API_ID,
                "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
            },
            success: lineItem => {
                console.log(lineItem.records.length);
                console.log(lineItem.records);
                let check = true;

                if ($('#view_312-field_290').val().toLowerCase().includes("select")) {
                    $selectProduct.fadeIn("slow").html('<div class="kn-message error danger">' + error_product + "</div>").delay(4000).fadeOut("slow");
                } else if (lineItem.records.length === 0) {
                    $("button.kn-button.is-primary:contains('Add Product')").submit();
                } else if (lineItem.records.length > 0) {

                    for (let i = 0; i < lineItem.records.length; i++) {
                        if (document.querySelector('#view_312-field_290').value === lineItem.records[i].field_290_raw) {
                            check = true;
                            break;
                        } else {
                            check = false;
                        }
                    }
                    if (check === false) {
                        $("button.kn-button.is-primary:contains('Add Product')").submit();
                    } else {
                        $selectProduct.fadeIn("slow").html('<div class="kn-message error danger">' + "Cannot add duplicate line items" + "</div>").delay(4000).fadeOut("slow");
                    }
                } else {
                    $("button.kn-button.is-primary:contains('Add Product')").submit();
                }
            },
            error: error => {
                console.log("Error Checking Line-items " + error);
            }
        });
    });

    let $selectShipping = $("#js-select-shipping");
    let error_ship = $selectShipping.data("error");

    $("button.kn-button.is-primary:contains('Add Shipping')").on("click", function(event) {
        event.preventDefault();

        if ($('#view_394-field_367').val().toLowerCase().includes("select")) {
            $selectShipping.fadeIn("slow").html('<div class="kn-message error danger">' + error_ship + "</div>").delay(4000).fadeOut("slow");
        } else {
            $.ajax({
                url: 'https://api.knack.com/v1/pages/scene_179/views/view_386/records/' + orderSubmitRecord.recordID,
                type: 'PUT',
                headers: {
                    "X-Knack-Application-Id": KEYS.KNACK_API_ID,
                    "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY,
                    'content-type': 'application/json'
                },
                data: JSON.stringify({
                    field_365: $('#field_354').val(),
                    field_363: $('#view_394-field_367').val()
                }),
            }).done(function(responseData) {
                console.log("Record Updated")
                window.location.href = cartWindow;
            });
        }
    });

    let $selectCoupon = $("#js-select-coupon");
    let error_coupon = $selectCoupon.data("error");
    let not_a_number = $selectCoupon.data("not-number");
    let out_of_bounds = $selectCoupon.data("out-of-bounds");

    $("button.kn-button.is-primary:contains('Add Discount')").on("click", function(event) {
        event.preventDefault();
        if ($('#view_389-field_331').val().toLowerCase().includes("select") || $('#field_329').val() == "" || $('#field_328').val() == "") {
            $selectCoupon.fadeIn("slow").html('<div class="kn-message error danger">' + error_coupon + "</div>").delay(4000).fadeOut("slow");
        } else if (isNaN($('#field_329').val())) {
            $selectCoupon.fadeIn("slow").html('<div class="kn-message error danger">' + not_a_number + "</div>").delay(4000).fadeOut("slow");
        } else if ($('#field_329').val().toString().length > 3) {
            $selectCoupon.fadeIn("slow").html('<div class="kn-message error danger">' + out_of_bounds + "</div>").delay(4000).fadeOut("slow");
        } else {
            $("button.kn-button.is-primary:contains('Add Discount')").submit();
        }
    });


    // END Form Error Handling

    function setProducts(productObject) {
        productObjData = productObject;
    }

    // Gets record of all available products
    $.ajax({
        type: "GET",
        url: `https://api.knack.com/v1/objects/object_20/records`,
        dataType: "JSON",
        async: false,
        headers: {
            "X-Knack-Application-Id": KEYS.KNACK_API_ID,
            "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
        },
        success: data => {
            setProducts(data);
        },
        error: error => {
            console.log("Error Obtaining Products " + error);
        }
    });

    // Default Select Place Holder
    document.querySelector(
        "select#view_312-field_290.select"
    ).innerHTML = `<option selected disabled>Select Product</option>`;

    // Filters through all of the available products but only populates selection options based on the first three letters of the campaign value
    for (let i = 0; i < productObjData.records.length; i++) {
        if (productObjData.records[i].field_214_raw === orderSubmitRecord.orderCampaign.substring(0, 3)) {
            document.querySelector("#view_312-field_290").innerHTML += `<option value="${productObjData.records[i].field_117_raw}">${productObjData.records[i].field_117_raw}</option>`;
        }
    }

    // Inserts Description
    $("select").change(function() {
        let selectedProduct = $(this).val();
        for (let i = 0; i < productObjData.records.length; i++) {
            if (productObjData.records[i].field_117_raw === selectedProduct) {
                disabledScene_179.productDescription.value = productObjData.records[i].field_120_raw;
            }
        }
    });

    // Sets a global variable from the AJAX function
    function setShipping(shippingObject) {
        shippingObjData = shippingObject;
    }

    // Gets record of all available products
    $.ajax({
        type: "GET",
        url: `https://api.knack.com/v1/objects/object_46/records`,
        dataType: "JSON",
        async: false,
        headers: {
            "X-Knack-Application-Id": KEYS.KNACK_API_ID,
            "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
        },
        success: data => {
            setShipping(data);
        },
        error: error => {
            console.log("Error Obtaining Shipping Options " + error);
        }
    });

    // Default Select Place Holder
    document.querySelector("select#view_394-field_367.select").innerHTML = `<option selected disabled>Select Shipping</option>`;

    // Filters through all of the available products but only populates selection options based on the first three letters of the campaign value
    for (let i = 0; i < shippingObjData.records.length; i++) {
        if (shippingObjData.records[i].field_366_raw === orderSubmitRecord.orderCampaign.substring(0, 3)) {
            document.querySelector("#view_394-field_367").innerHTML += `<option value="${shippingObjData.records[i].field_352_raw}">${shippingObjData.records[i].field_352_raw}</option>`;
        }
    }

    // Inserts Shipping Details
    $("select").change(function() {
        let selectedShipping = $(this).val();
        for (let i = 0; i < shippingObjData.records.length; i++) {
            if (shippingObjData.records[i].field_352_raw === selectedShipping) {
                disabledScene_179.shippingDescription.value = shippingObjData.records[i].field_353_raw;
                disabledScene_179.shippingPrice.value = shippingObjData.records[i].field_354_raw;
                disabledScene_179.shippingSKU.value = shippingObjData.records[i].field_351_raw;
            }
        }
    });
});

// Triggered when a record is deleted from a view’s “delete” link
$(document).on('knack-record-delete.view_313', function(event, view, record) {
    lineItemArray.pop();
  });

//  Line Item Submit Records
$(document).on("knack-form-submit.view_312", function(event, view, lineItemRecord) {

    lineItemArray.push({
        itemId: lineItemRecord.field_289_raw,
        name: lineItemRecord.field_290_raw.replace(/[$.0-9()]/g, ""),
        description: lineItemRecord.field_340_raw,
        quantity: lineItemRecord.field_245_raw,
        unitPrice: lineItemRecord.field_256_raw
    });
});

// Payment Portal Render
$(document).on("knack-scene-render.scene_170", function(event, scene) {

    // Checks if orderSubmitRecord is available
    if ($.isEmptyObject(orderSubmitRecord) || orderSubmitRecord === undefined || orderSubmitRecord === null) {
        orderSubmitRecord = localStorageAccess.localOrderSubmitRecord;
    }
    // Checks if customerSubmitRecord is available
    if ($.isEmptyObject(customerSubmitRecord) || customerSubmitRecord === undefined || customerSubmitRecord === null) {
        customerSubmitRecord = localStorageAccess.localCustomerSubmitRecord;
    }

    // Checks if API Keys are available
    if ($.isEmptyObject(AuthorizeNetKeys) || AuthorizeNetKeys === undefined || AuthorizeNetKeys === null) {
        AuthorizeNetKeys = localStorageAccess.localAPIKeys;
    }

    // document.getElementById("view_293-field_325").value = localStorageAccess.localPaymentPortalRecord.country; // Country

    // document.querySelector("#kn-input-field_283 #street").value = localStorageAccess.localPaymentPortalRecord.billingStreet; // Street
    // document.querySelector("#kn-input-field_283 #street2").value = localStorageAccess.localPaymentPortalRecord.billingStreet2; // Street2
    // document.querySelector("#kn-input-field_283 #city").value = localStorageAccess.localPaymentPortalRecord.billingCity; // City
    // document.querySelector("#kn-input-field_283 #state").value = localStorageAccess.localPaymentPortalRecord.billingState; // State
    // document.querySelector("#kn-input-field_283 #zip").value = localStorageAccess.localPaymentPortalRecord.billingZip; // zip

    // document.querySelector("#kn-input-field_283 #street").value = localStorageAccess.localPaymentPortalRecord.shippingStreet; // Street
    // document.querySelector("#kn-input-field_283 #street2").value = localStorageAccess.localPaymentPortalRecord.shippingStreet2; // Street2
    // document.querySelector("#kn-input-field_283 #city").value = localStorageAccess.localPaymentPortalRecord.shippingCity; // City
    // document.querySelector("#kn-input-field_283 #state").value = localStorageAccess.localPaymentPortalRecord.shippingState; // State
    // document.querySelector("#kn-input-field_283 #zip").value = localStorageAccess.localPaymentPortalRecord.shippingZip; // zip

    // document.querySelector("input#field_307").value = localStorageAccess.localOrderSubmitRecord.orderID;
    // document.querySelector("input#field_279").value = localStorageAccess.localPaymentPortalRecord.CC12; // CC12
    // document.querySelector("input#field_280").value = localStorageAccess.localPaymentPortalRecord.CVV; //CVV
    // document.querySelector("input#field_281").value = localStorageAccess.localPaymentPortalRecord.CCExpiration; //EXP

    // Final Order Connection Filter
    orderObjectFinal = {
        orderObjFinalUrl: "https://api.knack.com/v1/objects/object_38/records",
        orderObjFinalRequestFilters: [{
            field: "field_339",
            operator: "is",
            value: orderSubmitRecord.orderID
        }]
    };

    // Unicode URL Query String
    orderObjectFinal.orderObjFinalUrl += "?filters=" + encodeURIComponent(JSON.stringify(orderObjectFinal.orderObjFinalRequestFilters));

    // Get Final Order Total
    $.ajax({
        type: "GET",
        url: orderObjectFinal.orderObjFinalUrl,
        async: true,
        dataType: "JSON",
        headers: {
            "X-Knack-Application-Id": KEYS.KNACK_API_ID,
            "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
        },
        success: finalOrder => {
            finalRecordOrder = {
                finalDate: finalOrder.records[0].field_258,
                finalOrderID: finalOrder.records[0].field_339_raw,
                finalOrderCampaign: finalOrder.records[0].field_294_raw,
                finalOrderPhoneNumber: finalOrder.records[0].field_296_raw,
                finalOrderTotal: finalOrder.records[0].field_333_raw,
                finalOrderDiscount: finalOrder.records[0].field_323_raw,
                finalOrderDiscountType: finalOrder.records[0].field_332_raw,
                finalOrderCouponCode: finalOrder.records[0].field_324_raw,
                finalShipping: finalOrder.records[0].field_363_raw,
                finalShippingPrice: finalOrder.records[0].field_365_raw,
                finalOrderRecordID: finalOrder.records[0].field_326_raw
            };

            let customerInfoLeft = document.querySelector(".customer-details-left");

            customerInfoLeft.innerHTML += `<span class="ui green ribbon label">Customer Details</span>`;
            customerInfoLeft.innerHTML += `<p>Name: ${customerSubmitRecord.customerFullName}</p>`;
            customerInfoLeft.innerHTML += `<p>Phone Number: ${customerSubmitRecord.customerPhoneNumber}</p>`;
            customerInfoLeft.innerHTML += `<div class="ui divider"></div>`;
            customerInfoLeft.innerHTML += `<span class="ui blue ribbon label">Line Item</span>`;

            let customerInfoRight = document.querySelector(".customer-details-right");
            customerInfoRight.innerHTML += `<span class="ui green right ribbon label">Customer Details Cont.</span>`;
            customerInfoRight.innerHTML += `<p>${customerSubmitRecord.customerEmail}</p>`;
            customerInfoRight.innerHTML += `<p>Order Date: ${orderSubmitRecord.orderDate}</p>`;
            customerInfoRight.innerHTML += `<div class="ui divider"></div>`;
            customerInfoRight.innerHTML += `<span class="ui blue right ribbon label">Price</span>`;


            for (let i = 0; i < lineItemArray.length; i++) {
                customerInfoLeft.innerHTML += `<p>${lineItemArray[i].name}</p>`;
                customerInfoLeft.innerHTML += `<div class="ui divider"></div>`;
                customerInfoRight.innerHTML += `<p>$${lineItemArray[i].unitPrice}</p>`;
                customerInfoRight.innerHTML += `<div class="ui divider"></div>`;
            }


            customerInfoLeft.innerHTML += `<span class="ui brown ribbon label">Shipping</span>`;
            customerInfoLeft.innerHTML += `<p>${finalOrder.records[0].field_363_raw}</p>`;
            customerInfoLeft.innerHTML += `<section class="ui divider"></section>`;

            customerInfoRight.innerHTML += `<span class="ui brown right ribbon label">Shipping Price</span>`;
            customerInfoRight.innerHTML += `<p>$${finalOrder.records[0].field_365_raw}</p>`;
            customerInfoRight.innerHTML += `<div class="ui divider"></div>`;

            if (finalOrder.records[0].field_324_raw == undefined || finalOrder.records[0].field_324_raw == null || finalOrder.records[0].field_324_raw == "") {
                customerInfoLeft.innerHTML += `<span class="ui purple ribbon label">Coupon Code</span>`;
                customerInfoLeft.innerHTML += `<p>N/A</p>`;
                customerInfoLeft.innerHTML += `<section class="ui divider"></section>`;
            } else {
                customerInfoLeft.innerHTML += `<span class="ui purple ribbon label">Coupon Code</span>`;
                customerInfoLeft.innerHTML += `<p>${finalOrder.records[0].field_324_raw}</p>`;
                customerInfoLeft.innerHTML += `<section class="ui divider"></section>`;
            }

            if (finalOrder.records[0].field_332_raw == undefined || finalOrder.records[0].field_332_raw == null || finalOrder.records[0].field_332_raw == "") {
                customerInfoRight.innerHTML += `<span class="ui purple right ribbon label">Discount Amount</span>`;
                customerInfoRight.innerHTML += `<p>$0.00</p>`;
                customerInfoRight.innerHTML += `<div class="ui divider"></div>`;
            } else {
                customerInfoRight.innerHTML += `<span class="ui purple right ribbon label">Discount Amount</span>`;
                customerInfoRight.innerHTML += `<p>${finalOrder.records[0].field_332_raw.replace(/[a-z A-Z()]/g,"")}${finalOrder.records[0].field_323_raw}</p>`;
                customerInfoRight.innerHTML += `<div class="ui divider"></div>`;
            }

            customerInfoRight.innerHTML += `<span class="ui black right ribbon label">Total</span>`;
            customerInfoRight.innerHTML += `<p>$${finalOrder.records[0].field_333_raw}</p>`;

        },
        error: error => {
            alert("Error, order data is not available. " + error);
        }
    });

    // Payment Connection Filter
    paymentObject = {
        paymentObjUrl: "https://api.knack.com/v1/objects/object_41/records",
        paymentObjRequestFilters: [{
            field: "field_307",
            operator: "is",
            value: orderSubmitRecord.orderID
        }]
    };

    // Unicode URL Query String
    paymentObject.paymentObjUrl += "?filters=" + encodeURIComponent(JSON.stringify(paymentObject.paymentObjRequestFilters));

    // Checks if record on load exists if it does then record is deleted so that agent may continue
    $.ajax({
        type: "GET",
        url: paymentObject.paymentObjUrl,
        dataType: "JSON",
        headers: {
            "X-Knack-Application-Id": KEYS.KNACK_API_ID,
            "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
        },
        success: checkID => {
            if (checkID.records.length < 1 || checkID.records.length === undefined) {
                console.log("Record ID not Found");
                return;
            } else {
                for (let i = 0; i < checkID.records.length; i++) {
                    if (orderSubmitRecord.orderID === checkID.records[i].field_307_raw) {
                        $.ajax({
                            type: "DELETE",
                            url: "https://api.knack.com/v1/objects/object_41/records/" + checkID.records[0].id,
                            async: true,
                            dataType: "JSON",
                            headers: {
                                "X-Knack-Application-Id": KEYS.KNACK_API_ID,
                                "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
                            },
                            success: data => {
                                console.log("Payment Object Record Deleted");
                            },
                            error: error => {
                                console.log("Error Deleting Payment Object Record");
                            }
                        });
                    } else {
                        console.log("Error Deleting Payment Object Record");
                    }
                }
            }
        },
        error: error => {
            alert("Error, order data is not available. " + error);
        }
    });

    // Read Only Fields
    let portalID = document.querySelector("input#field_307.input");
    portalID.readOnly = true;
    portalID.value = orderSubmitRecord.orderID;
    // Changes Submit button CSS to green
    $("button.kn-button.is-primary:contains('Process Payment')").attr("style", "background-color: #4CAF50 !important");

    let id = orderSubmitRecord.recordID || localStorage.getItem("recordID");

    // CC4 Connection Filter
    cc4Object = {
        cc4ObjUrl: "https://api.knack.com/v1/objects/object_22/records/",
        cc4ObjRequestFilters: [{
            field: "field_144",
            operator: "is",
            value: orderSubmitRecord.orderID
        }]
    };
    // Unicode URL Query String
    cc4Object.cc4ObjUrl += "?filters=" + encodeURIComponent(JSON.stringify(cc4Object.cc4ObjRequestFilters));

    let $lastFourResults = $("#js-last-four-result");
    let error_missing = $lastFourResults.data("error-missing");
    let error_long = $lastFourResults.data("error-long");
    let error_short = $lastFourResults.data("error-short");

    let deleteCC4Record = function(id) {
        $.ajax({
            type: "DELETE",
            url: 'https://api.knack.com/v1/objects/object_22/records/' + id,
            async: true,
            headers: {
                "X-Knack-Application-Id": KEYS.KNACK_API_ID,
                "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
            },
            success: data => {
                console.log(data);
                console.log("CC4 Object Record Deleted");
                alert("Please Re-submit Last 4 of Credit Card Number")
            },
            error: error => {
                console.log(error);
                console.log("Error Deleting CC4 Object Record");
            }
        });
    }

    $("button.kn-button.is-primary:contains('Process Payment')").click(function(event) {
        event.preventDefault();

        let billingCountry = document.querySelector('select#view_293-field_325').value;
        let billingStreet = document.querySelector('#kn-input-field_283 #street').value;
        let billingStreet2 = document.querySelector('#kn-input-field_283 #street2').value;
        let billingCity = document.querySelector('#kn-input-field_283 #city').value;
        let billingState = document.querySelector('#kn-input-field_283 #state').value;
        let billingZip = document.querySelector('#kn-input-field_283 #zip').value;
        let sameShipping = document.querySelector('#field_285').value;

        CC12 = document.querySelector('#field_279').value;
        CCExpiration = document.querySelector('#field_281').value;
        CVV = document.querySelector('#field_280').value;


        $.ajax({
            url: cc4Object.cc4ObjUrl,
            type: "GET",
            dataType: "JSON",
            async: false,
            headers: {
                "X-Knack-Application-Id": KEYS.KNACK_API_ID,
                "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
            },
            success: CC4 => {

                // Sets the global variable for CC4 Data
                CC4Data = CC4;

                if (CC4Data.records.length === 0) {
                    $lastFourResults.fadeIn("slow").html('<div class="kn-message error danger">' + error_missing + "</div>").delay(8000).fadeOut("slow");
                } else if (CC4Data.records[0].field_142_raw.length > 4) {
                    $lastFourResults.fadeIn("slow").html('<div class="kn-message error danger">' + error_long + "</div>").delay(8000).fadeOut("slow");
                    deleteCC4Record(CC4Data.records[0].id);
                } else if (CC4Data.records[0].field_142_raw.length < 4) {
                    $lastFourResults.fadeIn("slow").html('<div class="kn-message error danger">' + error_short + "</div>").delay(8000).fadeOut("slow");
                    deleteCC4Record(CC4Data.records[0].id);
                } else if ($('#field_357').val() === "No") {
                    $lastFourResults.fadeIn("slow").html('<div class="kn-message error danger">' + "Please select yes to continue with purchase" + "</div>").delay(8000).fadeOut("slow");
                } else if (CC4Data.records[0].field_142_raw.length === 4) {
                    // $("button.kn-button.is-primary:contains('Process Payment')").submit();

                    country = billingCountry;

                    billingAddress = {
                        street: billingStreet,
                        street2: billingStreet2,
                        city: billingCity,
                        state: billingState,
                        zip: billingZip
                    };

                    // Checks if Same as Billing is true
                    if (sameShipping === "Yes") {
                        shippingAddress = {
                            street: billingStreet,
                            street2: billingStreet2,
                            city: billingCity,
                            state: billingState,
                            zip: billingZip
                        };
                    } else {

                        let shippingStreet = document.querySelector('#kn-input-field_284 #street').value;
                        let shippingStreet2 = document.querySelector('#kn-input-field_284 #street2').value;
                        let shippingCity = document.querySelector('#kn-input-field_284 #city').value;
                        let shippingState = document.querySelector('#kn-input-field_284 #state').value;
                        let shippingZip = document.querySelector('#kn-input-field_284 #zip').value;

                        shippingAddress = {
                            street: shippingStreet,
                            street2: shippingStreet2,
                            city: shippingCity,
                            state: shippingState,
                            zip: shippingZip
                        };
                    }


                    CC4 = CC4Data.records[0].field_142_raw;
                    CC16 = CC12 + CC4;

                    authorizeTransactionObj = {
                        createTransactionRequest: {
                            merchantAuthentication: {
                                name: AuthorizeNetKeys.AUTH_ID,
                                transactionKey: AuthorizeNetKeys.AUTH_KEY
                            },
                            refId: orderSubmitRecord.orderID,
                            transactionRequest: {
                                transactionType: "authCaptureTransaction",
                                amount: finalRecordOrder.finalOrderTotal,
                                payment: {
                                    creditCard: {
                                        cardNumber: CC16,
                                        expirationDate: CCExpiration,
                                        cardCode: CVV
                                    }
                                },
                                lineItems: {
                                    lineItem: []
                                },
                                tax: {
                                    //Tax API
                                    amount: "4.26",
                                    name: "level2 tax name",
                                    description: "level2 tax"
                                },
                                duty: {
                                    amount: "8.55",
                                    name: "duty name",
                                    description: "duty description"
                                },
                                shipping: {
                                    amount: "4.26",
                                    name: "level2 tax name",
                                    description: "level2 tax"
                                },
                                poNumber: orderSubmitRecord.orderID,
                                customer: {
                                    id: customerSubmitRecord.customerID
                                },
                                billTo: {
                                    firstName: customerSubmitRecord.customerFirstName,
                                    lastName: customerSubmitRecord.customerLastName,
                                    address: billingAddress.street,
                                    city: billingAddress.city,
                                    state: billingAddress.state,
                                    zip: billingAddress.zip,
                                    country: country
                                },
                                shipTo: {
                                    firstName: customerSubmitRecord.customerFirstName,
                                    lastName: customerSubmitRecord.customerLastName,
                                    address: shippingAddress.street,
                                    city: shippingAddress.city,
                                    state: shippingAddress.state,
                                    zip: shippingAddress.zip,
                                    country: country
                                }
                            }
                        }
                    };

                    lineItemArray.forEach(lineItem => {
                        authorizeTransactionObj.createTransactionRequest.transactionRequest.lineItems.lineItem.push(lineItem);
                    });

                    authorizeTransactionObjJSON = JSON.stringify(authorizeTransactionObj);

                    function chargeCustomer() {
                        $.ajax({
                            type: "POST",
                            url: "https://apitest.authorize.net/xml/v1/request.api",
                            async: false,
                            data: authorizeTransactionObjJSON,
                            dataType: "json",
                            success: function(res) {
                                console.log(res);

                                // Set our short text field's value to the newly created record's Knack ID
                                paymentDataUpdate = {
                                    field_309: res.messages.message[0].text.slice(0, res.messages.message[0].text.length - 1),
                                    field_310: res.transactionResponse.transId,
                                    field_284: {
                                        street: shippingAddress.street,
                                        street2: shippingAddress.street2,
                                        city: shippingAddress.city,
                                        state: shippingAddress.state,
                                        zip: shippingAddress.zip
                                    },
                                    field_321: finalRecordOrder.finalOrderTotal
                                };

                                if (res.messages.resultCode === "Ok") {

                                    $("button.kn-button.is-primary:contains('Process Payment')").submit();
                                } else {
                                    alert(messages.resultCode);
                                }
                            },
                            error: error => {
                                alert(error);
                            }
                        });
                    }

                    chargeCustomer();


                }
            },
            error: error => {
                console.log(error);
            }
        });
    });
});

//Payment Portal Submit Record
$(document).on("knack-form-submit.view_293", function(event, view, paymentPortalRecord) {
    paymentID = paymentPortalRecord.id;
    
    try{
        paymentDataUpdate
        console.log(paymentDataUpdate); 
        console.log(JSON.stringify(paymentDataUpdate));
    }
    catch (error){
        console.warn("payment Data Missing");
    }

    let url = "https://api.knack.com/v1/objects/object_41/records/" + paymentID;

    let headers = {
        "X-Knack-Application-ID": KEYS.KNACK_API_ID,
        "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY,
        "content-type": "application/json"
    };

    // Update Payment Status
    $.ajax({
        url: url,
        type: "PUT",
        headers: headers,
        data: JSON.stringify(paymentDataUpdate)
    }).done(function(responseData) {
        console.log(responseData);
    });
});

// Order Summary Render
$(document).on("knack-scene-render.scene_173", function(event, scene) {
    // Checks if orderSubmitRecord is available
    if ($.isEmptyObject(orderSubmitRecord) || orderSubmitRecord === undefined || orderSubmitRecord === null) {
        orderSubmitRecord = localStorageAccess.localOrderSubmitRecord;
    }
    // Checks if customerSubmitRecord is available
    if ($.isEmptyObject(customerSubmitRecord) || customerSubmitRecord === undefined || customerSubmitRecord === null) {
        customerSubmitRecord = localStorageAccess.localCustomerSubmitRecord;
    }

    // Checks if API Keys are available
    if ($.isEmptyObject(AuthorizeNetKeys) || AuthorizeNetKeys === undefined || AuthorizeNetKeys === null) {
        AuthorizeNetKeys = localStorageAccess.localAPIKeys;
    }

    let searchArray = document.querySelectorAll("input[name='keyword']");
    for (let i = 0; i < searchArray.length; i++) {
        searchArray[i].value = orderSubmitRecord.orderID;
    }
    $("a.kn-button.search").trigger("click");

});
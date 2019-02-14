
// const KEYS = {

// };

let productObj;

$(document).on("knack-scene-render.scene_93", function(event, scene) {
  $.ajax({
    type: "GET",
    url: `https://api.knack.com/v1/objects/object_20/records`,
    dataType: "JSON",
    headers: {
      "X-Knack-Application-Id": KEYS.KNACK_API_ID,
      "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
    },
    success: data => {
      productObj = data;
      let renderedFields = {
        zohoIDInput: document.querySelector("input#field_30"),
        callIDInput: document.querySelector("input#field_51"),
        campaignInput: document.querySelector("input#field_31"),
        productSelectField: document.getElementById("view_158-field_187"),
      };

      // Read Only Fields
      renderedFields.zohoIDInput.readOnly = true;
      renderedFields.callIDInput.readOnly = true;
      renderedFields.campaignInput.readOnly = true;
      renderedFields.productSelectField.innerHTML = `<option value="" selected="">Select Product</option>`;

      for (let i = 0; i < data.records.length; i++) {
        if (data.records[i].field_214_raw === renderedFields.campaignInput.value.substring(0, 3)) {
          renderedFields.productSelectField.innerHTML += `<option value="${data.records[i].field_117_raw}">${data.records[i].field_117_raw}</option>`;
        }
      }

    },
    error: error => {
      console.log("Error Obtaining Products");
    }
  });


});

$(document).on("knack-form-submit.view_158", function(event, view, record) {
  console.log(productObj);
  // Field Selectors
  console.log(record);
  let querySelectors = {
    paymentStatus: document.getElementById("pay-status"),
    missingRequired: document.getElementById("missing"),
    sameAsShipping: document.getElementById("field_220")
  };

  let newCustomer;
  // New Customer Object
  if (querySelectors.sameAsShipping.value === "No") {
    newCustomer = {
      customerCallId: record.field_51_raw,
      campaign: record.field_31_raw,
      phoneNumber: record.field_32_raw.formatted,
      email: record.field_35_raw.email,
      ZOHO: record.field_30_raw,
      CC12: record.field_137_raw,
      CVV: record.field_157_raw,
      cardExp: record.field_161_raw,
      recordId: record.id,
      orderItem: record.field_187_raw,
      coupons: record.field_206_raw,
      discount: record.field_215_raw,
      discountType: record.field_216_raw,
      orderItemName: record.field_187_raw,
      orderQuantity: record.field_217_raw,
      name: {
        first: record.field_38_raw.first,
        last: record.field_38_raw.last
      },
      billingAddress: {
        street: record.field_36_raw.street,
        street2: record.field_36_raw.street2,
        city: record.field_36_raw.city,
        state: record.field_36_raw.state,
        zip: record.field_36_raw.zip
      },
      shippingAddress: {
        street: record.field_85_raw.street,
        street2: record.field_85_raw.street2,
        city: record.field_85_raw.city,
        state: record.field_85_raw.state,
        zip: record.field_85_raw.zip
      }
    };
  } else {
    newCustomer = {
      customerCallId: record.field_51_raw,
      campaign: record.field_31_raw,
      phoneNumber: record.field_32_raw.formatted,
      email: record.field_35_raw.email,
      ZOHO: record.field_30_raw,
      CC12: record.field_137_raw,
      CVV: record.field_157_raw,
      cardExp: record.field_161_raw,
      recordId: record.id,
      orderItem: record.field_187_raw,
      coupons: record.field_206_raw,
      discount: record.field_215_raw,
      discountType: record.field_216_raw,
      orderItemName: record.field_187_raw,
      orderQuantity: record.field_217_raw,
      name: {
        first: record.field_38_raw.first,
        last: record.field_38_raw.last
      },
      billingAddress: {
        street: record.field_36_raw.street,
        street2: record.field_36_raw.street2,
        city: record.field_36_raw.city,
        state: record.field_36_raw.state,
        zip: record.field_36_raw.zip
      },
      shippingAddress: {
        street: record.field_36_raw.street,
        street2: record.field_36_raw.street2,
        city: record.field_36_raw.city,
        state: record.field_36_raw.state,
        zip: record.field_36_raw.zip
      }
    };
  }

  // CC4 Connection Filter
  let cc4Object = {
    cc4ObjUrl: "https://api.knack.com/v1/objects/object_22/records",
    cc4ObjRequestFilters: [
      {
        field: "field_144",
        operator: "is",
        value: newCustomer.customerCallId
      }
    ]
  };

  // Unicode URL Query String
  cc4Object.cc4ObjUrl += "?filters=" + encodeURIComponent(JSON.stringify(cc4Object.cc4ObjRequestFilters));

  // Local Storage Keys
  let localStorageKeys = [
    "customerCallId",
    "campaign",
    "phoneNumber",
    "email",
    "CC12",
    "CVV",
    "cardExp",
    "recordId",
    "first",
    "last",
    "billingStreet",
    "billingStreet2",
    "billingCity",
    "billingState",
    "billingZip",
    "shippingStreet",
    "shippingStreet2",
    "shippingCity",
    "shippingState",
    "shippingZip",
    "ZOHO",
    "orderItem",
    "coupons",
    "discount",
    "discountType"
  ];

  // Variables to Test Purchase
  let testingVariables = {
    testAmount: "20.00",
    SKU: "01819869427562",
    productName: "Zona 2",
    productDescription: "Blood Pressure Regulator",
    quantity: "1",
    unitPrice: "349.00"
  };

  // Functions
  function deleteCustomerRecord(ID) {
    $.ajax({
      type: "DELETE",
      url: `https://api.knack.com/v1/objects/object_5/records/${ID}`,
      dataType: "JSON",
      headers: {
        "X-Knack-Application-Id": KEYS.KNACK_API_ID,
        "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
      },
      success: data => {
        console.log(data);
      },
      error: error => {
        console.log("Error Deleting Record");
      }
    });
  }

  $.ajax({
    url: cc4Object.cc4ObjUrl,
    type: "GET",
    headers: {
      "X-Knack-Application-Id": KEYS.KNACK_API_ID,
      "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
    }
  })
    .done(function(CC4) {
      let CC4Data = CC4;
      $.ajax({
        type: "GET",
        url: `https://api.knack.com/v1/objects/object_20/records`,
        dataType: "JSON",
        headers: {
          "X-Knack-Application-Id": KEYS.KNACK_API_ID,
          "X-Knack-REST-API-Key": KEYS.KNACK_API_KEY
        },
        success: productData => {
          if (CC4Data.records.length === 0) {
            localStorage.setItem(localStorageKeys[0],newCustomer.customerCallId);
            localStorage.setItem(localStorageKeys[1], newCustomer.campaign);
            localStorage.setItem(localStorageKeys[2], newCustomer.phoneNumber);
            localStorage.setItem(localStorageKeys[3], newCustomer.email);
            localStorage.setItem(localStorageKeys[4], newCustomer.CC12);
            localStorage.setItem(localStorageKeys[5], newCustomer.CVV);
            localStorage.setItem(localStorageKeys[6], newCustomer.cardExp);
            localStorage.setItem(localStorageKeys[7], newCustomer.recordId);
            localStorage.setItem(localStorageKeys[8], newCustomer.name.first);
            localStorage.setItem(localStorageKeys[9], newCustomer.name.last);

            localStorage.setItem(localStorageKeys[10],newCustomer.billingAddress.street);
            localStorage.setItem(localStorageKeys[11],newCustomer.billingAddress.street2);
            localStorage.setItem(localStorageKeys[12],newCustomer.billingAddress.city);
            localStorage.setItem(localStorageKeys[13],newCustomer.billingAddress.state);
            localStorage.setItem(localStorageKeys[14],newCustomer.billingAddress.zip);
            localStorage.setItem(localStorageKeys[15],newCustomer.shippingAddress.street);
            localStorage.setItem(localStorageKeys[16],newCustomer.shippingAddress.street2);
            localStorage.setItem(localStorageKeys[17],newCustomer.shippingAddress.city);
            localStorage.setItem(localStorageKeys[18],newCustomer.shippingAddress.state);
            localStorage.setItem(localStorageKeys[19],newCustomer.shippingAddress.zip);
            localStorage.setItem(localStorageKeys[20], newCustomer.ZOHO);
            localStorage.setItem(localStorageKeys[21], newCustomer.orderItem);
            localStorage.setItem(localStorageKeys[22], newCustomer.coupons);
            localStorage.setItem(localStorageKeys[23], newCustomer.discount);
            localStorage.setItem(localStorageKeys[24],newCustomer.discountType);

            // Deletes Submitted Record
            deleteCustomerRecord(newCustomer.recordId);

            let localStorageValues = {
              lsvCustomerId: localStorage.getItem(localStorageKeys[0]),
              lsvCampaign: localStorage.getItem(localStorageKeys[1]),
              lsvPhoneNumber: localStorage.getItem(localStorageKeys[2]),
              lsvEmail: localStorage.getItem(localStorageKeys[3]),
              lsvCC12: localStorage.getItem(localStorageKeys[4]),
              lsvCVV: localStorage.getItem(localStorageKeys[5]),
              lsvCardExp: localStorage.getItem(localStorageKeys[6]),
              lsvRecordId: localStorage.getItem(localStorageKeys[7]),
              lsvName: {
                first: localStorage.getItem(localStorageKeys[8]),
                last: localStorage.getItem(localStorageKeys[9])
              },
              lsvBillingAddress: {
                street: localStorage.getItem(localStorageKeys[10]),
                street2: localStorage.getItem(localStorageKeys[11]),
                city: localStorage.getItem(localStorageKeys[12]),
                state: localStorage.getItem(localStorageKeys[13]),
                zip: localStorage.getItem(localStorageKeys[14])
              },
              lsvShippingAddress: {
                street: localStorage.getItem(localStorageKeys[15]),
                street2: localStorage.getItem(localStorageKeys[16]),
                city: localStorage.getItem(localStorageKeys[17]),
                state: localStorage.getItem(localStorageKeys[18]),
                zip: localStorage.getItem(localStorageKeys[19])
              },
              lsvZOHO: localStorage.getItem(localStorageKeys[20]),
              lsvOrderItem: localStorage.getItem(localStorageKeys[21]),
              lsvCoupon: localStorage.getItem(localStorageKeys[22]),
              lsvDiscount: localStorage.getItem(localStorageKeys[23]),
              lsvDiscountType: localStorage.getItem(localStorageKeys[24])
            };

            document.getElementById("field_51").value = localStorageValues.lsvCustomerId; // Customer ID
            document.getElementById("field_35").value = localStorageValues.lsvEmail; // Email
            document.getElementById("field_30").value = localStorageValues.lsvCampaign; // Campaign
            document.getElementById("field_32").value = localStorageValues.lsvPhoneNumber; // Primamry Number
            document.getElementById("first").value = localStorageValues.lsvName.first; // First name
            document.getElementById("last").value = localStorageValues.lsvName.last; // Last name
            document.getElementById("field_137").value = localStorageValues.lsvCC12; // CC12
            document.getElementById("field_157").value = localStorageValues.lsvCVV; //CVV
            document.getElementById("field_161").value = localStorageValues.lsvCardExp; //EXP
            document.getElementById("field_30").value = localStorageValues.lsvZOHO; //ZOHO

            document.querySelector("#kn-input-field_36 .input#street").value = localStorageValues.lsvBillingAddress.street; // Street
            document.querySelector("#kn-input-field_36 .input#street2").value = localStorageValues.lsvBillingAddress.street2; // Street2
            document.querySelector("#kn-input-field_36 .input#city").value = localStorageValues.lsvBillingAddress.city; // City
            document.querySelector("#kn-input-field_36 .input#state").value = localStorageValues.lsvBillingAddress.state; // State
            document.querySelector("#kn-input-field_36 .input#zip").value = localStorageValues.lsvBillingAddress.zip; // zip

            document.querySelector("#kn-input-field_85 .input#street").value = localStorageValues.lsvShippingAddress.street; // Street
            document.querySelector("#kn-input-field_85 .input#street2").value = localStorageValues.lsvShippingAddress.street2; // Street2
            document.querySelector("#kn-input-field_85 .input#city").value = localStorageValues.lsvShippingAddress.city; // City
            document.querySelector("#kn-input-field_85 .input#state").value = localStorageValues.lsvShippingAddress.state; // State
            document.querySelector("#kn-input-field_85 .input#zip").value = localStorageValues.lsvShippingAddress.zip; // zip

            // Populate Products
            document.getElementById("view_158-field_187").innerHTML = `<option value="" selected="">Select Product</option>`;

            for (let i = 0; i < productData.records.length; i++) {
              if (productData.records[i].field_214_raw === localStorageValues.lsvCampaign.substring(0, 3)) {
                document.getElementById("view_158-field_187").innerHTML += `<option value="${productData.records[i].field_117_raw}">${productData.records[i].field_117_raw}</option>`;
              }
            }
            querySelectors.missingRequired.innerHTML ='<span style="color:black;">STATUS:</span> <span style="color:red;">CC4 was not provided by the client, re-submit form when client has entered CC4</span>';
            return;

          } else {
            window.localStorage.clear();

            document.getElementById("view_158-field_187").innerHTML = `<option value="" selected="">Select Product</option>`;

            
            querySelectors.missingRequired.innerHTML = '<span style="color:black;">STATUS:</span> <span style="color:green;">Last 4 Data Obtained</span>';
            let CC4 = CC4Data.records[0].field_142_raw;
            let CC16 = newCustomer.CC12 + CC4;


            let productDetails; 

            for (let i = 0; i < productData.records.length; i++) {
              if (productData.records[i].field_117_raw === document.getElementById("view_158-field_187").value) {
                productDetails = {
                  productName: `${productData.records[i].field_117_raw}`,
                  productSKU: `${productData.records[i].field_118_raw}`,
                  productDescription: `${productData.records[i].field_120_raw}`,
                  productDescription: `${productData.records[i].field_120_raw}`,
                  productPrice: `${productData.records[i].field_121_raw}`,
                  productAvailabilityBool: `${productData.records[i].field_122_raw}`,
                  productAvailabilityString: `${productData.records[i].field_122}`,
                  productCampaign: `${productData.records[i].field_214_raw}`,
                  productID: `${productData.records[i].id}`,
                }
              }
            }

            console.log(productDetails);

            let authorizeTransactionObj = {
              createTransactionRequest: {
                merchantAuthentication: {
                  name: KEYS.AUTHORIZE_API_ID,
                  transactionKey: KEYS.AUTHORIZE_API_TRANSACTION_KEY
                },
                refId: newCustomer.customerCallId,
                transactionRequest: {
                  transactionType: "authCaptureTransaction",
                  amount: testingVariables.testAmount,
                  payment: {
                    creditCard: {
                      cardNumber: CC16,
                      expirationDate: newCustomer.cardExp,
                      cardCode: newCustomer.CVV
                    }
                  },
                  lineItems: {
                    lineItem: {
                      itemId: testingVariables.SKU,
                      name: testingVariables.productName,
                      description: testingVariables.productDescription,
                      quantity: testingVariables.quantity,
                      unitPrice: testingVariables.unitPrice
                    }
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
                  poNumber: "456654",
                  customer: {
                    id: "99999456654"
                  },
                  billTo: {
                    firstName: newCustomer.name.first,
                    lastName: newCustomer.name.last,
                    company: "Souveniropolis",
                    address: newCustomer.billingAddress.street,
                    city: newCustomer.billingAddress.city,
                    state: newCustomer.billingAddress.state,
                    zip: newCustomer.billingAddress.zip,
                    country: "USA"
                  },
                  shipTo: {
                    firstName: newCustomer.name.first,
                    lastName: newCustomer.name.last,
                    address: newCustomer.shippingAddress.street,
                    city: newCustomer.shippingAddress.city,
                    state: newCustomer.shippingAddress.state,
                    zip: newCustomer.shippingAddress.zip,
                    country: "USA"
                  }
                }
              }
            };

            let authorizeTransactionObjJSON = JSON.stringify(authorizeTransactionObj);

            function chargeCustomer() {
              $.ajax({
                type: "POST",
                url: "https://apitest.authorize.net/xml/v1/request.api",
                data: authorizeTransactionObjJSON,
                dataType: "json",
                success: function (res) {
                  console.log(res);
                  if (res.messages.message[0].text !== "Successful.") {
                    querySelectors.missingRequired.innerHTML = '<span style="color:black;">STATUS:</span> <span style="color:red;" >Payment Not Processed.</span>';
                  } else {
                    querySelectors.missingRequired.innerHTML = '<span style="color:black;">STATUS:</span> <span style="color:green;">Thank You, Your payment has been processed successfully.</span>';
                  }
                },
                error: error => {
                  querySelectors.missingRequired.innerHTML = '<span style="color:black;">STATUS:</span><span style="color:red;">Error</span>';
                }
              });
            }

            setTimeout(chargeCustomer, 5000);
          }
        },
        error: error => {
          console.log("Error Obtaining Products");
        }
      });
    })
    .fail(error => {
      console.error("Fatal Error");
    });
});

//https://upsell24.knack.com/order-form#new-customer-form/?view_158_vars=%7B%22field_30%22%3A%22123456789%22%2C%22field_51%22%3A%22111111%22%2C%22field_31%22%3A%22ZON%22%7D

## Requirements

 - [Knack Database](https://www.knack.com/)
 - [Authorize.Net Sandbox](https://developer.authorize.net/hello_world/sandbox/)

## Getting Started

This front end script is proprietary and only functions in the Knack environment.
This application can be used as a reference for future builds that involve using the Knack database system.

## Description

This script is designed to tackle calling centers agent/user experience issues within IVR software.
By creating a responsive order form for call center agents to minimize errors in input and ensure no faulty transactions are made.
Implementing a security feature that collects the last four digits of a credit card using AJAX calls from a secure bot make this process unique 
by triggering more events to occur on a third party application to fulfill purchase orders in a quick and smooth fashion.

## Changes

User Permission
	Only agents (no need for admin accounts)

Overall Form Changes
	Submit inner text should display “Next”
	Refactor code to function with new form layout

Orders Section 
	Read-Only Fields & Pre-populated fields 
	Order ID
	Phone Number (No formatting and value is based on initial call)
	Campaign
	Status Field (Updated through Authorize.net AJAX callback function)
	Gateway ID (Updated through Authorize.net {Transaction ID})
	Remove Details Customer Details from Order Form


Customer Section 
	Customer ID (Auto Increment)
	Phone number (Fetch data from saved variable and make editable)

Line Items 
	Create single line items and pass them to the JSON Object dynamically with push() functions
	Send object array to Authorize to test line items
	Create array object of clients that relate to API keys


## Third Party API

This script uses tools from the Knack API Documentation. 
And uses the Authorize.net API to make transaction requests

## License

[MIT License](README.md) 
import React from "react";

export default function CustomerDetails({ customer }) {
  return (
    <div className="bg-blue-50 border-blue-200 border-l-4 p-4 rounded-md">
      <dl className="grid grid-cols-2 gap-4">
        <dt>Name</dt>
        <dd>{customer.name}</dd>
        <dt>Email Address</dt>
        <dd>name@domain.com</dd>
        <dt>Phone number</dt>
        <dd>+234-000-0000-000</dd>
        <dt>Customer Type</dt>
        <dd>{customer.type}</dd>
        <dt>Utility Provider</dt>
        <dd>{customer.utility}</dd>
        <dt>kW System Size</dt>
        <dd>200</dd>
        <dt>Meter ID</dt>
        <dd>Meter ID</dd>
        <dt>Address</dt>
        <dd>{customer.address}</dd>
        <dt>Date Registered</dt>
        <dd>{customer.date}</dd>
      </dl>
    </div>
  );
}
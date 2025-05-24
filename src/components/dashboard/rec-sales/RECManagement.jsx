"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// import UserDetailCard from "./UserDetailCard";

const mockUsers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    role: "Customer",
    status: "active",
    signUpDate: "15 Jan 2023",
    lastPurchase: "2 days ago",
    totalOrders: 12,
    totalSpent: "$1,245.00"
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    role: "VIP Customer",
    status: "active",
    signUpDate: "10 Feb 2023",
    lastPurchase: "1 day ago",
    totalOrders: 24,
    totalSpent: "$3,780.50"
  },
  {
    id: 3,
    name: "James Wilson",
    email: "james.wilson@example.com",
    role: "Customer",
    status: "inactive",
    signUpDate: "5 Mar 2023",
    lastPurchase: "3 weeks ago",
    totalOrders: 5,
    totalSpent: "$450.00"
  },
  {
    id: 4,
    name: "Sarah Lee",
    email: "sarah.lee@example.com",
    role: "New Customer",
    status: "active",
    signUpDate: "20 Apr 2023",
    lastPurchase: "5 hours ago",
    totalOrders: 2,
    totalSpent: "$189.99"
  },
  {
    id: 5,
    name: "David Kim",
    email: "david.kim@example.com",
    role: "Customer",
    status: "suspended",
    signUpDate: "12 May 2023",
    lastPurchase: "1 month ago",
    totalOrders: 8,
    totalSpent: "$920.75"
  }
];

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "VIP Customer":
        return <Badge variant="gold">VIP</Badge>;
      case "New Customer":
        return <Badge variant="blue">New</Badge>;
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Customer List</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                className="pl-10 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {selectedUser ? (
          <UserDetailCard 
            user={selectedUser} 
            onBack={() => setSelectedUser(null)}
          />
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sign Up Date</TableHead>
                  <TableHead>Last Purchase</TableHead>
                  <TableHead>Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.signUpDate}</TableCell>
                    <TableCell>{user.lastPurchase}</TableCell>
                    <TableCell className="font-medium">{user.totalSpent}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
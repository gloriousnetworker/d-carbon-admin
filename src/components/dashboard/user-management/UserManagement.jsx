"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Lock,
  Mail,
  Phone,
  Trash2,
  Edit,
  Eye,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockUsers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    role: "Admin",
    status: "active",
    lastActive: "2 hours ago",
    createdAt: "15 Jan 2023"
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    phone: "+1 (555) 987-6543",
    role: "Manager",
    status: "active",
    lastActive: "1 day ago",
    createdAt: "10 Feb 2023"
  }
];

const AddUserModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Add New User</span>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input placeholder="Enter full name" />
          </div>
          <div>
            <Label>Email</Label>
            <Input placeholder="Enter email" type="email" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input placeholder="Enter phone number" />
          </div>
          <div>
            <Label>Role</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button>Add User</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const UserDetailModal = ({ user, isOpen, onClose }) => {
  if (!user) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>User Details</span>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <p>{user.email}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <p>{user.phone}</p>
            </div>
            <div>
              <Label>Status</Label>
              <Badge variant={user.status === "active" ? "success" : "destructive"}>
                {user.status}
              </Badge>
            </div>
            <div>
              <Label>Last Active</Label>
              <p>{user.lastActive}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EditUserModal = ({ user, isOpen, onClose }) => {
  if (!user) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Edit User</span>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input defaultValue={user.name} />
          </div>
          <div>
            <Label>Email</Label>
            <Input defaultValue={user.email} type="email" />
          </div>
          <div>
            <Label>Role</Label>
            <Select defaultValue={user.role.toLowerCase()}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select defaultValue={user.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const usersPerPage = 5;
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <Shield className="h-4 w-4 mr-2" />;
      case "Manager":
        return <User className="h-4 w-4 mr-2" />;
      default:
        return <Lock className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* ... rest of the UserManagement component remains the same ... */}
      </div>

      <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <UserDetailModal user={selectedUser} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} />
      <EditUserModal user={selectedUser} isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
    </div>
  );
};

export default UserManagement;